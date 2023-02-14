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
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './driver/driver.entity';
import { Admin } from './admin/admin.entity';
import { AuthMiddleware } from './auth.middleware';
import { LoggerService } from './auth.service';
import { DataSource } from 'typeorm';
import { DRIVER_ROUTE, ADMIN_ROUTE } from './utils/routes';
import { DriverService } from './driver/driver.service';
import { LoginModule } from './login/login.module';
import { AdminModule } from './admin/admin.module';
import { AdminController } from './admin/admin.controller';

let databaseCredentials = JSON.parse(
  process.env['DATABASE_' + process.env.NODE_ENV],
);
@Module({
  imports: [
    DriverModule,
    TypeOrmModule.forRoot({
      ...databaseCredentials,
      entities: [Driver, Admin],
    }),
    TypeOrmModule.forFeature([Driver, Admin]),
    LoginModule,
    AdminModule,
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
      )
      .forRoutes(
        DriverController,
        AppController,
        LoginController,
        AdminController,
      );
  }
}
