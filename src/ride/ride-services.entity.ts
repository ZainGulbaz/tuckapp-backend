import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ride_Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rideId: number;

  @Column()
  serviceId: number;
}
