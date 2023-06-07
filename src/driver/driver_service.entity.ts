import { Entity, Column, PrimaryGeneratedColumn, ManyToOne,Index } from 'typeorm';
import { Driver } from './driver.entity';
import { Service } from 'src/services/services.entity';

@Entity()
export class Driver_Service {
  @PrimaryGeneratedColumn()
  id: number;


  @Index("driver-service-idx")
  @Column()
  serviceId: number;

  @Index("driverId,service-idx")
  @Column()
  driverId: number;

  @ManyToOne(() => Driver, (driver) => driver.driverServices)
  driver: Driver;

  @ManyToOne(() => Service, (services) => services.id)
  service: Service;
}
