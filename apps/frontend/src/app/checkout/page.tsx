'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Truck, 
  Shield, 
  Lock,
  ArrowLeft,
  Check,
  MapPin,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string | null>(null)
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string | null>(null)
  const [availableChannels, setAvailableChannels] = useState<any[]>([])
  const [channelsLoading, setChannelsLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Ghana',
    
    // Billing Information
    sameAsShipping: true,
    billingFirstName: '',
    billingLastName: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'Ghana',
    
    // Payment Information
    paymentMethod: 'card',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    
    // Order Notes
    notes: '',
    
    // Terms
    agreeToTerms: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (items.length === 0) {
      router.push('/cart')
      return
    }

    const fetchPaymentChannels = async () => {
      try {
        setChannelsLoading(true)
        const response = await apiClient.getPaymentChannels()
        if (response.success && response.data?.channels) {
          setAvailableChannels(response.data.channels)
          // Set default payment method to first available channel
          if (response.data.channels.length > 0 && !formData.paymentMethod) {
            setFormData(prev => ({ ...prev, paymentMethod: response.data.channels[0].id }))
          }
        }
      } catch (error) {
        console.error('Error fetching payment channels:', error)
        // Fallback to default channels if API fails
        setAvailableChannels([
          { id: 'card', name: 'card', displayName: 'Credit/Debit Card', isAvailable: true, description: 'Visa, Mastercard' }
        ])
      } finally {
        setChannelsLoading(false)
      }
    }

    const fetchAddresses = async () => {
      try {
        const response = await apiClient.getAddresses()
        if (response.success) {
          setSavedAddresses(response.data || [])
          const defaultAddress = response.data?.find((a: any) => a.isDefault)
          if (defaultAddress) {
            setSelectedShippingAddress(defaultAddress.id)
            setSelectedBillingAddress(defaultAddress.id)
            setFormData({
              ...formData,
              firstName: defaultAddress.firstName,
              lastName: defaultAddress.lastName,
              street: defaultAddress.street,
              city: defaultAddress.city,
              state: defaultAddress.state,
              postalCode: defaultAddress.postalCode,
              country: defaultAddress.country,
              phone: defaultAddress.phone || '',
            })
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
      }
    }

    fetchPaymentChannels()
    fetchAddresses()
  }, [isAuthenticated, router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Step 1: Create addresses if not using saved ones
      let shippingAddressId = selectedShippingAddress
      let billingAddressId = selectedBillingAddress

      if (!shippingAddressId) {
        const shippingAddress = await apiClient.createAddress({
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          isDefault: false,
        })
        if (shippingAddress.success) {
          shippingAddressId = shippingAddress.data.id
        }
      }

      if (!billingAddressId) {
        if (formData.sameAsShipping) {
          billingAddressId = shippingAddressId
        } else {
          const billingAddress = await apiClient.createAddress({
            firstName: formData.billingFirstName,
            lastName: formData.billingLastName,
            street: formData.billingStreet,
            city: formData.billingCity,
            state: formData.billingState,
            postalCode: formData.billingPostalCode,
            country: formData.billingCountry,
            phone: formData.phone,
            isDefault: false,
          })
          if (billingAddress.success) {
            billingAddressId = billingAddress.data.id
          }
        }
      }

      // Step 2: Calculate shipping and tax
      const shippingAmount = subtotal > 50 ? 0 : 9.99
      const taxAmount = subtotal * 0.08

      // Validate payment method before creating order
      if (
        formData.paymentMethod !== 'card' &&
        formData.paymentMethod !== 'paystack' &&
        formData.paymentMethod !== 'paystack_mobile'
      ) {
        throw new Error(
          'Selected payment method is not supported yet. Please choose Credit/Debit Card or Paystack.'
        );
      }

      // Step 3: Create order
      const orderResponse = await apiClient.createOrder({
        billingAddressId: billingAddressId!,
        shippingAddressId: shippingAddressId!,
        notes: formData.notes,
        shippingAmount,
        taxAmount,
      })

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order')
      }

      const order = orderResponse.data

      const orderTotal = order?.total ?? order?.totalAmount ?? total

      // Step 4: Handle payment
      if (formData.paymentMethod === 'card') {
        // Create payment intent (use Ghana cedis)
        const paymentIntent = await apiClient.createPaymentIntent({
          orderId: order.id,
          amount: orderTotal,
          currency: 'ghs',
        })

        if (paymentIntent.success) {
          // For demo purposes, we'll confirm payment immediately
          // In production, you'd integrate with Stripe Elements
          await apiClient.confirmPayment(
            paymentIntent.data.id,
            paymentIntent.data.transactionId || 'demo-txn'
          )
        }
      } else if (
        formData.paymentMethod === 'paystack' ||
        formData.paymentMethod === 'paystack_mobile'
      ) {
        try {
          const paystackPayment = await apiClient.createPaymentIntent({
            orderId: order.id,
            amount: orderTotal,
            currency: 'ghs',
            paymentMethod: formData.paymentMethod,
            payerNumber: formData.phone,
          });

          if (!paystackPayment.success) {
            // Check if error is about inactive channels
            if (
              paystackPayment.message?.includes('No active channel') ||
              paystackPayment.message?.includes('channel') ||
              paystackPayment.message?.includes('configured')
            ) {
              throw new Error(
                'The selected payment method is not currently available. Please contact support or try another payment method.'
              );
            }
            throw new Error(paystackPayment.message || 'Failed to initialize Paystack payment');
          }

          // Redirect to Paystack authorization URL
          if (paystackPayment.data?.authorizationUrl) {
            // Store order ID in session storage for reference on return
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('paystack_order_id', order.id)
              sessionStorage.setItem('paystack_reference', paystackPayment.data?.paymentIntentId)
            }
            window.location.href = paystackPayment.data.authorizationUrl
            return
          } else {
            throw new Error('No authorization URL from Paystack. Please try again.')
          }
        } catch (paymentError: any) {
          // Add more helpful error context
          const errorMessage = paymentError.message || 'Payment initialization failed'
          if (errorMessage.includes('No active channel')) {
            setError(
              'Payment method unavailable: ' +
              (formData.paymentMethod === 'paystack_mobile'
                ? 'Mobile money is not currently available. Please use card or bank payment.'
                : 'This payment method is not available. Please contact support.'
              )
            )
          } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
            setError('Network error. Please check your connection and try again.')
          } else {
            setError(errorMessage)
          }
          setLoading(false)
          toast.error(errorMessage)
          return
        }
      }

      // Step 5: Clear cart and redirect
      await clearCart()
      router.push(`/orders/${order.id}?success=true`)
    } catch (error: any) {
      console.error('Error placing order:', error)
      const errorMessage = error.message || 'Failed to place order. Please try again.'
      setError(errorMessage)
      setLoading(false)
      toast.error(errorMessage)
    }
  }

  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const steps = [
    { number: 1, title: 'Shipping', description: 'Delivery information' },
    { number: 2, title: 'Payment', description: 'Payment method' },
    { number: 3, title: 'Review', description: 'Order summary' },
  ]

  if (!isAuthenticated || items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/cart" className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep >= step.number ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {currentStep > step.number ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-medium">{step.number}</span>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-8 h-px bg-muted mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Shipping Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Shipping Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          value={formData.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Region *</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code *</Label>
                          <Input
                            id="postalCode"
                            value={formData.postalCode}
                            onChange={(e) => handleInputChange('postalCode', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sameAsShipping"
                          checked={formData.sameAsShipping}
                          onCheckedChange={(checked) => handleInputChange('sameAsShipping', checked as boolean)}
                        />
                        <Label htmlFor="sameAsShipping">Billing address same as shipping</Label>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment Information */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Payment Information</h2>
                      
                      {channelsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2">Loading payment methods...</span>
                        </div>
                      ) : availableChannels.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-yellow-600 inline mr-2" />
                          <p className="text-yellow-800">
                            No payment methods are currently configured. Please contact support.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Label>Payment Method *</Label>
                          <RadioGroup
                            value={formData.paymentMethod}
                            onValueChange={(value) => handleInputChange('paymentMethod', value)}
                          >
                            {availableChannels.map(channel => (
                              <div key={channel.id} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                <RadioGroupItem value={channel.id} id={channel.id} />
                                <div className="flex-1">
                                  <Label htmlFor={channel.id} className="flex items-center cursor-pointer font-medium">
                                    {channel.id === 'card' && <CreditCard className="h-4 w-4 mr-2" />}
                                    {channel.id.includes('paystack') && <Shield className="h-4 w-4 mr-2" />}
                                    {channel.displayName}
                                  </Label>
                                  {channel.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{channel.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                      {(formData.paymentMethod === 'paystack' || formData.paymentMethod === 'paystack_mobile') && (
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll process your payment securely via Paystack.
                          {formData.paymentMethod === 'paystack_mobile' &&
                            ' You will be prompted to complete a Ghana mobile money transaction.'}
                        </p>
                      )}

                      {formData.paymentMethod === 'card' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card *</Label>
                            <Input
                              id="cardName"
                              value={formData.cardName}
                              onChange={(e) => handleInputChange('cardName', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number *</Label>
                            <Input
                              id="cardNumber"
                              value={formData.cardNumber}
                              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                              placeholder="1234 5678 9012 3456"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiryDate">Expiry Date *</Label>
                              <Input
                                id="expiryDate"
                                value={formData.expiryDate}
                                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                placeholder="MM/YY"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv">CVV *</Label>
                              <Input
                                id="cvv"
                                value={formData.cvv}
                                onChange={(e) => handleInputChange('cvv', e.target.value)}
                                placeholder="123"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="notes">Order Notes (Optional)</Label>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          className="w-full p-3 border border-input rounded-md resize-none"
                          rows={3}
                          placeholder="Special instructions for your order..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review Order */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Review Your Order</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Shipping Address</h3>
                          <div className="p-4 bg-muted rounded-lg">
                            <p>{formData.firstName} {formData.lastName}</p>
                            <p>{formData.street}</p>
                            <p>{formData.city}, {formData.state} {formData.postalCode}</p>
                            <p>{formData.country}</p>
                            <p>{formData.phone}</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Payment Method</h3>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="capitalize">{formData.paymentMethod}</p>
                          </div>
                        </div>

                        {error && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <p className="text-red-600">{error}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                            required
                          />
                          <Label htmlFor="agreeToTerms" className="text-sm">
                            I agree to the{' '}
                            <Link href="/terms" className="text-primary hover:underline">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-primary hover:underline">
                              Privacy Policy
                            </Link>
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>
                    {currentStep < 3 ? (
                      <Button type="button" onClick={handleNext}>
                        Next
                      </Button>
                    ) : (
                      <Button type="submit" disabled={!formData.agreeToTerms || loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Place Order
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Image
                        src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={item.product?.title || 'Product'}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product?.title || 'Product'}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 mr-2" />
                    Secure checkout
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 mr-2" />
                    Free shipping on orders over $50
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


