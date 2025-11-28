import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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

    // Verify all products in cart are still active
    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new BadRequestException(`Product "${item.product.title}" is no longer available. Please remove it from your cart.`);
      }
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

  async updateStatus(id: string, status: string, userId?: string, vendorId?: string) {
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    // Check if order exists and user has permission
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check permission: either the order owner or a seller with products in the order
    if (userId && order.userId !== userId) {
      // If not the order owner, check if user is a seller with products in this order
      if (vendorId) {
        const hasProductsInOrder = order.items.some(item => item.product.vendorId === vendorId);
        if (!hasProductsInOrder) {
          throw new ForbiddenException('You can only update orders for your own products');
        }
      } else {
        throw new ForbiddenException('You can only update your own orders');
      }
    }

    const updateData: any = { status };
    
    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    return this.prisma.order.update({
      where: { id },
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

  async getSellerOrders(userId: string, page = 1, limit = 20) {
    // Get vendor profile for the user
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new ForbiddenException('User is not a seller');
    }

    const skip = (page - 1) * limit;

    // Find all orders that contain products from this vendor
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          items: {
            some: {
              product: {
                vendorId: vendor.id,
              },
            },
          },
        },
        include: {
          items: {
            where: {
              product: {
                vendorId: vendor.id,
              },
            },
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
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: {
          items: {
            some: {
              product: {
                vendorId: vendor.id,
              },
            },
          },
        },
      }),
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
}
