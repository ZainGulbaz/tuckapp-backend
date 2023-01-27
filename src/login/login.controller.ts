import { Controller, Body, Post } from '@nestjs/common';
import { driverLoginDto } from './dtos/login.dto';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('driver')
  async driverLogin(@Body() body: driverLoginDto) {
    return this.loginService.driverLogin(body);
  }
}
