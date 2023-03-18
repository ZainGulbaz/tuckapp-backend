import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import oneSignalClient from 'src/utils/onesignal';
import * as oneSignal from 'onesignal-node';
import createNotification from 'src/utils/onesignal/createnotifications';
import { Driver } from 'src/driver/driver.entity';

@Injectable()
export class PushNotifyService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
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
  ): Promise<boolean> {
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
      await this.implementNotification({
        title,
        content,
        includedPlayerIds: driversToken,
      });
      return true;
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
}
