'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Loader2,
  MapPin,
  User
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { color: string; icon: JSX.Element; description: string }> = {
  'PENDING': {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <RefreshCw className="h-4 w-4" />,
    description: 'Order is pending',
  },
  'PROCESSING': {
    color: 'bg-blue-100 text-blue-800',
    icon: <RefreshCw className="h-4 w-4" />,
    description: 'Order is being processed',
  },
  'SHIPPED': {
    color: 'bg-purple-100 text-purple-800',
    icon: <Truck className="h-4 w-4" />,
    description: 'Order has been shipped',
  },
  'DELIVERED': {
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-4 w-4" />,
    description: 'Order has been delivered',
  },
  'CANCELLED': {
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-4 w-4" />,
    description: 'Order has been cancelled',
  },
}

export default function SellerOrdersPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    fetchOrders()
  }, [isAuthenticated, router, page])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/orders/seller/orders?page=${page}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      const ordersData = data.data || data
      setOrders(ordersData.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      toast.success('Order status updated')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items?.some((item: any) => item.product?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig['PENDING']
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders for My Products</h1>
        <p className="text-muted-foreground">
          View and manage orders for products you've listed
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No orders for your products yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusCfg = getStatusConfig(order.status)
            const orderTotal = order.items?.reduce((sum: number, item: any) => sum + item.total, 0) || 0

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{order.orderNumber || order.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={statusCfg.color}>
                      {statusCfg.icon}
                      <span className="ml-1">{order.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-medium">Products Ordered</h4>
                    <div className="space-y-3">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                              alt={item.product?.title || 'Product'}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{item.product?.title || 'Product'}</h5>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{order.user?.firstName} {order.user?.lastName}</p>
                        <p>{order.user?.email}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Address
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {order.shippingAddress ? (
                          <>
                            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.country}</p>
                          </>
                        ) : (
                          <p>No address available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Order Total (Your Products)</span>
                      <span className="text-lg font-bold">{formatPrice(orderTotal)}</span>
                    </div>
                  </div>

                  {/* Status Update Actions */}
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                        >
                          Mark as Processing
                        </Button>
                      )}
                      {order.status === 'PROCESSING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        >
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}


