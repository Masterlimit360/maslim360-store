'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/use-auth'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, setToken, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    isSeller: false,
    businessName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    if (formData.isSeller && !formData.businessName?.trim()) {
      toast.error('Please provide a business name for seller accounts')
      return
    }
    
    setIsSubmitting(true)
    try {
      // Call API directly to support seller registration
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
      const body = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ...(formData.isSeller && {
          isSeller: true,
          businessName: formData.businessName,
        }),
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Registration failed')

      // Update auth state
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
      }
      
      // Update the auth store
      setUser(data.user)
      setToken(data.token)

      toast.success('Account created successfully!')
      router.push('/')
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    window.location.href = `${API_URL}/auth/google`
  }

  const handleFacebookLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    window.location.href = `${API_URL}/auth/facebook`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center text-center space-y-8">
          <div className="space-y-4">
            <Image
              src="/assets/logos/MasLim360-logo.png"
              alt="MasLim360 Logo"
              width={64}
              height={64}
              className="h-16 w-16 mx-auto"
            />
            <h1 className="text-4xl font-bold text-gray-900">MasLim360</h1>
            <p className="text-xl text-gray-600">
              Join thousands of happy customers
            </p>
          </div>
          <div className="space-y-4 text-left max-w-md">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">Exclusive member discounts</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">Early access to new products</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">Personalized recommendations</span>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Back to store</span>
                </Link>
              </div>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <p className="text-muted-foreground">
                Join MasLim360 and start shopping today
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, agreeToTerms: checked as boolean })
                    }
                  />
                  <Label htmlFor="terms" className="text-sm">
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

                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="isSeller"
                    checked={formData.isSeller}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSeller: checked as boolean })}
                  />
                  <Label htmlFor="isSeller" className="text-sm">
                    Register as a <strong>seller/vendor</strong>
                  </Label>
                </div>

                {formData.isSeller && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="Your business or store name"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required={formData.isSeller}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="w-full"
                  >
                    <Image
                      src="/assets/icons/google-logo.svg"
                      alt="Google"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleFacebookLogin}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
