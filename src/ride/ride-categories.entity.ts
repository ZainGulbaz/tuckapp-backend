import { Column, Entity, PrimaryGeneratedColumn,Index } from 'typeorm';

@Entity()
export class Ride_Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Index("category-ride-idx")
  @Column()
  rideId: number;

  @Index("category-idx")
  @Column()
  categoryId: number;
}
