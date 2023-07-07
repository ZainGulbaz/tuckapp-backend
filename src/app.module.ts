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
import { LoginController } from './login/login.controller';
import { RideController } from './ride/ride.controller';
import { ServicesController } from './services/services.controller';
import { TransactionController } from './transaction/transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './driver/driver.entity';
import { Admin } from './admin/admin.entity';
import { Ride } from './ride/ride.entity';
import { Customer } from './customer/customer.entity';
import { Transaction } from './transaction/transaction.entity';
import { Service } from './services/services.entity';
import { Category } from './category/category.entity';
import { Offer } from './offer/offer.entity';
import { Driver_Service } from './driver/driver_service.entity';
import { Ride_Service } from './ride/ride-services.entity';
import { Ride_Category } from './ride/ride-categories.entity';
import { AuthMiddleware } from './auth.middleware';
import { LoggerService } from './auth.service';
import { DataSource } from 'typeorm';
import { DRIVER_ROUTE, ADMIN_ROUTE, CUSTOMER_ROUTE,SERVICES_ROUTE } from './utils/routes';
import { DriverService } from './driver/driver.service';
import { LoginModule } from './login/login.module';
import { AdminModule } from './admin/admin.module';
import { AdminController } from './admin/admin.controller';
import { CustomerModule } from './customer/customer.module';
import { CustomerController } from './customer/customer.controller';
import { OfferController } from './offer/offer.controller';
import { RideModule } from './ride/ride.module';
import { TransactionModule } from './transaction/transaction.module';
import { OfferModule } from './offer/offer.module';
import { ServicesModule } from './services/services.module';
import { CategoryModule } from './category/category.module';
import { ScheduleModule } from '@nestjs/schedule';


let databaseCredentials = JSON.parse(
  process.env['DATABASE_' + process.env.NODE_ENV],
);
@Module({
  imports: [
    DriverModule,
    TypeOrmModule.forRoot({
      ...databaseCredentials,
      entities: [
        Driver,
        Admin,
        Customer,
        Ride,
        Transaction,
        Offer,
        Service,
        Category,
        Driver_Service,
        Ride_Service,
        Ride_Category,
      ],
    }),
    TypeOrmModule.forFeature([
      Driver,
      Admin,
      Customer,
      Driver_Service,
      Category,
      Offer
    ]),
    ScheduleModule.forRoot(),
    LoginModule,
    AdminModule,
    CustomerModule,
    RideModule,
    TransactionModule,
    OfferModule,
    ServicesModule,
    CategoryModule,

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
          path: `${process.env.GLOBAL_PREFIX}/login/${DRIVER_ROUTE}`,
          method: RequestMethod.POST,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/${DRIVER_ROUTE}/photo/lisence`,
          method: RequestMethod.POST,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/${DRIVER_ROUTE}/photo/truck`,
          method: RequestMethod.POST,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/login/${ADMIN_ROUTE}`,
          method: RequestMethod.POST,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/${ADMIN_ROUTE}`,
          method: RequestMethod.POST,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/${CUSTOMER_ROUTE}`,
          method: RequestMethod.POST,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/login/${CUSTOMER_ROUTE}`,
          method: RequestMethod.POST,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/${CUSTOMER_ROUTE}/otp`,
          method: RequestMethod.POST,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/${SERVICES_ROUTE}`,
          method: RequestMethod.GET,
        },
        {
          path: `${process.env.GLOBAL_PREFIX}/appversion`,
          method: RequestMethod.GET,
        }
      )
      .forRoutes(
        DriverController,
        AppController,
        LoginController,
        AdminController,
        CustomerController,
        RideController,
        TransactionController,
        OfferController,
        ServicesController
      );
  }
}
