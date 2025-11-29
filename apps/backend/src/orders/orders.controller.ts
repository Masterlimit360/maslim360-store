import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.findAll(req.user.id, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async findOne(@Req() req, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (seller can update orders for their products)' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateStatus(@Req() req, @Param('id') id: string, @Body('status') status: string) {
    // Get vendor profile if user is a seller
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
    });

    return this.ordersService.updateStatus(id, status, req.user.id, vendor?.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancel(@Req() req, @Param('id') id: string) {
    return this.ordersService.cancel(id, req.user.id);
  }

  @Get('seller/orders')
  @ApiOperation({ summary: 'Get orders for seller\'s products' })
  @ApiResponse({ status: 200, description: 'Seller orders retrieved successfully' })
  async getSellerOrders(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.ordersService.getSellerOrders(req.user.id, +page, +limit);
  }
}
