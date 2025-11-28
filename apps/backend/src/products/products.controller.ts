import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(@Req() req, @Body() createProductDto: CreateProductDto) {
    // pass authenticated user to service so product can be linked to vendor profile
    return this.productsService.create(createProductDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({ status: 200, description: 'Featured products retrieved' })
  async getFeatured(@Query('limit') limit = 10) {
    return this.productsService.getFeatured(+limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  @ApiResponse({ status: 200, description: 'Related products retrieved' })
  async getRelated(@Param('id') id: string, @Query('limit') limit = 4) {
    return this.productsService.getRelated(id, +limit);
  }

  @Get('seller/my-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller\'s products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getSellerProducts(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.productsService.getSellerProducts(req.user.id, +page, +limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Seller/Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Seller can delete own products)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async remove(@Param('id') id: string, @Req() req) {
    return this.productsService.remove(id, req.user);
  }
}
