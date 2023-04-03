import { Injectable, Body, Inject } from '@nestjs/common';
import { CreateRideDto } from './dtos/create.ride.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride } from './ride.entity';
import { responseInterface } from 'src/utils/interfaces/response';
import {
  STATUS_FAILED,
  STATUS_NOTFOUND,
  STATUS_SUCCESS,
} from 'src/utils/codes';
import {
  removeKeysFromBody,
  reverseCoordinates,
  verifyRoleAccess,
} from 'src/utils/commonfunctions';
import { roleEnums, waitingMinutes } from 'src/utils/enums';
import { UpdateRideDto } from './dtos/update.ride.dto';
import { AllRidesDto } from './dtos/all.rides.dtos';
import { PushNotifyService } from './pushnotify.service';
import { RideHelperService } from './ride.helper.service';

@Injectable()
export class RideService {
  constructor(
    @InjectRepository(Ride) private rideRepository: Repository<Ride>,
    @Inject(PushNotifyService)
    private readonly pushNotifyService: PushNotifyService,
    @Inject(RideHelperService)
    private readonly rideHelperService: RideHelperService,
  ) {}

  async createRide(@Body() body: CreateRideDto): Promise<responseInterface> {
    let messages = [],
      statusCode = STATUS_SUCCESS,
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role: body.role,
        allowedRoles: [roleEnums.customer],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      const customerId = body.authId;
      delete body.authId;

      let city = await this.getCityFromRide(body.startLocation);
      let ride = await this.rideRepository.insert({
        ...body,
        customerId,
        city,
        startTime: new Date().getTime(),
      });
      if (ride.raw.insertId > 0) {
        let createdRide = await this.rideRepository.findOne({
          where: [{ id: ride.raw.insertId }],
        });
        data.push(createdRide);
        let responseMessage: string =
          await this.pushNotifyService.notifyDriversForRide(
            body.startLocation,
            body.amount,
          );
        messages[0] = 'The ride has been started successfully';
        messages[1] = responseMessage;
        statusCode = STATUS_SUCCESS;
        return;
      } else {
        throw new Error('The ride was not inserted in the database');
      }
    } catch (err) {
      messages.push('The ride cannot be started');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        messages,
        statusCode,
        data,
      };
    }
  }

  async completedRide(
    id: number,
    body: UpdateRideDto,
  ): Promise<responseInterface> {
    let messages = [],
      statusCode = STATUS_SUCCESS,
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role: body.role,
        allowedRoles: [roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      let ride: Ride = await this.rideRepository.findOneBy({ id });
      let rideTransactionId = '';
      if (ride == null) throw new Error('No ride is present with id ' + id);
      else if (body.authId !== ride.driverId)
        throw new Error('You are not authorized for this ride');
      else if (ride.endTime || ride.transactionId)
        throw new Error('Ride is already completed');
      else {
        rideTransactionId = await this.rideHelperService.createRideTransaction({
          customerId: ride.customerId,
          amount: ride.amount,
          rideId: ride.id,
        });
        if (rideTransactionId) {
          messages[1] = 'The transaction has already been created successfully';
        } else {
          throw new Error('Unable to register the transaction for the ride');
        }
      }
      removeKeysFromBody(['role', 'authId'], body);
      let updatedRide = await this.rideRepository.update(id, {
        endTime: new Date().getTime(),
        transactionId: rideTransactionId,
      });
      if (updatedRide.affected == 1) {
        ride.endTime = new Date().getTime();
        ride.transactionId = rideTransactionId;
        messages[0] = 'The ride has been completed succesfully';
        let notificationResponse =
          await this.pushNotifyService.notifyRideCompletion({
            driverId: ride.driverId,
            customerId: ride.customerId,
            amount: ride.amount,
          });
        messages[1] = notificationResponse;
        statusCode = STATUS_SUCCESS;
        data = [{ ...ride, transactionId: rideTransactionId }];
        return;
      } else {
        messages.push('The ride was not completed succesfully');
        statusCode = STATUS_FAILED;
        return;
      }
    } catch (err) {
      messages.push('The ride was not completed succesfully');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return { messages, statusCode, data };
    }
  }

  async getAvailableRides(
    body: AllRidesDto,
    role: string,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      messages = [],
      data = [];

    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      let { coordinates: currentCoordinates, radius } = body;
      if (currentCoordinates == '') throw new Error('Inavlid Coordinates');

      let availableRides = await this.rideRepository.query(
        `SELECT * from ride where  ISNULL(driverId) AND ST_Distance_Sphere(ST_PointFromText('POINT(${currentCoordinates.replace(
          ',',
          '',
        )})', 4326),ST_PointFromText(CONCAT('POINT(',REPLACE(startLocation,',',''),')'), 4326)) <= ${radius}  AND UNIX_TIMESTAMP()*1000-startTime < 60*${waitingMinutes}*1000  `,
      );

      if (availableRides.length > 0) {
        statusCode = STATUS_SUCCESS;
        messages.push('The rides are fetched successfully');
        data.push(...availableRides);
        return;
      } else {
        statusCode = STATUS_NOTFOUND;
        messages.push(
          `There no rides available at a radius of ${(
            parseInt(radius) / 1000
          ).toFixed(1)} km right now`,
        );
        return;
      }
    } catch (err) {
      console.log(err);
      messages.push('There are no rides available yet');
      messages.push(err.message);
    } finally {
      return {
        messages,
        statusCode,
        data,
      };
    }
  }

  async assignRide(
    id: number,
    driverId: number,
    role: string,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      messages = [],
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      let res = await this.rideRepository
        .createQueryBuilder()
        .update()
        .set({ driverId })
        .where('ISNULL(driverId)')
        .execute();

      if (res.affected > 0) {
        statusCode = STATUS_SUCCESS;
        messages.push('The ride has been assigned to you');
        let ride = await this.rideRepository.findOne({ where: { id } });
        data.push(ride);
        return;
      } else {
        throw new Error('Ride was not updated');
      }
    } catch (err) {
      statusCode = STATUS_FAILED;
      messages.push('The ride cannot be assigned successfully');
    } finally {
      return {
        statusCode,
        messages,
        data,
      };
    }
  }

  async getAllRides(role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      messages = [],
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      let rides = await this.rideRepository.query(
        'SELECT r.id,CONCAT(cu.firstName," ",cu.lastName)customerName,CONCAT(dr.firstName,"",dr.lastName)driverName,cu.phoneNumber customerPhoneNumber, dr.phoneNumber driverPhoneNumber, r.city city ,startTime,endTime,tx.amount FROM ride r JOIN driver dr ON r.driverId = dr.id JOIN customer cu ON r.customerId = cu.id join transaction tx ON r.transactionId = tx.id',
      );
      data = rides;
      messages.push('The rides are fetched successfully');
      statusCode = STATUS_SUCCESS;
    } catch (err) {
      console.log(err);
      messages.push('The rides are not fetched');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        messages,
        data,
      };
    }
  }
  async getCityFromRide(startCoordinates: string) {
    try {
      startCoordinates = reverseCoordinates(startCoordinates);
      console.log(startCoordinates);
      let city = await this.rideRepository.query(
        `SELECT * FROM osmcities WHERE ST_CONTAINS(ST_GEOMFROMTEXT (CONCAT('Polygon((',refined_coordinates,',',SUBSTRING(refined_coordinates,1,INSTR(refined_coordinates,',')-1) ,'))')),POINT(${startCoordinates}))`,
      );
      if (city.length > 0) {
        return city[0].name;
      }
      throw new Error('The service is not available for this city');
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
