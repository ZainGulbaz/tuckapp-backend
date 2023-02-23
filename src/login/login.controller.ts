import { Controller, Body, Post } from '@nestjs/common';
import { driverLoginDto, adminLoginDto, customerLoginDto } from './dtos/login.dto';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('driver')
  async driverLogin(@Body() body: driverLoginDto) {
    return this.loginService.driverLogin(body);
  }

  @Post('admin')
  async adminLogin(@Body() body: adminLoginDto) {
    return this.loginService.adminLogin(body);
  }

  @Post('customer')
  async customerLogin(@Body() body:customerLoginDto) {
    return this.loginService.customerLogin(body);
  }
}
