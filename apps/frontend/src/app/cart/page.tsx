'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft,
  Truck,
  Shield,
  CreditCard
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'

const mockCartItems = [
  {
    id: '1',
    product: {
      id: '1',
      title: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    },
    variant: {
      id: '1',
      title: 'Black',
      price: 99.99,
    },
    quantity: 2,
  },
  {
    id: '2',
    product: {
      id: '2',
      title: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    },
    variant: {
      id: '2',
      title: 'White',
      price: 199.99,
    },
    quantity: 1,
  },
]

const mockCoupons = [
  { code: 'SAVE10', discount: 10, type: 'percentage' },
  { code: 'WELCOME20', discount: 20, type: 'fixed' },
]

export default function CartPage() {
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const { items, updateItem, removeItem, subtotal, itemCount, fetchCart, isLoading } = useCart()

  useEffect(() => {
    const loadCart = async () => {
      await fetchCart()
    }
    loadCart()
  }, [])

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateItem(itemId, newQuantity)
    }
  }

  const handleApplyCoupon = () => {
    const coupon = mockCoupons.find(c => c.code === couponCode)
    if (coupon) {
      setAppliedCoupon(couponCode)
    }
  }

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    const coupon = mockCoupons.find(c => c.code === appliedCoupon)
    if (!coupon) return 0
    
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.discount) / 100
    } else {
      return coupon.discount
    }
  }

  const discount = calculateDiscount()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - discount) * 0.08
  const total = subtotal - discount + shipping + tax

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/products">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary">{itemCount} items</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={
                          (item.product?.images && Array.isArray(item.product.images) 
                            ? (item.product.images.find((img: any) => img.isPrimary)?.url || item.product.images[0]?.url)
                            : null) || '/placeholder.jpg'
                        }
                        alt={item.product?.title || 'Product'}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product?.slug || item.product?.id}`}>
                        <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary">
                          {item.product?.title || 'Product'}
                        </h3>
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Variant: {item.variant.title}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={isLoading}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {formatPrice((item.variant?.price || item.product?.price || 0) * item.quantity)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.variant?.price || item.product?.price || 0)} each
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-medium">Coupon Code</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={handleApplyCoupon} disabled={!couponCode}>
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600">
                      Coupon applied: {appliedCoupon}
                    </p>
                  )}
                </div>

                <Link href="/checkout" className="w-full">
                  <Button size="lg" className="w-full mb-4" disabled={isLoading || items.length === 0}>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Secure Checkout</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Multiple payment options</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
