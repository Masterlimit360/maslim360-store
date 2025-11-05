'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Eye,
  RotateCcw,
  Star,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'

const statusConfig: Record<string, { color: string; icon: JSX.Element; description: string }> = {
  'PENDING': {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <RefreshCw className="h-4 w-4" />,
    description: 'Your order is being prepared',
  },
  'PROCESSING': {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <RefreshCw className="h-4 w-4" />,
    description: 'Your order is being processed',
  },
  'SHIPPED': {
    color: 'bg-blue-100 text-blue-800',
    icon: <Truck className="h-4 w-4" />,
    description: 'Your order is on the way',
  },
  'DELIVERED': {
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-4 w-4" />,
    description: 'Your order has been delivered',
  },
  'CANCELLED': {
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-4 w-4" />,
    description: 'Your order has been cancelled',
  },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getOrders(1, 50)
        if (response.success) {
          setOrders(response.data.orders || [])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, router])

  const handleCancelOrder = async (orderId: string) => {
    try {
      await apiClient.cancelOrder(orderId)
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      ))
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items?.some((item: any) => item.product?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'price-high':
        return b.total - a.total
      case 'price-low':
        return a.total - b.total
      default:
        return 0
    }
  })

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig['PENDING']
  }

  const canCancel = (order: any) => {
    return order.status === 'PENDING' || order.status === 'PROCESSING'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">My Orders</h1>
            <p className="text-muted-foreground">
              Track and manage your orders
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => {
                const statusCfg = getStatusConfig(order.status)
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">{order.orderNumber || order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Ordered on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={statusCfg.color}>
                            {statusCfg.icon}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{formatPrice(order.total)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Order Items */}
                      <div className="space-y-4 mb-6">
                        <h4 className="font-medium">Order Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                              <Image
                                src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                                alt={item.product?.title || 'Product'}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium">{item.product?.title || 'Product'}</h5>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatPrice(item.price)}</p>
                                <p className="text-sm text-muted-foreground">
                                  each
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-medium mb-2">Shipping Address</h4>
                          <div className="text-sm text-muted-foreground">
                            {order.shippingAddress && (
                              <>
                                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Order Information</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {order.trackingNumber && (
                              <p>Tracking: {order.trackingNumber}</p>
                            )}
                            <p>Subtotal: {formatPrice(order.subtotal)}</p>
                            {order.shippingAmount > 0 && (
                              <p>Shipping: {formatPrice(order.shippingAmount)}</p>
                            )}
                            {order.taxAmount > 0 && (
                              <p>Tax: {formatPrice(order.taxAmount)}</p>
                            )}
                            {order.discountAmount > 0 && (
                              <p>Discount: -{formatPrice(order.discountAmount)}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        {order.trackingNumber && (
                          <Button variant="outline" size="sm">
                            <Truck className="h-4 w-4 mr-2" />
                            Track Package
                          </Button>
                        )}
                        {canCancel(order) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'You haven\'t placed any orders yet'
                    }
                  </p>
                  {!searchQuery && statusFilter === 'all' && (
                    <Link href="/products">
                      <Button>Start Shopping</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

