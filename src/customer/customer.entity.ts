import { Entity } from 'typeorm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true, unique: false })
  phoneNumber: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true, default: 0 })
  cancelledRides: number;

  @Column({ nullable: true, default: 0 })
  totalRides: number;

  @Column({ nullable: true })
  otp: number;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ type: 'varchar' })
  oneSignalToken: string;
}
