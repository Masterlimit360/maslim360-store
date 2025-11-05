const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface Product {
  id: string
  sku: string
  title: string
  slug: string
  description?: string
  shortDescription?: string
  price: number
  comparePrice?: number
  currency: string
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  images: Array<{
    id: string
    url: string
    alt?: string
    isPrimary: boolean
  }>
  inventory: Array<{
    quantity: number
    reserved: number
  }>
  variants?: Array<{
    id: string
    sku: string
    title: string
    price: number
    comparePrice?: number
    attributes?: Record<string, any>
  }>
  reviews?: Array<{
    id: string
    rating: number
    title?: string
    comment?: string
    user: {
      firstName?: string
      lastName?: string
    }
    createdAt: string
  }>
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  children?: Category[]
  productCount?: number
}

interface CartItem {
  id: string
  quantity: number
  product: Product
  variant?: {
    id: string
    title: string
    price: number
  }
}

interface Cart {
  items: CartItem[]
  subtotal: number
  itemCount: number
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'API request failed')
    }

    return data
  }

  // Products
  async getProducts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    minPrice?: number
    maxPrice?: number
    featured?: boolean
  }): Promise<ApiResponse<{ products: Product[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/products?${searchParams.toString()}`)
  }

  async getProduct(slug: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/slug/${slug}`)
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.request('/products/featured')
  }

  async getRelatedProducts(productId: string): Promise<ApiResponse<Product[]>> {
    return this.request(`/products/${productId}/related`)
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request('/categories')
  }

  async getCategoryTree(): Promise<ApiResponse<Category[]>> {
    return this.request('/categories/tree')
  }

  async getCategory(slug: string): Promise<ApiResponse<Category>> {
    return this.request(`/categories/slug/${slug}`)
  }

  // Cart
  async getCart(): Promise<ApiResponse<Cart>> {
    return this.request('/cart')
  }

  async addToCart(data: {
    productId: string
    variantId?: string
    quantity: number
  }): Promise<ApiResponse<CartItem>> {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    })
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<void>> {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    })
  }

  async clearCart(): Promise<ApiResponse<void>> {
    return this.request('/cart', {
      method: 'DELETE',
    })
  }

  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/auth/me')
  }

  // Search
  async search(query: string, filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<{ products: Product[]; total: number }>> {
    const searchParams = new URLSearchParams({ q: query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/search?${searchParams.toString()}`)
  }

  // Reviews
  async getProductReviews(productId: string, page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.request(`/reviews/products/${productId}?page=${page}&limit=${limit}`)
  }

  async createReview(productId: string, data: {
    rating: number
    title?: string
    comment?: string
  }): Promise<ApiResponse<any>> {
    return this.request(`/reviews/products/${productId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Orders
  async createOrder(data: {
    billingAddressId: string
    shippingAddressId: string
    notes?: string
    couponCode?: string
    shippingAmount?: number
    taxAmount?: number
  }): Promise<ApiResponse<any>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getOrders(page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.request(`/orders?page=${page}&limit=${limit}`)
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${id}`)
  }

  async cancelOrder(id: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PATCH',
    })
  }

  // Payments
  async createPaymentIntent(orderId: string, amount: number, currency = 'usd'): Promise<ApiResponse<any>> {
    return this.request('/payments/intents', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, currency }),
    })
  }

  async confirmPayment(paymentId: string, transactionId: string): Promise<ApiResponse<any>> {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentId, transactionId }),
    })
  }

  // Wishlist
  async getWishlist(): Promise<ApiResponse<any[]>> {
    return this.request('/users/me/wishlist')
  }

  async addToWishlist(productId: string): Promise<ApiResponse<any>> {
    return this.request(`/users/me/wishlist/${productId}`, {
      method: 'POST',
    })
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<any>> {
    return this.request(`/users/me/wishlist/${productId}`, {
      method: 'DELETE',
    })
  }

  // User Profile
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/users/me')
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getAddresses(): Promise<ApiResponse<any[]>> {
    return this.request('/users/me/addresses')
  }

  async createAddress(data: any): Promise<ApiResponse<any>> {
    return this.request('/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAddress(addressId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/users/me/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAddress(addressId: string): Promise<ApiResponse<any>> {
    return this.request(`/users/me/addresses/${addressId}`, {
      method: 'DELETE',
    })
  }

  // Admin
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/dashboard')
  }

  async getAdminProducts(page = 1, limit = 20, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    return this.request(`/admin/products?${params.toString()}`)
  }

  async getAdminOrders(page = 1, limit = 20, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    return this.request(`/admin/orders?${params.toString()}`)
  }

  async getAdminUsers(page = 1, limit = 20, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    return this.request(`/admin/users?${params.toString()}`)
  }
}

export const apiClient = new ApiClient(API_URL)
export type { Product, Category, CartItem, Cart }
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default api
