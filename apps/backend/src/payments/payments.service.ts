import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    }
  }

  async createPaymentIntent(orderId: string, amount: number, currency = 'usd') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending');
    }

    // Create Stripe payment intent if Stripe is configured
    let paymentIntentId: string | null = null;
    let clientSecret: string | null = null;

    if (this.stripe) {
      try {
        const intent = await this.stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        });

        paymentIntentId = intent.id;
        clientSecret = intent.client_secret;
      } catch (error) {
        console.error('Stripe error:', error);
        // Continue without Stripe if it fails
      }
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount,
        currency: currency.toUpperCase(),
        status: 'PENDING',
        paymentMethod: 'stripe',
        transactionId: paymentIntentId,
      },
    });

    return {
      payment,
      clientSecret,
      paymentIntentId,
    };
  }

  async confirmPayment(paymentId: string, transactionId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify with Stripe if configured
    if (this.stripe && transactionId) {
      try {
        const intent = await this.stripe.paymentIntents.retrieve(transactionId);
        
        if (intent.status === 'succeeded') {
          // Update payment and order
          await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
              status: 'COMPLETED',
              gatewayResponse: JSON.stringify(intent),
            },
          });

          await this.prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'PROCESSING' },
          });

          return {
            success: true,
            payment: await this.prisma.payment.findUnique({
              where: { id: paymentId },
            }),
          };
        }
      } catch (error) {
        console.error('Stripe verification error:', error);
      }
    }

    // If Stripe not configured, just mark as completed
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED' },
    });

    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'PROCESSING' },
    });

    return {
      success: true,
      payment: await this.prisma.payment.findUnique({
        where: { id: paymentId },
      }),
    };
  }

  async handleWebhook(payload: any, signature: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Handle payment intent succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const payment = await this.prisma.payment.findFirst({
          where: { transactionId: paymentIntent.id },
        });

        if (payment) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              gatewayResponse: JSON.stringify(paymentIntent),
            },
          });

          await this.prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'PROCESSING' },
          });
        }
      }
    }

    return { received: true };
  }

  async refund(paymentId: string, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Payment is not completed');
    }

    const refundAmount = amount || payment.amount;

    // Process refund through Stripe if configured
    if (this.stripe && payment.transactionId) {
      try {
        const refund = await this.stripe.refunds.create({
          payment_intent: payment.transactionId,
          amount: Math.round(refundAmount * 100),
        });

        await this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            refundedAmount: refundAmount,
            refundedAt: new Date(),
            gatewayResponse: JSON.stringify(refund),
          },
        });

        return {
          success: true,
          refundId: refund.id,
        };
      } catch (error) {
        console.error('Stripe refund error:', error);
        throw new BadRequestException('Refund failed');
      }
    }

    // If Stripe not configured, just mark as refunded
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        refundedAmount: refundAmount,
        refundedAt: new Date(),
      },
    });

    return {
      success: true,
      refundId: null,
    };
  }
}
