import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Driver_Service } from './driver_service.entity';
import { Category } from 'src/category/category.entity';

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

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true, type: 'bigint' })
  dateOfBirth: number;

  @Column({ nullable: true })
  truckBedLength: number;

  @Column({ default: null })
  chargePerKm: number;

  @Column({ default: null })
  otp: string;

  @Column({ nullable: true })
  currentCoordinates: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({
    default: new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
    type: 'bigint',
  })
  expiryDate: number;

  @Column({ type: 'varchar', nullable: true })
  oneSignalToken: string;

  @Column({ default: 0 })
  onRide: number;

  @Column({default:0})
  onOffer:number

  @Column({ nullable: true })
  categoryId: number;

  @OneToMany(() => Driver_Service, (driverService) => driverService.driver)
  driverServices: Driver_Service[];

  @ManyToOne(() => Category, (category) => category.drivers)
  category: Category;
}
