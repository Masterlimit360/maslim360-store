import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
      permissions: JSON.stringify(['read', 'write', 'delete', 'admin'])
    }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user',
      permissions: JSON.stringify(['read'])
    }
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@maslim360.com' },
    update: {},
    create: {
      email: 'admin@maslim360.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isEmailVerified: true,
      userRoles: {
        create: {
          roleId: adminRole.id
        }
      }
    }
  })

  // Create sample categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      image: '/assets/categories/electronics.jpg',
      isActive: true,
      sortOrder: 1
    }
  })

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      image: '/assets/categories/clothing.jpg',
      isActive: true,
      sortOrder: 2
    }
  })

  const home = await prisma.category.upsert({
    where: { slug: 'home-garden' },
    update: {},
    create: {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home improvement and garden supplies',
      image: '/assets/categories/home.jpg',
      isActive: true,
      sortOrder: 3
    }
  })

  // Create sample products
  const products = [
    {
      sku: 'LAPTOP-001',
      title: 'MacBook Pro 16-inch',
      slug: 'macbook-pro-16-inch',
      description: 'Powerful laptop for professionals',
      shortDescription: '16-inch MacBook Pro with M2 chip',
      price: 2499.99,
      comparePrice: 2799.99,
      categoryId: electronics.id,
      tags: JSON.stringify(['laptop', 'apple', 'macbook', 'professional']),
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', alt: 'MacBook Pro', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', alt: 'MacBook Pro side view', isPrimary: false }
      ],
      inventory: { quantity: 50, lowStockThreshold: 5 }
    },
    {
      sku: 'PHONE-001',
      title: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Latest iPhone with advanced features',
      shortDescription: 'iPhone 15 Pro with titanium design',
      price: 999.99,
      comparePrice: 1099.99,
      categoryId: electronics.id,
      tags: JSON.stringify(['phone', 'apple', 'iphone', 'smartphone']),
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1592899677977-9c6d0c0b8b8c?w=800', alt: 'iPhone 15 Pro', isPrimary: true }
      ],
      inventory: { quantity: 100, lowStockThreshold: 10 }
    },
    {
      sku: 'SHIRT-001',
      title: 'Cotton T-Shirt',
      slug: 'cotton-t-shirt',
      description: 'Comfortable cotton t-shirt',
      shortDescription: '100% cotton t-shirt in various colors',
      price: 29.99,
      categoryId: clothing.id,
      tags: JSON.stringify(['shirt', 'cotton', 'casual', 'clothing']),
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', alt: 'Cotton T-Shirt', isPrimary: true }
      ],
      inventory: { quantity: 200, lowStockThreshold: 20 }
    }
  ]

  for (const productData of products) {
    const { images, inventory, ...productInfo } = productData
    
    const product = await prisma.product.upsert({
      where: { sku: productInfo.sku },
      update: {},
      create: productInfo
    })

    // Create product images
    for (const imageData of images) {
      await prisma.productImage.create({
        data: {
          ...imageData,
          productId: product.id
        }
      })
    }

    // Create inventory
    await prisma.inventory.create({
      data: {
        ...inventory,
        productId: product.id
      }
    })
  }

  // Create sample coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minimumAmount: 50,
        usageLimit: 1000,
        isActive: true
      },
      {
        code: 'SAVE20',
        type: 'fixed',
        value: 20,
        minimumAmount: 100,
        usageLimit: 500,
        isActive: true
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user: admin@maslim360.com / admin123')
  console.log('🎁 Sample products and categories created')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })





