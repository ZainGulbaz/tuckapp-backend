import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()

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

  @Column({default:0})
  isNotified:number;
}
