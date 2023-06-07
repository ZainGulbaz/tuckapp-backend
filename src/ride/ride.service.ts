import { Injectable, Body, Inject } from '@nestjs/common';
import { CreateRideDto } from './dtos/create.ride.dto';
import { InjectRepository,InjectDataSource } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Ride } from './ride.entity';
import { Driver } from 'src/driver/driver.entity';
import { Ride_Service } from './ride-services.entity';
import { Ride_Category } from './ride-categories.entity';
import { Offer } from 'src/offer/offer.entity';
import { responseInterface } from 'src/utils/interfaces/response';
import {
  STATUS_FAILED,
  STATUS_NOTFOUND,
  STATUS_NO_CONTENT,
  STATUS_SUCCESS,
} from 'src/utils/codes';
import {
  parseNull,
  removeKeysFromBody,
  reverseCoordinates,
  verifyRoleAccess,
} from 'src/utils/commonfunctions';
import { roleEnums } from 'src/utils/enums';
import { UpdateRideDto } from './dtos/update.ride.dto';
import { AllRidesDto } from './dtos/all.rides.dtos';
import { PushNotifyService } from './pushnotify.service';
import { RideHelperService } from './ride.helper.service';
import { checkDriverOnOffer, validateRideForDriver } from 'src/utils/crossservicesmethods';

@Injectable()
export class RideService {
  constructor(
    @InjectRepository(Ride) private rideRepository: Repository<Ride>,
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @Inject(PushNotifyService)
    private readonly pushNotifyService: PushNotifyService,
    @Inject(RideHelperService)
    private readonly rideHelperService: RideHelperService,
    @InjectRepository(Ride_Service)
    private rideServiceRepository: Repository<Ride_Service>,
    @InjectRepository(Ride_Category)
    private rideCategoryRepository: Repository<Ride_Category>,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>

  ) {}

