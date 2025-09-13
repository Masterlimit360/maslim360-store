import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
            },
            inventory: true,
          },
        },
        variant: {
          include: {
            inventory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.variant?.price || item.product.price;
      return total + (price * item.quantity);
    }, 0);

    return {
      items: cartItems,
      subtotal: Number(subtotal.toFixed(2)),
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, variantId, quantity } = addToCartDto;

    // Verify product exists and is active
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
      include: {
        inventory: true,
        variants: {
          where: variantId ? { id: variantId } : undefined,
          include: { inventory: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or inactive');
    }

    // Check inventory
    const inventory = variantId 
      ? product.variants[0]?.inventory[0]
      : product.inventory[0];

    if (inventory && inventory.quantity < quantity) {
      throw new BadRequestException('Insufficient inventory');
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId: variantId || null,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (inventory && inventory.quantity < newQuantity) {
        throw new BadRequestException('Insufficient inventory');
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
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
      });
    }

    // Create new cart item
    return this.prisma.cartItem.create({
      data: {
        userId,
        productId,
        variantId: variantId || null,
        quantity,
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
    });
  }

  async updateCartItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;

    if (quantity <= 0) {
      return this.removeFromCart(userId, itemId);
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: {
        product: {
          include: {
            inventory: true,
            variants: {
              include: { inventory: true },
            },
          },
        },
        variant: {
          include: { inventory: true },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Check inventory
    const inventory = cartItem.variant?.inventory[0] || cartItem.product.inventory[0];
    if (inventory && inventory.quantity < quantity) {
      throw new BadRequestException('Insufficient inventory');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
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
    });
  }

  async removeFromCart(userId: string, itemId: string) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  async getCartItemCount(userId: string) {
    const result = await this.prisma.cartItem.aggregate({
      where: { userId },
      _sum: {
        quantity: true,
      },
    });

    return result._sum.quantity || 0;
  }
}
