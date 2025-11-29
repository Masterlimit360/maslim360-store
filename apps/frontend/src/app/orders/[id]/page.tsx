'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin,
  CreditCard,
  Download,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { color: string; icon: JSX.Element; description: string }> = {
  'PENDING': {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Package className="h-4 w-4" />,
    description: 'Your order is being prepared',
  },
  'PROCESSING': {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Package className="h-4 w-4" />,
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
    icon: <AlertCircle className="h-4 w-4" />,
    description: 'Your order has been cancelled',
  },
}

export default function OrderDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = params.id as string
  const isSuccess = searchParams.get('success') === 'true'
  const { isAuthenticated } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isSuccess) {
      toast.success('Order placed successfully!')
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getOrder(orderId)
        if (response.success) {
          setOrder(response.data)
        } else {
          setError('Order not found')
        }
      } catch (err: any) {
        console.error('Error fetching order:', err)
        setError(err.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId, isAuthenticated, router, isSuccess])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">{error || 'The order you are looking for does not exist.'}</p>
              <Link href="/orders">
                <Button>View All Orders</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statusCfg = statusConfig[order.status] || statusConfig['PENDING']

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/orders" className="flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Order Details</h1>
                <p className="text-muted-foreground">
                  Order #{order.orderNumber || order.id}
                </p>
              </div>
              <Badge className={statusCfg.color}>
                {statusCfg.icon}
                <span className="ml-1">{order.status}</span>
              </Badge>
            </div>
          </div>

          {isSuccess && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Order Placed Successfully!</h3>
                    <p className="text-sm text-green-700">
                      Your order has been confirmed and will be processed shortly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                            alt={item.product?.title || 'Product'}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.product?.slug || item.productId}`}>
                            <h4 className="font-medium hover:text-primary">{item.product?.title || 'Product'}</h4>
                          </Link>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground">
                              Variant: {item.variant.title}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(item.total)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.shippingAddress ? (
                    <div className="space-y-1">
                      <p className="font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p className="text-muted-foreground">{order.shippingAddress.street}</p>
                      <p className="text-muted-foreground">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && (
                        <p className="text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No shipping address available</p>
                  )}
                </CardContent>
              </Card>

              {/* Billing Address */}
              {order.billingAddress && order.billingAddress.id !== order.shippingAddress?.id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {order.billingAddress.firstName} {order.billingAddress.lastName}
                      </p>
                      <p className="text-muted-foreground">{order.billingAddress.street}</p>
                      <p className="text-muted-foreground">
                        {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                      </p>
                      <p className="text-muted-foreground">{order.billingAddress.country}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal || 0)}</span>
                  </div>
                  {order.shippingAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{formatPrice(order.shippingAmount)}</span>
                    </div>
                  )}
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPrice(order.taxAmount)}</span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount || order.total || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <p className="text-muted-foreground">Tracking Number</p>
                      <p className="font-medium">{order.trackingNumber}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div>
                      <p className="text-muted-foreground">Order Notes</p>
                      <p className="font-medium">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/orders">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    View All Orders
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


