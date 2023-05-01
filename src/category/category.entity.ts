import { Driver } from 'src/driver/driver.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Driver, (driver) => driver.category)
  drivers: Driver[];
}
