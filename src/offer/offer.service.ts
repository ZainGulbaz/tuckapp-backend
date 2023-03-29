import { Injectable } from '@nestjs/common';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';
import { responseInterface } from 'src/utils/interfaces/response';
import { CreateOfferDto } from './dtos/create.offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { Ride } from 'src/ride/ride.entity';
import { verifyRoleAccess } from 'src/utils/commonfunctions';
import { roleEnums } from 'src/utils/enums';
import { removeKeysFromBody } from 'src/utils/commonfunctions';
import createNotification from 'src/utils/onesignal/createnotifications';
import oneSignalClient from 'src/utils/onesignal';
import { AcceptOfferDto } from './dtos/accept.offer.dto';
@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer) private offerRepository: Repository<Offer>,
    @InjectRepository(Ride) private rideRepository: Repository<Ride>,
  ) {}
  async createOffer(body: CreateOfferDto): Promise<responseInterface> {
    let messages = [],
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
        messages = isAllowed.messages;
        return;
      }

      await this.checkRideValidation(
        await this.rideRepository.findOne({ where: [{ id: body.rideId }] }),
      );

      let createdOffer = await this.offerRepository.insert({
        ...body,
        driverId: authId,
        expiryTime:
          BigInt(new Date().getTime()) + BigInt(process.env.OFFER_EXPIRY_TIME),
      });
      if (createdOffer.raw.affectedRows == 1) {
        let notificationResMessage = await this.notifyOfferToCustomer(
          body.rideId,
          body.amount,
        );
        messages.push('The offer is successfully send to the customer');
        messages.push(notificationResMessage);
        statusCode = STATUS_SUCCESS;
      } else {
        throw new Error('Error in creating offer');
      }
    } catch (err) {
      messages.push('The offer cannot be sent to the customer');
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

  async getOffers(
    rideId: number,
    role: string,
    authId: number,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      messages = [],
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.customer],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }
      let ride = await this.rideRepository.findOne({ where: [{ id: rideId }] });
      if (ride.customerId !== authId)
        throw new Error('The customer is not authorized for this ride offers');

      await this.checkRideValidation(ride);

      let offers = await this.offerRepository.find({
        where: [
          {
            rideId,
            expiryTime: MoreThan(new Date().getTime()),
          },
        ],
      });

      messages.push('The offers are fetched successfully.');
      statusCode = STATUS_SUCCESS;
      data = offers;
    } catch (err) {
      messages.push('Unable to fetch offers');
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

  async acceptOffer(body: AcceptOfferDto) {
    let statusCode = STATUS_SUCCESS,
      messages = [],
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
      let acceptedOffer: Offer = await this.offerRepository.findOne({
        where: [{ id: body.offerId }],
      });
      if (acceptedOffer) {
        if (BigInt(new Date().getTime()) > acceptedOffer.expiryTime)
          throw new Error('The offer has been expired');
        const { rideId, amount, driverId } = acceptedOffer;
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
        if (acceptedRide.affected !== 1)
          throw new Error('Unable to update the ride');

        let [driver] = await this.rideRepository.query(
          `SELECT * FROM driver WHERE id=${driverId}`,
        );
        let [customer] = await this.rideRepository.query(
          `SELECT * FROM customer WHERE id=${ride.customerId}`,
        );
        let notifyResponseMessage = await this.notifyAcceptedOffers({
          driverToken: driver.oneSignalToken,
          customerToken: '',
          amount: ride.amount,
          customerName: customer.firstName + ' ' + customer.lastName,
          driverName: driver.firstName + ' ' + driver.lastName,
        });
        messages.push('The offer has been accepted successfully');
        messages.push('The ride has been updated successfully');
        messages.push(notifyResponseMessage);
        statusCode = STATUS_SUCCESS;
      } else {
        throw new Error('Could not find the offer for given offerId');
      }
    } catch (err) {
      messages.push('The offer was not accepted successfully');
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
          { en: `I will take you at AED ${amount}` },
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
}
