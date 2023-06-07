import { Column, Entity, PrimaryGeneratedColumn,Index } from 'typeorm';

@Entity()
export class Ride_Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Index("ride-idx")
  @Column()
  rideId: number;

  @Index("ride-service-idx")
  @Column()
  serviceId: number;
}
