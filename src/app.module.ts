import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DriverModule } from './driver/driver.module';
import { DriverController } from './driver/driver.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './driver/driver.entity';
import { AuthMiddleware } from './auth.middleware';
import { LoggerService } from './auth.service';
import { DataSource } from 'typeorm';
import { DRIVER_ROUTE } from './utils/routes';
import { DriverService } from './driver/driver.service';
import { LoginModule } from './login/login.module';
import 'dotenv/config';

let databaseCredentials = JSON.parse(
  process.env['DATABASE_' + process.env.NODE_ENV],
);
@Module({
  imports: [
    DriverModule,
    TypeOrmModule.forRoot({ ...databaseCredentials, entities: [Driver] }),
    TypeOrmModule.forFeature([Driver]),
    LoginModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService, DriverService],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: `${process.env.GLOBAL_PREFIX}/${DRIVER_ROUTE}`,
          method: RequestMethod.POST,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/${DRIVER_ROUTE}/login`,
          method: RequestMethod.POST,
        },
      )
      .forRoutes(DriverController, AppController);
  }
}
