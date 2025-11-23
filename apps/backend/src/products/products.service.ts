import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, user: any) {
    const { categoryId, variants, images, ...productData } = createProductDto;

    // Ensure the authenticated user has a vendor profile
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { userId: user.id } });
    if (!vendor) {
      throw new ForbiddenException('Only registered sellers can create products');
    }

    return this.prisma.product.create({
      data: {
        ...productData,
        vendor: { connect: { id: vendor.id } },
        tags: productData.tags ? JSON.stringify(productData.tags) : '[]',
        attributes: productData.attributes ? JSON.stringify(productData.attributes) : null,
        dimensions: productData.dimensions ? JSON.stringify(productData.dimensions) : null,
        category: {
          connect: { id: categoryId },
        },
        variants: {
          create: variants?.map(variant => ({
            ...variant,
            attributes: variant.attributes ? JSON.stringify(variant.attributes) : null,
          })) || [],
        },
        images: {
          create: images || [],
        },
      },
      include: {
        category: true,
        variants: true,
        images: true,
        inventory: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive = true,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = { isActive };

    // Category filter
    if (category) {
      where.category = {
        OR: [
          { id: category },
          { slug: category },
        ],
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          inventory: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const ratings = product.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      return {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
      };
    });

    return {
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          include: {
            inventory: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        inventory: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Calculate average rating
    const ratings = product.reviews.map(review => review.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: {
          include: {
            inventory: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        inventory: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Calculate average rating
    const ratings = product.reviews.map(review => review.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId, variants, images, ...productData } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(productData.tags && { tags: JSON.stringify(productData.tags) }),
        ...(productData.attributes && { attributes: JSON.stringify(productData.attributes) }),
        ...(productData.dimensions && { dimensions: JSON.stringify(productData.dimensions) }),
        ...(categoryId && {
          category: {
            connect: { id: categoryId },
          },
        }),
        ...(variants && {
          variants: {
            deleteMany: {},
            create: variants.map(variant => ({
              ...variant,
              attributes: variant.attributes ? JSON.stringify(variant.attributes) : null,
            })),
          },
        }),
        ...(images && {
          images: {
            deleteMany: {},
            create: images,
          },
        }),
      },
      include: {
        category: true,
        variants: true,
        images: true,
        inventory: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getFeatured(limit = 10) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRelated(productId: string, limit = 4) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, tags: true },
    });

    if (!product) {
      return [];
    }

    return this.prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        OR: [
          { categoryId: product.categoryId },
          { tags: { contains: product.tags, mode: 'insensitive' } },
        ],
      },
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
