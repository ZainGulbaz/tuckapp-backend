import { Injectable } from '@nestjs/common';
import {
  STATUS_FAILED,
  STATUS_NOTFOUND,
  STATUS_SUCCESS,
} from 'src/utils/codes';
import { responseInterface } from 'src/utils/interfaces/response';
import { CreateOfferDto } from './dtos/create.offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { Ride } from 'src/ride/ride.entity';
import { Driver } from 'src/driver/driver.entity';
import { verifyRoleAccess } from 'src/utils/commonfunctions';
import { roleEnums, valueEnums } from 'src/utils/enums';
import { removeKeysFromBody } from 'src/utils/commonfunctions';
import createNotification from 'src/utils/onesignal/createnotifications';
import oneSignalClient from 'src/utils/onesignal';
import { AcceptOfferDto } from './dtos/accept.offer.dto';
import { validateDriverForRideAndOffers } from 'src/utils/crossservicesmethods';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer) private offerRepository: Repository<Offer>,
    @InjectRepository(Ride) private rideRepository: Repository<Ride>,
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
  ) {}
  async createOffer(body: CreateOfferDto): Promise<responseInterface> {
    let message = [],
      data = [],
      statusCode = STATUS_SUCCESS;
    try {
      const { role, authId } = body;
      removeKeysFromBody(['role', 'authId'], body);
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      let ride = await this.rideRepository.findOne({
        where: [{ id: body.rideId }],
      });
      // await validateServiceCategory(authId, ride, this.driverRepository);
      await validateDriverForRideAndOffers(this.driverRepository, authId);
      await this.checkRideValidation(ride);
      ``;
      let createdOffer = await this.offerRepository.insert({
        ...body,
        driverId: authId,
        expiryTime:
          BigInt(new Date().getTime()) + BigInt(process.env.OFFER_EXPIRY_TIME),
      });
      if (createdOffer.raw.affectedRows == 1) {
        //  let notificationResMessage = await this.notifyOfferToCustomer(
        //    body.rideId,
        //   body.amount,
        // );
        console.log(createdOffer);
        await this.driverRepository.update(authId, {
          onOffer: createdOffer.raw.insertId,
        });
        message.push('The offer is successfully send to the customer');
        //message.push(notificationResMessage);
        statusCode = STATUS_SUCCESS;
      } else {
        throw new Error('Error in creating offer');
      }
    } catch (err) {
      message.push('The offer cannot be sent to the customer');
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

  async getOffers(
    rideId: number,
    role: string,
    authId: number,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.customer],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }
      let ride = await this.rideRepository.findOne({ where: [{ id: rideId }] });
      if (ride.customerId !== authId)
        throw new Error('The customer is not authorized for this ride offers');

      await this.checkRideValidation(ride);

      let offers = await this.offerRepository.query(
        `SELECT off.id as id,(Select CONCAT('[',GROUP_CONCAT(DISTINCT(JSON_OBJECT(ct.id,ct.name))),']') from ride rd LEFT JOIN ride_category rc ON rc.rideId=rd.id LEFT JOIN category ct ON ct.id=rc.categoryId WHERE rd.id=${rideId} GROUP BY rd.id Limit 1) rideCategories,JSON_OBJECT(ct.id,ct.name) driverCategory,(Select CONCAT('[',GROUP_CONCAT(DISTINCT(JSON_OBJECT(sr.id,sr.name))),']') from ride rd LEFT JOIN ride_service rs ON rd.id=rs.rideId LEFT JOIN service sr ON sr.id=rs.serviceId WHERE rd.id=${rideId} Group by rd.id Limit 1) rideServices , CONCAT('[',GROUP_CONCAT(DISTINCT(JSON_OBJECT(sr.id,sr.name))),']') driverServices ,off.driverId, off.rideId,off.amount,off.expiryTime,CONCAT(dr.firstName," ",dr.lastName) name,dr.lisencePlate, dr.truckPhoto FROM offer off JOIN driver dr ON off.driverId=dr.id LEFT JOIN category ct ON ct.id=dr.categoryId LEFT JOIN driver_service drs ON drs.driverId=dr.id LEFT JOIN service sr ON sr.id=drs.serviceId WHERE off.rideId=${rideId} AND isCancel=0 AND expiryTime>${new Date().getTime()}  GROUP BY off.id`,
      );
      message.push('The offers are fetched successfully.');
      statusCode = STATUS_SUCCESS;
      data = offers;
    } catch (err) {
      message.push('Unable to fetch offers');
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

  async acceptOffer(body: AcceptOfferDto) {
    let statusCode = STATUS_SUCCESS,
      message = [],
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

      let acceptedOffer: Offer = await this.offerRepository.findOne({
        where: [{ id: body.offerId }],
      });
      if (acceptedOffer) {
        if (new Date().getTime() + '' == acceptedOffer.expiryTime + '')
          throw new Error('The offer has been expired');
        const { rideId, amount, driverId } = acceptedOffer;

        let driverRes = await this.driverRepository.findOne({
          where: {
            id: driverId,
          },
        });
        if (driverRes.onRide !== 0)
          throw new Error('The driver is already completing a ride');

        let ride = await this.rideRepository.findOne({
          where: [{ id: rideId }],
        });
        if (ride.customerId !== body.authId)
          throw new Error('You cannot access other customers ride');
        await this.checkRideValidation(ride);

        const acceptedRide = await this.rideRepository.update(rideId, {
          amount,
          driverId,
        });

        let driverUpdatedRes = await this.driverRepository.update(driverId, {
          onRide: rideId,
          onOffer: valueEnums.driverFree,
        });

        if (driverUpdatedRes.affected < 1)
          throw new Error('The driver is not updated successfully');
        if (acceptedRide.affected !== 1)
          throw new Error('Unable to update the ride');

        // let [driver] = await this.rideRepository.query(
        //   `SELECT * FROM driver WHERE id=${driverId}`,
        // );
        // let [customer] = await this.rideRepository.query(
        //   `SELECT * FROM customer WHERE id=${ride.customerId}`,
        // );
        // let notifyResponseMessage = await this.notifyAcceptedOffers({
        //   driverToken: driver.oneSignalToken,
        //   customerToken: '',
        //   amount: ride.amount,
        //   customerName: customer.firstName + ' ' + customer.lastName,
        //   driverName: driver.firstName + ' ' + driver.lastName,
        // });
        message.push('The offer has been accepted successfully');
        message.push('The ride has been updated successfully');
        // message.push(notifyResponseMessage);
        statusCode = STATUS_SUCCESS;
      } else {
        throw new Error('Could not find the offer for given offerId');
      }
    } catch (err) {
      message.push('The offer was not accepted successfully');
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

  async cancelOffer(offerId: number, role: string): Promise<responseInterface> {
    let message = [],
      statusCode = STATUS_SUCCESS,
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.customer],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }
      let [offer] = await this.offerRepository.query(
        `SELECT off.isCancel,off.driverId driverId, rd.driverId rideDriverId, CONCAT(cu.firstName,' ',cu.lastName) customerName FROM ride rd JOIN offer off ON rd.id=off.rideId JOIN customer cu ON cu.id=rd.customerId WHERE off.id=${offerId} Limit 1`,
      );
      if (offer.driverId) {
        if (offer.rideDriverId !== null)
          throw new Error('The ride is already assigned to a driver');
        let updateOffer = await this.offerRepository.update(offerId, {
          isCancel: 1,
        });
        if (updateOffer.affected < 1)
          throw new Error('The offer object is not updated successfully');

        let driver = await this.driverRepository.findOne({
          where: { id: offer.driverId },
        });
        let notificationResponse = await this.notifyCanceledOffer(
          driver.oneSignalToken,
          offer.customerName,
        );
        message.push('The offer is canceled successfully');
        message.push(notificationResponse);
        statusCode = STATUS_SUCCESS;
      } else throw new Error('The offer with this offerId does not exist');
    } catch (err) {
      message.push('The offer cannot be canceled successfully');
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

  async getLatestCancelOffer(
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
      let canceledOffer = await this.offerRepository.query(
        `SELECT * FROM offer WHERE driverId=${driverId} AND isCancel=1 ORDER BY expiryTime DESC LIMIT 1`,
      );
      if (canceledOffer.length !== 0 && canceledOffer[0]['isNotified'] == 0) {
        [data] = canceledOffer;
        await this.offerRepository.update(data['id'], { isNotified: 1 });
        message.push('The latest canceled offer has been found');
        statusCode = STATUS_SUCCESS;
      } else {
        message.push('There are no latest canceled offers found');
        statusCode = STATUS_NOTFOUND;
        data = [];
      }
    } catch (err) {
      console.log(err);
      message.push('The latest canceled offer cannot be found successfully');
      data = [];
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async notifyOfferToCustomer(rideId: number, amount: number) {
    try {
      let customer = await this.rideRepository.query(
        `SELECT * FROM customer JOIN ride ON ride.customerId=customer.id WHERE ride.id=${rideId} `,
      );
      if (customer) {
        [customer] = customer;
        const { oneSignalToken } = customer;
        if (!oneSignalToken)
          throw new Error('No one signal token is present for the customer');
        let notification = createNotification(
          'A new offer from the driver',
          { en: `A new offer from the driver AED: ${amount}` },
          [oneSignalToken],
        );
        let response = await oneSignalClient.createNotification(notification);
        return 'The push notification is send successfully.';
      } else {
        throw new Error('Cannot find any ride for this ride Id');
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async checkRideValidation(ride: Ride) {
    console.log(ride);
    try {
      if (ride == null) throw new Error('The ride id provided is invalid');
      else if (
        new Date().getTime() - ride.startTime >
        parseInt(process.env.RIDE_EXPIRY_TIME)
      )
        throw new Error('The ride has been expired');
      else if (ride.endTime) throw new Error('The ride is completed already');
      else if (ride.driverId)
        throw new Error('The ride is already assigned to a driver');
      else if (ride.isCancel == 1)
        throw new Error('The ride is canceled already');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async notifyAcceptedOffers({
    driverToken,
    customerToken,
    amount,
    driverName,
    customerName,
  }) {
    try {
      let notification = createNotification(
        'The ride has been started',
        {
          en: `customer:${customerName}  driver:${driverName}  amount:AED ${amount}`,
        },
        [driverToken, customerToken],
      );
      let response = await oneSignalClient.createNotification(notification);
      return 'The push notifications has been successfully send';
    } catch (err) {
      return (
        'Unable to notify customer and driver for accepted offer:  ' +
        err.message
      );
    }
  }

  async notifyCanceledOffer(driverToken: string, customerName: string) {
    try {
      let notification = createNotification(
        'The offer has been canceled',
        {
          en: `Your offer has been canceled by ${customerName}. You can make a new offer`,
        },
        [driverToken],
      );
      let response = await oneSignalClient.createNotification(notification);
      return 'The push notifications has been successfully send';
    } catch (err) {
      return 'Unable to notify driver for the canceled offer :  ' + err.message;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async freeDriversOffer() {
    try {
      console.log(
        'CRON is running to release offers after ===>' +
          (parseInt(process.env.OFFER_EXPIRY_TIME) / 1000).toFixed(2) +
          ' seconds',
      );
      
      await this.driverRepository.query(
        `UPDATE driver SET onOffer=0 WHERE id IN (Select driverId from offer where isCancel=0 AND expiryTime<${BigInt(new Date().getTime())})`,
      );
      await this.offerRepository.query(
        `UPDATE offer SET isCancel=${
          valueEnums.offerCancel
        } WHERE expiryTime<${BigInt(new Date().getTime())} AND isCancel=0`,
      );
    
    } catch (err) {
      console.log('ERROR IN FreeDriversOffer crons');
      console.log(err.message);
      console.log(err);
    }
  }
}
