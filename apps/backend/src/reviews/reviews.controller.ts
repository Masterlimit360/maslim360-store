import { Controller, Get, Post, Body, Param, Query, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('products/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async create(@Req() req, @Param('productId') productId: string, @Body() body: { rating: number; title?: string; comment?: string }) {
    return this.reviewsService.create(req.user.id, productId, body);
  }

  @Get('products/:productId')
  @ApiOperation({ summary: 'Get product reviews' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async findAll(
    @Param('productId') productId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('approvedOnly') approvedOnly?: string | boolean,
  ) {
    let approvedOnlyValue = true;
    if (approvedOnly !== undefined) {
      if (typeof approvedOnly === 'boolean') {
        approvedOnlyValue = approvedOnly;
      } else if (approvedOnly === 'false') {
        approvedOnlyValue = false;
      } else if (approvedOnly === 'true') {
        approvedOnlyValue = true;
      }
    }
    
    return this.reviewsService.findAll(productId, +page, +limit, approvedOnlyValue);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async update(@Req() req, @Param('id') id: string, @Body() body: { rating?: number; title?: string; comment?: string }) {
    return this.reviewsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async remove(@Req() req, @Param('id') id: string) {
    return this.reviewsService.remove(id, req.user.id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve review (admin)' })
  @ApiResponse({ status: 200, description: 'Review approved' })
  async approve(@Param('id') id: string) {
    return this.reviewsService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject review (admin)' })
  @ApiResponse({ status: 200, description: 'Review rejected' })
  async reject(@Param('id') id: string) {
    return this.reviewsService.reject(id);
  }
}
