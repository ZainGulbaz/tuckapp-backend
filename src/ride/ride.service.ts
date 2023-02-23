import { Injectable, Body } from '@nestjs/common';
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
  verifyRoleAccess,
} from 'src/utils/commonfunctions';
import { roleEnums, waitingMinutes } from 'src/utils/enums';
import { UpdateRideDto } from './dtos/update.ride.dto';
import { AllRidesDto } from './dtos/all.rides.dtos';
@Injectable()
export class RideService {
  constructor(
    @InjectRepository(Ride) private rideRepository: Repository<Ride>,
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

      let ride = await this.rideRepository.insert({ ...body, customerId });
      if (ride.raw.insertId > 0) {
        let createdRide = await this.rideRepository.findOne({
          where: [{ id: ride.raw.insertId }],
        });
        data.push(createdRide);
        messages.push('The ride has been started successfully');
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
        allowedRoles: [roleEnums.customer],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      let ride = await this.rideRepository.findOneBy({ id });
      if (ride == null) throw new Error('No ride is present with id ' + id);

      if (body.authId !== ride.customerId)
        throw new Error('You are not authorized for this ride');
      if (ride.endTime) throw new Error('Ride is already completed');

      removeKeysFromBody(['role', 'authId'], body);
      let updatedRide = await this.rideRepository.update(id, body);
      if (updatedRide.affected == 1) {
        ride.endTime = body.endTime;
        ride.transactionId = body.transactionId;
        messages.push('The ride has been completed succesfully');
        statusCode = STATUS_SUCCESS;
        data = [ride];
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

      const { coordinates: currentCoordinates, radius } = body;
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
}
