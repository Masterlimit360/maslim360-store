import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async generateOrderNumber(): Promise<string> {
    const count = await this.prisma.order.count();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `ORD-${timestamp}-${(count + 1).toString().padStart(6, '0')}`;
  }

  async create(userId: string, createOrderDto: CreateOrderDto) {
    // Get user cart
    const cart = await this.cartService.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Verify addresses exist
    const [billingAddress, shippingAddress] = await Promise.all([
      this.prisma.address.findFirst({
        where: { id: createOrderDto.billingAddressId, userId },
      }),
      this.prisma.address.findFirst({
        where: { id: createOrderDto.shippingAddressId, userId },
      }),
    ]);

    if (!billingAddress || !shippingAddress) {
      throw new NotFoundException('Address not found');
    }

    // Calculate totals
    const subtotal = cart.subtotal;
    const shippingAmount = createOrderDto.shippingAmount ?? 0;
    const taxAmount = createOrderDto.taxAmount ?? subtotal * 0.08; // 8% tax default
    let discountAmount = 0;

    // Check coupon if provided
    if (createOrderDto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: createOrderDto.couponCode },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (
          (!coupon.startsAt || now >= coupon.startsAt) &&
          (!coupon.expiresAt || now <= coupon.expiresAt) &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          (!coupon.minimumAmount || subtotal >= coupon.minimumAmount)
        ) {
          if (coupon.type === 'percentage') {
            discountAmount = (subtotal * coupon.value) / 100;
            if (coupon.maximumDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
            }
          } else {
            discountAmount = coupon.value;
          }
        }
      }
    }

    const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        billingAddressId: createOrderDto.billingAddressId,
        shippingAddressId: createOrderDto.shippingAddressId,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        notes: createOrderDto.notes,
        status: 'PENDING',
        currency: 'USD',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant?.price || item.product.price,
            total: (item.variant?.price || item.product.price) * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                },
              },
            },
            variant: true,
          },
        },
        billingAddress: true,
        shippingAddress: true,
      },
    });

    // Update coupon usage if used
    if (createOrderDto.couponCode && discountAmount > 0) {
      await this.prisma.coupon.update({
        where: { code: createOrderDto.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Clear cart after order creation
    await this.cartService.clearCart(userId);

    return order;
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                  },
                },
              },
              variant: true,
            },
          },
          billingAddress: true,
          shippingAddress: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
        },
        billingAddress: true,
        shippingAddress: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, status: string, userId?: string) {
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const updateData: any = { status };
    
    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.order.update({
      where,
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async cancel(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === 'DELIVERED') {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    return this.updateStatus(id, 'CANCELLED', userId);
  }
}
