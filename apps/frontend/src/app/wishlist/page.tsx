'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Search,
  Grid,
  List,
  Star,
  Share2,
  Eye,
  Loader2
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function WishlistPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getWishlist()
        if (response.success) {
          setWishlistItems(response.data || [])
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [isAuthenticated, router])

  const handleAddToCart = async (product: any) => {
    await addItem(product.id)
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await apiClient.removeFromWishlist(productId)
      setWishlistItems(items => items.filter(item => item.productId !== productId))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const filteredItems = wishlistItems.filter(item =>
    item.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'price-low':
        return a.product.price - b.product.price
      case 'price-high':
        return b.product.price - a.product.price
      case 'name':
        return a.product.title.localeCompare(b.product.title)
      default:
        return 0
    }
  })

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

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Heart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-8">
              Start adding items you love to your wishlist
            </p>
            <Link href="/products">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} items in your wishlist
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search your wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleShareWishlist}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredItems.length} of {wishlistItems.length} items
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-input rounded-md text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {sortedItems.map((item) => {
            const product = item.product
            const inStock = product.inventory && product.inventory.length > 0
              ? product.inventory.some((inv: any) => inv.quantity > 0)
              : true
            
            return (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Link href={`/products/${product.slug}`}>
                      <Image
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.title}
                        width={400}
                        height={300}
                        className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === 'grid' ? 'h-48' : 'h-32 w-32'
                        }`}
                      />
                    </Link>
                    {product.isFeatured && (
                      <Badge className="absolute top-2 left-2 bg-green-500">
                        Featured
                      </Badge>
                    )}
                    {!inStock && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        Out of Stock
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => handleRemoveFromWishlist(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.averageRating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({product.reviewCount || 0})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleAddToCart(product)}
                        disabled={!inStock}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <Link href={`/products/${product.slug}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Add all in-stock items to cart or share your wishlist
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    Add All to Cart
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Wishlist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

