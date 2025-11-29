import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    }
  }

  async createPaymentIntent(
    orderId: string,
    amount?: number,
    currency = 'usd',
    paymentMethod: 'stripe' | 'mtn_momo' | 'paystack' = 'stripe',
    metadata?: { payerNumber?: string },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending');
    }

    const paymentAmount =
      amount ??
      order.totalAmount ??
      (order as any).total ??
      0;

    if (!paymentAmount || paymentAmount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    // Handle Paystack payments
    if (paymentMethod === 'paystack') {
      const paystackSecret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

      if (!paystackSecret) {
        throw new BadRequestException('Paystack is not configured');
      }

      try {
        // Get frontend URL from config
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        
        // Fetch user email from order
        const user = await this.prisma.user.findUnique({ where: { id: order.userId } });
        const customerEmail = user?.email || 'customer@example.com';
        
        // Call Paystack API to initialize transaction
        const paystackResponse = await firstValueFrom(
          this.httpService.post<any>(
            'https://api.paystack.co/transaction/initialize',
            {
              email: customerEmail,
              amount: Math.round(paymentAmount * 100), // Paystack expects amount in cents
              reference: `ORD-${order.id}-${Date.now()}`,
              callback_url: `${frontendUrl}/paystack-return`,
              metadata: {
                orderId: order.id,
                orderNumber: order.orderNumber,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${paystackSecret}`,
                'Content-Type': 'application/json',
              },
            }
          )
        );

        const { data, message, status } = paystackResponse.data;

        if (!status || !data?.authorization_url) {
          throw new BadRequestException('Failed to initialize Paystack transaction');
        }

        // Create payment record in DB
        const payment = await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: paymentAmount,
            currency: currency.toUpperCase(),
            status: 'PENDING',
            paymentMethod: 'paystack',
            transactionId: data.reference,
            gatewayResponse: JSON.stringify({
              reference: data.reference,
              authorization_url: data.authorization_url,
              access_code: data.access_code,
            }),
          },
        });

        return {
          payment,
          paymentIntentId: data.reference,
          authorizationUrl: data.authorization_url, // Frontend redirects user here
          message: 'Redirect to Paystack to complete payment',
        };
      } catch (error: any) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        throw new BadRequestException(
          error.response?.data?.message || 'Failed to initialize Paystack payment'
        );
      }
    }

    if (paymentMethod === 'mtn_momo') {
      const consumerKey = this.configService.get<string>('MTN_MOMO_CONSUMER_KEY');
      const consumerSecret = this.configService.get<string>('MTN_MOMO_CONSUMER_SECRET');

      if (!consumerKey || !consumerSecret) {
        throw new BadRequestException('MTN MoMo is not configured');
      }

      const momoReference = `MOMO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const payerNumber = metadata?.payerNumber;

      const payment = await this.prisma.payment.create({
        data: {
          orderId: order.id,
          amount: paymentAmount,
          currency: currency.toUpperCase(),
          status: 'PENDING',
          paymentMethod: 'mtn_momo',
          transactionId: momoReference,
          gatewayResponse: JSON.stringify({
            reference: momoReference,
            payerNumber,
          }),
        },
      });

      return {
        payment,
        paymentIntentId: momoReference,
        message: 'MTN MoMo payment initiated. Please approve the transaction in your MoMo app.',
      };
    }

    // Create Stripe payment intent if Stripe is configured
    let paymentIntentId: string | null = null;
    let clientSecret: string | null = null;

    if (this.stripe) {
      try {
        const intent = await this.stripe.paymentIntents.create({
          amount: Math.round(paymentAmount * 100), // Convert to cents
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
        amount: paymentAmount,
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

    // Verify Paystack payment
    if (payment.paymentMethod === 'paystack') {
      const paystackSecret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
      if (!paystackSecret) {
        throw new BadRequestException('Paystack is not configured');
      }

      try {
        const verifyResponse = await firstValueFrom(
          this.httpService.get<any>(
            `https://api.paystack.co/transaction/verify/${transactionId}`,
            {
              headers: {
                Authorization: `Bearer ${paystackSecret}`,
              },
            }
          )
        );

        const { data, status } = verifyResponse.data;

        if (!status || data?.status !== 'success') {
          throw new BadRequestException('Payment verification failed');
        }

        // Update payment to COMPLETED
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'COMPLETED',
            gatewayResponse: JSON.stringify(data),
          },
        });

        // Update order status to PROCESSING
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
      } catch (error: any) {
        console.error('Paystack verification error:', error.response?.data || error.message);
        throw new BadRequestException(
          error.response?.data?.message || 'Payment verification failed'
        );
      }
    }

    // Verify MTN MoMo payment
    if (payment.paymentMethod === 'mtn_momo') {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          transactionId,
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
