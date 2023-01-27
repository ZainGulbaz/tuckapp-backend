import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/driver/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Driver])],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
