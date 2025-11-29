"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function PaystackReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing your payment...')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from URL query params
        const reference = searchParams.get('reference')
        
        if (!reference) {
          setStatus('error')
          setMessage('No payment reference found. Payment cancelled.')
          return
        }

        // Extract orderId from reference (format: ORD-{orderId}-{timestamp})
        const refParts = reference.split('-')
        if (refParts.length < 2 || refParts[0] !== 'ORD') {
          setStatus('error')
          setMessage('Invalid payment reference.')
          return
        }

        const oid = refParts[1]
        setOrderId(oid)

        // Call backend to verify payment with Paystack
        const verifyResponse = await apiClient.confirmPayment(oid, reference)

        if (verifyResponse.success) {
          setStatus('success')
          setMessage('Payment successful! Your order is being processed.')
          // Redirect to order success page after 3 seconds
          setTimeout(() => {
            router.push(`/orders/${oid}?success=true`)
          }, 3000)
        } else {
          setStatus('error')
          setMessage(verifyResponse.message || 'Payment verification failed.')
        }
      } catch (error: any) {
        console.error('Paystack return error:', error)
        setStatus('error')
        setMessage(error.message || 'An error occurred while verifying your payment.')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground mb-6">Redirecting to your order...</p>
            <Button onClick={() => router.push(`/orders/${orderId}?success=true`)}>
              View Order
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2 text-destructive">Payment Failed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/checkout')} className="w-full">
                Try Another Payment Method
              </Button>
              <Button onClick={() => router.push('/cart')} variant="outline" className="w-full">
                Back to Cart
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
