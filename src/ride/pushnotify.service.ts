import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import oneSignalClient from 'src/utils/onesignal';
import * as oneSignal from 'onesignal-node';
import createNotification from 'src/utils/onesignal/createnotifications';
import { Driver } from 'src/driver/driver.entity';
import { Customer } from 'src/customer/customer.entity';

@Injectable()
export class PushNotifyService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async implementNotification(notificationBody: {
    title: string;
    content: { en: string };
    includedPlayerIds: string[];
  }) {
    try {
      let notification = createNotification(
        notificationBody.title,
        notificationBody.content,
        notificationBody.includedPlayerIds,
      );
      const response = await oneSignalClient.createNotification(notification);
      return 'The notifications are successfully send to near by drivers';
    } catch (e) {
      if (e instanceof oneSignal.HTTPError) {
        console.log(e);
        throw new Error(e.message);
      }
    }
  }

  async notifyDriversForRide(
    startLocation: string,
    amount: number,
  ): Promise<string> {
    try {
      let drivers = await this.driverRepository.query(
        `SELECT * from driver WHERE ST_Distance_Sphere(ST_PointFromText('POINT(${startLocation.replace(
          ',',
          '',
        )})', 4326),ST_PointFromText(CONCAT('POINT(',REPLACE(currentCoordinates,',',''),')'), 4326)) <= ${
          process.env.RIDE_MAX_DISTANCE
        } `,
      );
      let driversToken = [];
      let title = 'A new ride is available';
      let content = { en: `Amount:${amount}  Distance` };
      drivers?.map((driver: Driver) => {
        if (driver.oneSignalToken) driversToken.push(driver.oneSignalToken);
      });
      let responseMessage = await this.implementNotification({
        title,
        content,
        includedPlayerIds: driversToken,
      });
      return responseMessage;
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }

  async notifyRideCompletion({
    driverId,
    customerId,
    amount,
  }: {
    driverId: number;
    customerId: number;
    amount: number;
  }) {
    try {
      let driver: Driver = await this.driverRepository.findOne({
        where: { id: driverId },
      });
      let customer: Customer = await this.customerRepository.findOne({
        where: { id: customerId },
      });
      let oneSignalTokens: string[] = [];
      if (driver.oneSignalToken) oneSignalTokens.push(driver.oneSignalToken);
      if (customer.oneSignalToken)
        oneSignalTokens.push(customer.oneSignalToken);
      await this.implementNotification({
        title: 'The ride has been completed',
        content: { en: `Ride Amount: AED${amount}` },
        includedPlayerIds: oneSignalTokens,
      });
      return 'The ride completion notifications are successfully sent to driver and customer';
    } catch (err) {
      throw new Error(
        'Error in notifying driver and customer for the ride completion  ' +
          err.message,
      );
    }
  }
}