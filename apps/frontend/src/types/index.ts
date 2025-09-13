export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  sku: string
  title: string
  slug: string
  description?: string
  shortDescription?: string
  price: number
  comparePrice?: number
  currency: string
  weight?: number
  dimensions?: Record<string, any>
  isActive: boolean
  isDigital: boolean
  isFeatured: boolean
  metaTitle?: string
  metaDescription?: string
  tags: string[]
  attributes?: Record<string, any>
  averageRating?: number
  reviewCount?: number
  createdAt: string
  updatedAt: string
  category: Category
  variants: ProductVariant[]
  images: ProductImage[]
  inventory: Inventory[]
  reviews: Review[]
}

export interface ProductVariant {
  id: string
  sku: string
  title: string
  price: number
  comparePrice?: number
  weight?: number
  attributes?: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
  inventory: Inventory[]
}

export interface ProductImage {
  id: string
  url: string
  alt?: string
  sortOrder: number
  isPrimary: boolean
  createdAt: string
}

export interface Inventory {
  id: string
  quantity: number
  reserved: number
  lowStockThreshold: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  parent?: Category
  children: Category[]
  _count?: {
    products: number
  }
}

export interface CartItem {
  id: string
  quantity: number
  createdAt: string
  updatedAt: string
  product: Product
  variant?: ProductVariant
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  itemCount: number
}

export interface Review {
  id: string
  rating: number
  title?: string
  comment?: string
  isVerified: boolean
  isApproved: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName?: string
    lastName?: string
  }
}

export interface Address {
  id: string
  type: 'billing' | 'shipping'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  notes?: string
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  billingAddress: Address
  shippingAddress: Address
  items: OrderItem[]
  payments: Payment[]
}

export interface OrderItem {
  id: string
  quantity: number
  price: number
  total: number
  createdAt: string
  product: Product
  variant?: ProductVariant
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: string
  transactionId?: string
  gatewayResponse?: Record<string, any>
  refundedAmount: number
  refundedAt?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED'

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
