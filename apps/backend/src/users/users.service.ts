import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: {
                    where: { isPrimary: true },
                    select: { url: true, alt: true },
                  },
                },
              },
              variant: {
                select: {
                  id: true,
                  title: true,
                  attributes: true,
                },
              },
            },
          },
          billingAddress: true,
          shippingAddress: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: { userId },
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

  async getUserAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async createAddress(userId: string, addressData: any) {
    return this.prisma.address.create({
      data: {
        ...addressData,
        userId,
      },
    });
  }

  async updateAddress(id: string, userId: string, addressData: any) {
    return this.prisma.address.updateMany({
      where: { id, userId },
      data: addressData,
    });
  }

  async deleteAddress(id: string, userId: string) {
    return this.prisma.address.deleteMany({
      where: { id, userId },
    });
  }

  async getWishlist(userId: string) {
    const wishlistItems = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            images: {
              where: { isPrimary: true },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate ratings for each product
    const itemsWithRating = wishlistItems.map(item => {
      const ratings = item.product.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      return {
        ...item,
        product: {
          ...item.product,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: ratings.length,
        },
      };
    });

    return itemsWithRating;
  }

  async addToWishlist(userId: string, productId: string) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if already in wishlist
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Product already in wishlist');
    }

    return this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
            },
          },
        },
      },
    });
  }

  async removeFromWishlist(userId: string, productId: string) {
    const wishlistItem = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Product not in wishlist');
    }

    return this.prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }
}
