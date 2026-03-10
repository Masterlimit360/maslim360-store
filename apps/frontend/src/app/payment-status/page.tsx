'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function PaymentStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const reference = searchParams.get('reference')
  const status = searchParams.get('status') || 'pending'
  
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.getOrder(orderId)
        if (response.success) {
          setOrder(response.data)
          // Get payment details from order
          if (response.data.payments && response.data.payments.length > 0) {
            setPayment(response.data.payments[0])
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const getStatusIcon = () => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return <CheckCircle2 className="h-16 w-16 text-green-600" />
      case 'pending':
      case 'processing':
        return <Clock className="h-16 w-16 text-blue-600" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-16 w-16 text-red-600" />
      default:
        return <AlertCircle className="h-16 w-16 text-yellow-600" />
    }
  }

  const getStatusMessage = () => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return {
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully. Your order is now being prepared.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'pending':
      case 'processing':
        return {
          title: 'Payment Processing',
          description: 'Your payment is being processed. Please wait while we confirm the transaction.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      case 'failed':
        return {
          title: 'Payment Failed',
          description: 'Your payment could not be processed. Please check your details and try again.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'cancelled':
        return {
          title: 'Payment Cancelled',
          description: 'You cancelled the payment. Your order is still available if you want to complete it.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          title: 'Payment Status Unknown',
          description: 'Please check your email for the latest payment status.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusMsg = getStatusMessage()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <Link href="/orders" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className={`border-2 ${statusMsg.borderColor}`}>
            <CardHeader className={statusMsg.bgColor}>
              <div className="flex flex-col items-center space-y-4">
                {getStatusIcon()}
                <div className="text-center">
                  <h1 className={`text-3xl font-bold ${statusMsg.color} mb-2`}>
                    {statusMsg.title}
                  </h1>
                  <p className="text-muted-foreground max-w-md">
                    {statusMsg.description}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Transaction Details */}
              {orderId && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Order Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm font-mono">{orderId}</code>
                        <button
                          onClick={() => copyToClipboard(orderId)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {reference && (
                      <div>
                        <p className="text-sm text-muted-foreground">Reference</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm font-mono">{reference}</code>
                          <button
                            onClick={() => copyToClipboard(reference)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {order?.totalAmount && (
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-lg font-semibold mt-1">
                          ₵{order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {payment?.status && (
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <p className="text-lg font-semibold mt-1 capitalize">
                          {payment.status}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Help Section */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold">What's Next?</h3>
                
                {['success', 'completed'].includes(status?.toLowerCase() || '') && (
                  <div className="space-y-2 text-sm">
                    <p>✓ Your payment has been confirmed</p>
                    <p>✓ We're preparing your order for shipment</p>
                    <p>✓ You'll receive an email with tracking info</p>
                    <p className="font-semibold mt-3">
                      <Link href={`/orders/${orderId}`} className="text-primary hover:underline">
                        View Full Order Details →
                      </Link>
                    </p>
                  </div>
                )}

                {['pending', 'processing'].includes(status?.toLowerCase() || '') && (
                  <div className="space-y-2 text-sm">
                    <p>⏳ We're verifying your payment</p>
                    <p>⏳ This usually takes a few minutes</p>
                    <p>⏳ Refresh this page to check status</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      If payment doesn't confirm in 10 minutes, please contact support
                    </p>
                  </div>
                )}

                {['failed', 'cancelled'].includes(status?.toLowerCase() || '') && (
                  <div className="space-y-2 text-sm">
                    <p>❌ Your payment was not processed</p>
                    <p>❌ Your order is still saved (not charged)</p>
                    <p>❌ You can retry anytime</p>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        onClick={() => orderId && router.push(`/checkout?orderId=${orderId}`)}
                        className="flex-1"
                      >
                        Retry Payment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/cart')}
                        className="flex-1"
                      >
                        Back to Cart
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Support Section */}
              <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                <p className="font-semibold">Need Help?</p>
                <p>Email: <a href="mailto:support@maslim360.com" className="text-primary hover:underline">support@maslim360.com</a></p>
                <p>Phone: <a href="tel:+233123456789" className="text-primary hover:underline">+233 (0) 123 456 789</a></p>
                <p>Hours: Mon-Fri 9AM-6PM GMT</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => router.push('/orders')}
                  className="flex-1"
                >
                  View All Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
