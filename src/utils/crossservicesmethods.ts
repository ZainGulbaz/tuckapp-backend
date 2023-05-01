import { Ride } from 'src/ride/ride.entity';
import { Driver } from 'src/driver/driver.entity';
import { Repository } from 'typeorm';
export const validateServiceCategory = async (
  driverId: number,
  ride: Ride,
  driverRepository: Repository<Driver>,
): Promise<Boolean> => {
  try {
    const query = `SELECT * FROM driver dr JOIN driver_service sr ON dr.id=sr.driverId WHERE (dr.categoryId=${ride.categoryId} OR sr.serviceId=${ride.serviceId}) AND dr.id=${driverId}`;
    const res = await driverRepository.query(query);
    console.log('response', res);
    if (res.length !== 0) {
      return true;
    }
    throw new Error(
      'The category and service of the driver does not match with the ride',
    );
  } catch (err) {
    throw new Error(
      'There is an error in validating category and service of the driver ' +
        err,
    );
  }
};
