import { Controller, Get, Put, Body, Param, Query, UseGuards, Delete, Post, Req } from '@nestjs/common';
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
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'User orders retrieved' })
  async getUserOrders(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.usersService.getUserOrders(req.user.id, +page, +limit);
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({ status: 200, description: 'User addresses retrieved' })
  async getUserAddresses(@Req() req) {
    return this.usersService.getUserAddresses(req.user.id);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Create user address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  async createAddress(@Req() req, @Body() createAddressDto: CreateAddressDto) {
    return this.usersService.createAddress(req.user.id, createAddressDto);
  }

  @Put('me/addresses/:addressId')
  @ApiOperation({ summary: 'Update user address' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  async updateAddress(
    @Req() req,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: CreateAddressDto,
  ) {
    return this.usersService.updateAddress(addressId, req.user.id, updateAddressDto);
  }

  @Delete('me/addresses/:addressId')
  @ApiOperation({ summary: 'Delete user address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  async deleteAddress(@Req() req, @Param('addressId') addressId: string) {
    return this.usersService.deleteAddress(addressId, req.user.id);
  }

  @Get('me/wishlist')
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist retrieved' })
  async getWishlist(@Req() req) {
    return this.usersService.getWishlist(req.user.id);
  }

  @Post('me/wishlist/:productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist' })
  async addToWishlist(@Req() req, @Param('productId') productId: string) {
    return this.usersService.addToWishlist(req.user.id, productId);
  }

  @Delete('me/wishlist/:productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  async removeFromWishlist(@Req() req, @Param('productId') productId: string) {
    return this.usersService.removeFromWishlist(req.user.id, productId);
  }
}
