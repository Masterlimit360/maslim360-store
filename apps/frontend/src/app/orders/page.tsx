'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  RefreshCw
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'Delivered',
    total: 299.99,
    items: [
      {
        id: '1',
        title: 'Wireless Bluetooth Headphones',
        price: 99.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
      },
      {
        id: '2',
        title: 'Smart Fitness Watch',
        price: 199.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Accra',
      state: 'Greater Accra',
      zipCode: '00233',
      country: 'Ghana',
    },
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-20',
    actualDelivery: '2024-01-18',
  },
  {
    id: 'ORD-002',
    date: '2024-01-10',
    status: 'Shipped',
    total: 149.50,
    items: [
      {
        id: '3',
        title: 'Premium Coffee Maker',
        price: 79.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100',
      },
      {
        id: '4',
        title: 'Coffee Beans',
        price: 69.51,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Accra',
      state: 'Greater Accra',
      zipCode: '00233',
      country: 'Ghana',
    },
    trackingNumber: 'TRK987654321',
    estimatedDelivery: '2024-01-25',
  },
  {
    id: 'ORD-003',
    date: '2024-01-05',
    status: 'Processing',
    total: 89.99,
    items: [
      {
        id: '5',
        title: 'Ergonomic Office Chair',
        price: 89.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Accra',
      state: 'Greater Accra',
      zipCode: '00233',
      country: 'Ghana',
    },
    estimatedDelivery: '2024-01-30',
  },
  {
    id: 'ORD-004',
    date: '2023-12-20',
    status: 'Cancelled',
    total: 199.99,
    items: [
      {
        id: '6',
        title: 'Designer Handbag',
        price: 199.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Accra',
      state: 'Greater Accra',
      zipCode: '00233',
      country: 'Ghana',
    },
    cancellationReason: 'Changed mind',
  },
]

const statusConfig = {
  'Processing': {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <RefreshCw className="h-4 w-4" />,
    description: 'Your order is being prepared',
  },
  'Shipped': {
    color: 'bg-blue-100 text-blue-800',
    icon: <Truck className="h-4 w-4" />,
    description: 'Your order is on the way',
  },
  'Delivered': {
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-4 w-4" />,
    description: 'Your order has been delivered',
  },
  'Cancelled': {
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-4 w-4" />,
    description: 'Your order has been cancelled',
  },
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'price-high':
        return b.total - a.total
      case 'price-low':
        return a.total - b.total
      default:
        return 0
    }
  })

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig['Processing']
  }

  const canReturn = (order: any) => {
    return order.status === 'Delivered' && 
           new Date().getTime() - new Date(order.actualDelivery || order.date).getTime() < 30 * 24 * 60 * 60 * 1000
  }

  const canReview = (order: any) => {
    return order.status === 'Delivered'
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
                const statusConfig = getStatusConfig(order.status)
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Ordered on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={statusConfig.color}>
                            {statusConfig.icon}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{formatPrice(order.total)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Order Items */}
                      <div className="space-y-4 mb-6">
                        <h4 className="font-medium">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium">{item.title}</h5>
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
                            <p>{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                            <p>{order.shippingAddress.country}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Order Information</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {order.trackingNumber && (
                              <p>Tracking: {order.trackingNumber}</p>
                            )}
                            {order.estimatedDelivery && (
                              <p>Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                            )}
                            {order.actualDelivery && (
                              <p>Delivered: {new Date(order.actualDelivery).toLocaleDateString()}</p>
                            )}
                            {order.cancellationReason && (
                              <p>Reason: {order.cancellationReason}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Invoice
                        </Button>
                        {order.trackingNumber && (
                          <Button variant="outline" size="sm">
                            <Truck className="h-4 w-4 mr-2" />
                            Track Package
                          </Button>
                        )}
                        {canReturn(order) && (
                          <Button variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Return Item
                          </Button>
                        )}
                        {canReview(order) && (
                          <Button variant="outline" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Write Review
                          </Button>
                        )}
                        {order.status === 'Processing' && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
                    <Button>Start Shopping</Button>
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

