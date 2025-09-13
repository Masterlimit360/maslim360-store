import { Controller, Get, Put, Body, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Param('userId') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  async updateProfile(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'User orders retrieved' })
  async getUserOrders(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.usersService.getUserOrders(userId, +page, +limit);
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({ status: 200, description: 'User addresses retrieved' })
  async getUserAddresses(@Param('userId') userId: string) {
    return this.usersService.getUserAddresses(userId);
  }

  @Put('me/addresses')
  @ApiOperation({ summary: 'Create user address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  async createAddress(@Param('userId') userId: string, @Body() createAddressDto: CreateAddressDto) {
    return this.usersService.createAddress(userId, createAddressDto);
  }

  @Put('me/addresses/:addressId')
  @ApiOperation({ summary: 'Update user address' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  async updateAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: CreateAddressDto,
  ) {
    return this.usersService.updateAddress(addressId, userId, updateAddressDto);
  }

  @Delete('me/addresses/:addressId')
  @ApiOperation({ summary: 'Delete user address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  async deleteAddress(@Param('userId') userId: string, @Param('addressId') addressId: string) {
    return this.usersService.deleteAddress(addressId, userId);
  }
}
