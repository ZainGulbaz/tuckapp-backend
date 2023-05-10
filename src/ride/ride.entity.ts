import { Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Entity } from 'typeorm';

@Entity()
export class Ride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  startLocation: string;

  @Column({ nullable: true })
  endLocation: string;

  @Column({ nullable: false })
  customerId: number;

  @Column({ nullable: true })
  driverId: number;

  @Column({ nullable: false, type: 'bigint' })
  startTime: number;

  @Column({ nullable: true, type: 'bigint' })
  endTime: number;

  @Column({ nullable: true, unique: true, type: 'longtext' })
  transactionId: string;

  @Column({nullable:false})
  pickupAddress:string;

  @Column({nullable:false})
  destinationAddress:string;

  @Column({ nullable: false })
  amount: number;

  @Column()
  city: string;

  @Column()
  country: string;
}
