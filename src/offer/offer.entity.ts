import { Column, Entity, PrimaryGeneratedColumn, Unique, Index } from 'typeorm';

@Entity()
@Unique(['rideId', 'driverId'])
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rideId: number;

  @Column()
  driverId: number;

  @Column()
  amount: number;

  @Column({ default: 0 })
  isCancel: number;

  @Column({
    type: 'bigint',
  })
  expiryTime: BigInt;
}
