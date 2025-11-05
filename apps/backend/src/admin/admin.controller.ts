import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all products (admin)' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string | boolean,
  ) {
    let isActiveValue: boolean | undefined;
    if (isActive !== undefined) {
      if (typeof isActive === 'boolean') {
        isActiveValue = isActive;
      } else if (isActive === 'true') {
        isActiveValue = true;
      } else if (isActive === 'false') {
        isActiveValue = false;
      }
    }
    
    return this.adminService.getProducts(+page, +limit, {
      search,
      category,
      isActive: isActiveValue,
    });
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders (admin)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrders(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getOrders(+page, +limit, { status, search });
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string | boolean,
  ) {
    let isActiveValue: boolean | undefined;
    if (isActive !== undefined) {
      if (typeof isActive === 'boolean') {
        isActiveValue = isActive;
      } else if (isActive === 'true') {
        isActiveValue = true;
      } else if (isActive === 'false') {
        isActiveValue = false;
      }
    }
    
    return this.adminService.getUsers(+page, +limit, {
      search,
      isActive: isActiveValue,
    });
  }
}