  async createRide(@Body() body: CreateRideDto): Promise<responseInterface> {
    let message = [],
      statusCode = STATUS_SUCCESS,
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role: body.role,
        allowedRoles: [roleEnums.customer],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      body.startLocation = body.startLocation.trim();
      body.endLocation ? (body.endLocation = body.endLocation.trim()) : null;

      // await this.validateRideLocation(body);

      let { categories, services, authId: customerId } = body;
      delete body.authId;
      delete body.categories;
      delete body.services;

      let ride = await this.rideRepository.insert({
        ...body,
        customerId,
        startTime: new Date().getTime(),
      });
      if (categories) {
        let categoriesBody = await this.refineJoinTableData(
          ride.raw.insertId,
          JSON.parse(categories),
          'category',
        );
        let res = await this.rideCategoryRepository.insert(categoriesBody);
        if (res.raw.insertId < 1)
          throw new Error(
            'Error in inserting ride_category join table for mapping',
          );
      }

      if (services) {
        let servicesBody = await this.refineJoinTableData(
          ride.raw.insertId,
          JSON.parse(services),
          'service',
        );

        let res = await this.rideServiceRepository.insert(servicesBody);
        if (res.raw.insertId < 1)
          throw new Error(
            'Error in inserting ride_service join table for mapping',
          );
      }

      if (ride.raw.insertId > 0) {
        let createdRide = await this.rideRepository.findOne({
          where: [{ id: ride.raw.insertId }],
        });
        data.push(createdRide);
        let responseMessage: string =
          await this.pushNotifyService.notifyDriversForRide(
            body.startLocation,
            body.amount,
            categories,
            services,
          );

        message[0] = 'The ride has been created successfully';
        message[1] = responseMessage;
        statusCode = STATUS_SUCCESS;
        return;
      } else {
        throw new Error('The ride was not inserted in the database');
      }
    } catch (err) {
      console.log(err);
      message.push('The ride cannot be started');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        message,
        statusCode,
        data,
      };
    }
  }

  async completedRide(
    id: number,
    body: UpdateRideDto,
  ): Promise<responseInterface> {
    let message = [],
      statusCode = STATUS_SUCCESS,
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role: body.role,
        allowedRoles: [roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      let freeDriver = await this.driverRepository.update(body.authId, {
        onRide: 0,
      });
      if (freeDriver.affected < 1)
        throw new Error('The driver is not updated successfully');

      let ride: Ride = await this.rideRepository.findOneBy({ id });
      let rideTransactionId = '';
      if (ride == null) throw new Error('No ride is present with id ' + id);
      else if (body.authId !== ride.driverId)
        throw new Error('You are not authorized for this ride');
      else if (ride.endTime || ride.transactionId)
        throw new Error('Ride is already completed');
      else if (ride.isCancel == 1)
        throw new Error('The ride is canceled already');
      else {
        rideTransactionId = await this.rideHelperService.createRideTransaction({
          customerId: ride.customerId,
          amount: ride.amount,
          rideId: ride.id,
        });
        if (rideTransactionId) {
          message[1] = 'The transaction has already been created successfully';
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
        message[0] = 'The ride has been completed succesfully';
        let notificationResponse =
          await this.pushNotifyService.notifyRideCompletion({
            driverId: ride.driverId,
            customerId: ride.customerId,
            amount: ride.amount,
          });
        message[1] = notificationResponse;
        statusCode = STATUS_SUCCESS;
        data = [{ ...ride, transactionId: rideTransactionId }];
        return;
      } else {
        message.push('The ride was not completed succesfully');
        statusCode = STATUS_FAILED;
        return;
      }
    } catch (err) {
      message.push('The ride was not completed succesfully');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return { message, statusCode, data };
    }
  }

  async getAvailableRides(
    body: AllRidesDto,
    role: string,
    authId: number,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];

    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      let { coordinates: currentCoordinates, radius } = body;

      if(await checkDriverOnOffer(authId,this.offerRepository)){
        message.push("You cannot access new rides until your previous offer is accepted/rejected");
        statusCode=STATUS_NO_CONTENT;
        return;
      }
      
      if (currentCoordinates == '') throw new Error('Inavlid Coordinates');
      await validateRideForDriver(this.driverRepository, authId);
      

      let query = `SELECT rd.id ,startTime, endTime, startLocation,pickupAddress, destinationAddress ,endLocation,rd.amount,rd.city,CONCAT('[',GROUP_CONCAT(DISTINCT( JSON_OBJECT(sr.id,sr.name))),']') services , CONCAT('[',GROUP_CONCAT(DISTINCT( JSON_OBJECT(ct.id,ct.name))),']') categories FROM  ride rd LEFT JOIN ride_category rc ON rd.id=rc.rideId LEFT JOIN category ct ON ct.id=rc.categoryId LEFT JOIN driver dr ON dr.categoryId=rc.categoryId LEFT JOIN ride_service rs ON rs.rideId=rd.id  LEFT JOIN service sr ON sr.id=rs.serviceId LEFT JOIN driver_service drs ON drs.serviceId=rs.serviceId WHERE ISNULL(rd.driverId) AND ST_Distance_Sphere(ST_PointFromText('POINT(${currentCoordinates.replace(
        ',',
        ' ',
      )})', 4326),ST_PointFromText(CONCAT('POINT(',REPLACE(startLocation,',',' '),')'), 4326)) <= ${parseNull(
        radius,
      )}  AND ((UNIX_TIMESTAMP() *1000)-startTime) < ${
        process.env.RIDE_EXPIRY_TIME
      }  AND (drs.driverId=${authId} OR dr.id=${authId}) AND rd.isCancel=0 AND rd.city=dr.city GROUP BY rd.id  `;
      let availableRides = await this.rideRepository.query(query);
      if (availableRides.length > 0) {
        statusCode = STATUS_SUCCESS;
        message.push('The rides are fetched successfully');
        data.push(...availableRides);
        return;
      } else {
        statusCode = STATUS_NOTFOUND;
        message.push(
          `There no rides available at a radius of ${(
            parseInt(radius) / 1000
          ).toFixed(1)} km right now`,
        );
        return;
      }
    } catch (err) {
      message.push('There are no rides available yet');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        message,
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
      message = [],
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      await validateRideForDriver(this.driverRepository, driverId);
      let ride = await this.rideRepository.findOne({ where: { id } });
      if (ride.isCancel == 1)
        throw new Error('The ride is canceled by the customer');
      //await validateServiceCategory(driverId, ride, this.driverRepository);

      let driverRes = await this.driverRepository.findOne({
        where: {
          id: driverId,
        },
      });
      if (driverRes.onRide !== 0)
        throw new Error('The driver is already completing a ride');

      let res = await this.rideRepository
        .createQueryBuilder()
        .update()
        .set({ driverId })
        .where('ISNULL(driverId)')
        .andWhere(`id=${id}`)
        .execute();

      if (res.affected > 0) {
        statusCode = STATUS_SUCCESS;
        let driverResponse = await this.driverRepository.update(driverId, {
          onRide: id,
        });
        if (driverResponse.affected < 1)
          throw new Error('The driver was not updated successfully');
        message.push('The ride has been assigned to you');
        data.push({ ...ride, driverId });
        return;
      } else {
        throw new Error('Ride was not updated');
      }
    } catch (err) {
      statusCode = STATUS_FAILED;
      message.push('The ride cannot be assigned successfully');
      message.push(err.message);
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async getAllRides(role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      let rides = await this.rideRepository.query(
        'SELECT r.id,CONCAT(cu.firstName," ",cu.lastName)customerName,CONCAT(dr.firstName,"",dr.lastName)driverName,cu.phoneNumber customerPhoneNumber, dr.phoneNumber driverPhoneNumber, r.city city ,startTime,endTime,tx.amount FROM ride r JOIN driver dr ON r.driverId = dr.id JOIN customer cu ON r.customerId = cu.id join transaction tx ON r.transactionId = tx.id',
      );
      data = rides;
      message.push('The rides are fetched successfully');
      statusCode = STATUS_SUCCESS;
    } catch (err) {
      console.log(err);
      message.push('The rides are not fetched');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async getCurrentRide(id: number, role: string) {
    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.customer, roleEnums.driver],
      });
      if (isAllowed !== true) {
        return {
          statusCode: isAllowed.statusCode,
          message: isAllowed.message,
          data: [],
        };
      }
      if (role == roleEnums.customer)
        return await this.getCustomerCurrentRide(id);
      else if (role == roleEnums.driver)
        return await this.getDriverCurrentRide(id);
    } catch (err) {
      return {
        message: ['Error in getting current ride', err.message],
        statusCode: STATUS_FAILED,
        data: [],
      };
    }
  }

  async getDriverCurrentRide(driverId: number) {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];
    try {
      let driverCurrentRide = await this.driverRepository.findOne({
        where: { id: driverId },
      });
      if (driverCurrentRide.onRide < 1)
        throw new Error('There is currently no ride assigned to the driver');
      let currentRide = await this.rideRepository.findOne({
        where: { id: driverCurrentRide.onRide, isCancel: 0 },
      });
      if (!currentRide)
        throw new Error('Error in getting ride for the specific driver');
      data = [currentRide];
      statusCode = STATUS_SUCCESS;
      message.push('The current ride of the driver is successfully fetched');
    } catch (err) {
      console.log(err);
      message.push('The current ride of the driver is not fetched');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async getCustomerCurrentRide(customerId: number): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];
    try {
      let rides = await this.rideRepository.query(
        `SELECT rd.id id, startLocation, endLocation, rd.customerId, rd.driverId, rd.startTime, rd.endTime, rd.transactionId, rd.city, rd.amount, rd.country,dr.currentCoordinates driverLocation ,rd.pickupAddress, rd.destinationAddress, CONCAT('[',GROUP_CONCAT(DISTINCT(IF(s.id IS NULL,'',JSON_OBJECT('id',s.id,'name',s.name)))),']') services,CONCAT('[',GROUP_CONCAT(DISTINCT(IF(c.id IS NULL,'',JSON_OBJECT('id',c.id,'name',c.name)))),']')  categories FROM ride rd LEFT JOIN ride_service rs ON rd.id=rs.rideId LEFT JOIN service s ON rs.serviceId=s.id LEFT JOIN ride_category rc ON rc.rideId=rd.id LEFT JOIN category c ON rc.categoryId=c.id LEFT JOIN driver dr ON rd.driverId=dr.id WHERE customerId=${customerId} AND endTime IS NULL AND transactionId IS NULL AND startTime >${
          new Date().getTime() - 24 * 60 * 60 * 1000
        } AND (driverId IS NOT NULL OR startTime>${
          new Date().getTime() - parseInt(process.env.RIDE_EXPIRY_TIME)
        }) AND rd.isCancel=0 GROUP BY rd.id`,
      );

      data = rides;
      statusCode = STATUS_SUCCESS;
      message.push('The ride has been fetched successfully');
    } catch (err) {
      message.push('The customer ride is not fetched successfully');
      message.push(err.message);
      statusCode = STATUS_FAILED;
      data = [];
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async cancelRide(rideId: number, role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      data = [],
      message = [];
    try {
      let isAllowed = verifyRoleAccess({
        role: role,
        allowedRoles: [roleEnums.customer],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      let ride = await this.rideRepository.findOne({ where: { id: rideId } });

      if (ride == null)
        throw new Error('There is no ride with id in the database');
      else if (ride.isCancel == 1) {
        message.push('The ride is already cancelled');
        statusCode = STATUS_FAILED;
        return;
      } else if (ride.endTime) {
        message.push('The ride is already completed');
        statusCode = STATUS_FAILED;
        return;
      }

      let canceledRide = await this.rideRepository.update(rideId, {
        isCancel: 1,
      });
      if (canceledRide.affected > 0) {
        await this.driverRepository.query(
          `UPDATE driver SET onRide=0 where onRide=${rideId}`,
        );
        message.push('The ride has been canceled successfully');
        statusCode = STATUS_SUCCESS;
        return;
      }
      throw new Error('The ride is not updated in the database');
    } catch (err) {
      message = ['The ride is not canceled successfully', err.message];
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        data,
        message,
      };
    }
  }


  async checkRideAvailability(
    rideId: number,
    role: string,
  ): Promise<responseInterface> {

    let statusCode = STATUS_SUCCESS,
    data = [],
    message = [];
    

    try {

      let isAllowed = verifyRoleAccess({
        role: role,
        allowedRoles: [roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }
     

      let ride = await this.rideRepository.findOne({
        where: {
          id: rideId,
          isCancel: 0,
          startTime: MoreThan(
            new Date().getTime() - parseInt(process.env.RIDE_EXPIRY_TIME),
          ),
          endTime:IsNull()
        },
      });
      if (ride) {
        message.push(
          'The ride is still available and you can make offer for it',
        );
        data = [ride];
        statusCode = STATUS_SUCCESS;
        return;
      }
      message.push('The ride is not available any more');
      statusCode = STATUS_NOTFOUND;
      data = [];
    } catch (error) {
      message.push('There is error in fetching the available ride');
      message.push(error.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        data,
        message,
      };
    }
  }

  async getCityFromRide(startCoordinates: string) {
    try {
      startCoordinates = reverseCoordinates(startCoordinates);
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

  async validateRideLocation(body: CreateRideDto) {
    try {
      if (
        body.services &&
        (body.endLocation || body.destinationAddress) &&
        !body.categories
      )
        throw new Error('End location/Address is not valid for this request');
      else if (
        !body.services &&
        (!body.endLocation || !body.destinationAddress)
      )
        throw new Error(
          'End Location/Address must be specified for this request',
        );
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async refineJoinTableData(
    rideId: number,
    entityData: number[],
    entityName: string,
  ): Promise<object[]> {
    try {
      let refinedData = entityData?.map((id) => {
        return { rideId, [entityName + 'Id']: id };
      });
      return refinedData;
    } catch (err) {
      throw new Error('Error in refining data for join table ' + err.message);
    }
  }

  
}
