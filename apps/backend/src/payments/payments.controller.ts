import { Controller, Post, Body, Param, Headers, UseGuards, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  async createPaymentIntent(@Body() body: { orderId: string; amount: number; currency?: string }) {
    return this.paymentsService.createPaymentIntent(body.orderId, body.amount, body.currency);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  async confirmPayment(@Body() body: { paymentId: string; transactionId: string }) {
    return this.paymentsService.confirmPayment(body.paymentId, body.transactionId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }

  @Post(':paymentId/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  async refund(@Param('paymentId') paymentId: string, @Body('amount') amount?: number) {
    return this.paymentsService.refund(paymentId, amount);
  }
}
