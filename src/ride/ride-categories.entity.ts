import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ride_Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rideId: number;

  @Column()
  categoryId: number;
}
