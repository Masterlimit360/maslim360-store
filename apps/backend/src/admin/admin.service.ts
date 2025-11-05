import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            take: 3,
            include: {
              product: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.product.findMany({
        where: {
          isActive: true,
          inventory: {
            some: {
              quantity: { lte: 5 },
            },
          },
        },
        include: {
          inventory: {
            where: {
              quantity: { lte: 5 },
            },
          },
        },
        take: 10,
      }),
    ]);

    // Get orders by status
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { not: 'CANCELLED' },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const revenueByMonth = monthlyRevenue.reduce((acc, order) => {
      const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + order.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    return {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      ordersByStatus: ordersByStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
      recentOrders,
      lowStockProducts,
      revenueByMonth,
    };
  }

  async getProducts(page = 1, limit = 20, filters?: {
    search?: string;
    category?: string;
    isActive?: boolean;
  }) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.category) {
      where.category = {
        OR: [
          { id: filters.category },
          { slug: filters.category },
        ],
      };
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          inventory: true,
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrders(page = 1, limit = 20, filters?: {
    status?: string;
    search?: string;
  }) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  title: true,
                },
              },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
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

  async getUsers(page = 1, limit = 20, filters?: {
    search?: string;
    isActive?: boolean;
  }) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
