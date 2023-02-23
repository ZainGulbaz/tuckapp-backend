import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/driver/driver.entity';
import { Admin } from 'src/admin/admin.entity';
import { Customer } from 'src/customer/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, Admin, Customer])],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
