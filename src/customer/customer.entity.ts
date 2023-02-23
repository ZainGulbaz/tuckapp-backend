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

  @Column({ nullable: false, unique: true })
  phoneNumber: string;

  @Column({ nullable: false })
  country: string;

  @Column({ nullable: false })
  city: string;

  @Column({ nullable: false })
  gender: string;

  @Column({ nullable: true, default: 0 })
  cancelledRides: number;

  @Column({ nullable: true, default: 0 })
  totalRides: number;

  @Column({ nullable: true })
  otp: number;

  @Column({ nullable: true })
  profilePhoto: string;
}
