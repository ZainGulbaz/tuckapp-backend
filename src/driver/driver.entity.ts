import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, unique: true })
  phoneNumber: string;

  @Column({ nullable: false })
  city: string;

  @Column({ nullable: false })
  country: string;

  @Column({ default: null })
  truckPhoto: string;

  @Column({ nullable: false })
  lisencePhoto: string;

  @Column({ nullable: false, unique: true })
  lisencePlate: string;

  @Column({ default: false })
  registrationStatus: boolean;

  @Column({ nullable: false })
  gender: string;

  @Column({ nullable: false, type: 'bigint' })
  dateOfBirth: number;

  @Column({ nullable: false })
  truckBedLength: number;

  @Column({ default: null })
  chargePerKm: number;

  @Column({ default: null })
  otp: string;

  @Column({ nullable: true })
  currentCoordinates: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: new Date().getTime(), type: 'bigint' })
  expiryDate: number;
}
