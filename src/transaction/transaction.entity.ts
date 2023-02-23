import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ nullable: false, unique: true,type:'bigint' })
  time: number;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: true })
  rideId: number;

  @Column({ nullable: false })
  driverId: number;

  @Column({ nullable: true })
  customerId: number;

  @Column({ nullable: true })
  adminId: number;

}
