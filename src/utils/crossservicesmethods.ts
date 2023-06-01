import { Ride } from 'src/ride/ride.entity';
import { Driver } from 'src/driver/driver.entity';
import { Repository } from 'typeorm';
import { valueEnums } from './enums';
export const validateServiceCategory = async (
  driverId: number,
  ride: Ride,
  driverRepository: Repository<Driver>,
): Promise<Boolean> => {
  try {
    // const query = `SELECT * FROM driver dr JOIN driver_service sr ON dr.id=sr.driverId`;
    // WHERE (dr.categoryId=${ride.categoryId} OR sr.serviceId=${ride.serviceId}) AND dr.id=${driverId}`;
    const query =
      'SELECT * from ride LEFT JOIN ride_service rs ON rd.id=rs.rideId LEFT JOIN ride_category rc ON rd.id=rc.rideId';
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

export const validateDriverForRideAndOffers = async (
  driverRepository: Repository<Driver>,
  driverId: number,
  filters:{
    onOffer?:boolean
  }={onOffer:false}
) => {
  try {
    let driver = await driverRepository.findOne({ where: { id: driverId } });
    if (!driver.id) throw new Error('No driver found for the it');
    else if (driver.onRide > valueEnums.driverFree)
      throw new Error('The driver is already completing a ride');
    else if (driver.onRide == valueEnums.driverOnChat)
      throw new Error('The driver is in a chat session with the customer');
    else if(driver.onOffer>valueEnums.driverFree && filters.onOffer)
     throw new Error("The driver is in offer with the customer");
  } catch (err) {
    throw new Error(err.message);
  }
};
