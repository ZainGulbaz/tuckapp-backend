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

  @Index("driver-idx")
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

  @Column({nullable:true})
  destinationAddress:string;

  @Column({ nullable: false })
  amount: number;

  @Index("city-idx")
  @Column()
  city: string;

  @Column()
  country: string;

  @Column({default:0})
  isCancel:number
}
