'use client'

import { useState } from 'react'
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
  Filter,
  Grid,
  List,
  Star,
  Share2,
  Eye
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'

const mockWishlistItems = [
  {
    id: '1',
    product: {
      id: '1',
      title: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      price: 99.99,
      comparePrice: 149.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      rating: 4.5,
      reviewCount: 128,
      category: 'Electronics',
      inStock: true,
      isNew: true,
    },
    addedDate: '2024-01-15',
    notes: 'Need for work calls',
  },
  {
    id: '2',
    product: {
      id: '2',
      title: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      price: 199.99,
      comparePrice: 249.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      rating: 4.8,
      reviewCount: 89,
      category: 'Electronics',
      inStock: true,
      isNew: false,
    },
    addedDate: '2024-01-12',
    notes: 'For daily workouts',
  },
  {
    id: '3',
    product: {
      id: '3',
      title: 'Premium Coffee Maker',
      slug: 'premium-coffee-maker',
      price: 79.99,
      comparePrice: 99.99,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
      rating: 4.3,
      reviewCount: 156,
      category: 'Home & Kitchen',
      inStock: false,
      isNew: true,
    },
    addedDate: '2024-01-10',
    notes: 'Kitchen upgrade',
  },
  {
    id: '4',
    product: {
      id: '4',
      title: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      price: 299.99,
      comparePrice: 399.99,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      rating: 4.7,
      reviewCount: 67,
      category: 'Furniture',
      inStock: true,
      isNew: false,
    },
    addedDate: '2024-01-08',
    notes: 'Home office setup',
  },
  {
    id: '5',
    product: {
      id: '5',
      title: 'Professional Camera Lens',
      slug: 'professional-camera-lens',
      price: 599.99,
      comparePrice: 799.99,
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
      rating: 4.9,
      reviewCount: 234,
      category: 'Electronics',
      inStock: true,
      isNew: false,
    },
    addedDate: '2024-01-05',
    notes: 'Photography hobby',
  },
  {
    id: '6',
    product: {
      id: '6',
      title: 'Designer Handbag',
      slug: 'designer-handbag',
      price: 199.99,
      comparePrice: 299.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      rating: 4.6,
      reviewCount: 89,
      category: 'Fashion',
      inStock: true,
      isNew: true,
    },
    addedDate: '2024-01-03',
    notes: 'Special occasion',
  },
]

export default function WishlistPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems)
  const { addItem } = useCart()

  const handleAddToCart = (product: any) => {
    addItem(product.id)
  }

  const handleRemoveFromWishlist = (itemId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId))
  }

  const handleShareWishlist = () => {
    // Handle sharing wishlist
    console.log('Share wishlist')
  }

  const filteredItems = wishlistItems.filter(item =>
    item.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
      case 'oldest':
        return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime()
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
          {sortedItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <Link href={`/products/${item.product.slug}`}>
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      width={400}
                      height={300}
                      className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        viewMode === 'grid' ? 'h-48' : 'h-32 w-32'
                      }`}
                    />
                  </Link>
                  {item.product.isNew && (
                    <Badge className="absolute top-2 left-2 bg-green-500">
                      New
                    </Badge>
                  )}
                  {!item.product.inStock && (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      Out of Stock
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {item.product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.product.category}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added {new Date(item.addedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(item.product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({item.product.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">
                        {formatPrice(item.product.price)}
                      </span>
                      {item.product.comparePrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      "{item.notes}"
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => handleAddToCart(item.product)}
                      disabled={!item.product.inStock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

