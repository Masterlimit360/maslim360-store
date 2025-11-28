'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, User, Menu, X, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSeller, setIsSeller] = useState(false)
  const router = useRouter()
  const { itemCount } = useCart()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user is a seller
      apiClient.getProfile()
        .then((res) => {
          if (res && res.success && res.data) {
            setIsSeller(res.data.isSeller || false)
          }
        })
        .catch(() => {
          // If profile endpoint doesn't return isSeller, check separately
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/users/me/is-seller`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          })
            .then(res => res.json())
            .then(data => setIsSeller(data.isSeller || false))
            .catch(() => setIsSeller(false))
        })
    } else {
      setIsSeller(false)
    }
  }, [isAuthenticated, user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleMobileSearch = () => {
    router.push('/search')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/logos/MasLim360-logo.png"
              alt="MasLim360 Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">MasLim360</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-sm font-medium hover:text-primary">
              Products
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary">
              Categories
            </Link>
            <Link href="/deals" className="text-sm font-medium hover:text-primary">
              Deals
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
            {isAuthenticated && isSeller && (
              <Link href="/seller/dashboard" className="text-sm font-medium hover:text-primary flex items-center gap-1">
                <Store className="h-4 w-4" />
                Seller Dashboard
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button (Mobile) */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleMobileSearch} aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label={`Shopping cart with ${itemCount} items`}>
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    aria-label={`${itemCount} items in cart`}
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="p-0" aria-label="User profile">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.firstName || 'User'} width={32} height={32} className="rounded-full" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon" aria-label="Login">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/products" 
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/categories" 
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                href="/deals" 
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Deals
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {isAuthenticated && isSeller && (
                <Link 
                  href="/seller/dashboard" 
                  className="text-sm font-medium hover:text-primary flex items-center gap-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Store className="h-4 w-4" />
                  Seller Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
