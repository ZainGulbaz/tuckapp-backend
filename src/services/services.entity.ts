import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Driver_Service } from 'src/driver/driver_service.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type:string;

  @Column({default:null})
  sortOrder:string;

  @OneToMany(() => Driver_Service, (driverService) => driverService.serviceId)
  driverService: Driver_Service[];
}
