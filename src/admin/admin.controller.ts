import { Controller, Post, Body } from '@nestjs/common';
import { adminCreateDto } from './dtos/admin.create.dto';
import { AdminService } from './admin.service';
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Post()
  async createAdmin(@Body() body: adminCreateDto) {
    return await this.adminService.createAdmin(body);
  }
}
