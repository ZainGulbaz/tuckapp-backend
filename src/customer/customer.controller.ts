import {
  Controller,
  Post,
  UploadedFile,
  Body,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { responseInterface } from 'src/utils/interfaces/response';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dtos/create.customer.dto';
import { UpdateCustomerDto } from './dtos/update.customer.dto';
import { CustomerOtpDto } from './dtos/otp.customer.dto';
@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Post()
  @UseInterceptors(FileInterceptor('profilePhoto'))
  async createUser(
    @Body() body: CreateCustomerDto,
    @UploadedFile() file,
  ): Promise<responseInterface> {
    return this.customerService.createCustomer(body, file);
  }

  @Get()
  async getAllCustomers(@Body() body: { role: string }) {
    return await this.customerService.getAllCustomers(body.role);
  }

  @Get(':id')
  async getCustomer(
    @Param() params: { id: number },
    @Body() body: { role: string },
  ) {
    return await this.customerService.getCustomer(params.id, body.role);
  }

  @Delete(':id')
  async deleteDriver(
    @Param() params: { id: number },
    @Body() body: { role: string },
  ) {
    return await this.customerService.deleteCustomer(params.id, body.role);
  }

  @Put(':id')
  async updateDriver(
    @Param() params: { id: number },
    @Body() body: UpdateCustomerDto,
  ) {
    return await this.customerService.updateCustomer(params.id, body);
  }

  @Post('/otp')
  async CustomerRandomOtp(@Body() body: CustomerOtpDto) {
    return await this.customerService.generateCustomerOtp(
      body.email,
      body.role,
    );
  }
}
