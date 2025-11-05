'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  ShoppingCart, 
  Heart,
  X,
  SlidersHorizontal,
  Loader2
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import { apiClient } from '@/lib/api'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [showFilters, setShowFilters] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setProducts([])
        return
      }

      try {
        setLoading(true)
        const filters: any = {}
        
        if (selectedCategory !== 'all') {
          filters.category = selectedCategory
        }
        
        if (minPrice !== undefined) {
          filters.minPrice = minPrice
        }
        
        if (maxPrice !== undefined) {
          filters.maxPrice = maxPrice
        }

        if (sortBy === 'price-low') {
          filters.sortBy = 'price'
          filters.sortOrder = 'asc'
        } else if (sortBy === 'price-high') {
          filters.sortBy = 'price'
          filters.sortOrder = 'desc'
        } else if (sortBy === 'rating') {
          filters.sortBy = 'averageRating'
          filters.sortOrder = 'desc'
        } else if (sortBy === 'newest') {
          filters.sortBy = 'createdAt'
          filters.sortOrder = 'desc'
        }

        const response = await apiClient.search(searchQuery, filters)
        if (response.success) {
          setProducts(response.data.products || [])
        }
      } catch (error) {
        console.error('Error searching:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      performSearch()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy])

  const handleAddToCart = async (product: any) => {
    await addItem(product.id)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Products'}
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                type="button"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                type="button"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedCategory('all')
                      setMinPrice(undefined)
                      setMaxPrice(undefined)
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range Filter */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={minPrice || ''}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <p className="text-muted-foreground">
                    {products.length} results found
                  </p>
                )}
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      router.push('/search')
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear search
                  </Button>
                )}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            ) : products.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {products.map((product) => {
                  const inStock = product.inventory && product.inventory.length > 0
                    ? product.inventory.some((inv: any) => inv.quantity > 0)
                    : true
                  
                  return (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden">
                          <Link href={`/products/${product.slug}`}>
                            <Image
                              src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                              alt={product.images?.[0]?.alt || product.title}
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
                        </div>
                        <div className="p-4">
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                              {product.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-2">{product.category?.name}</p>
                          
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

                          <Button 
                            className="w-full" 
                            onClick={() => handleAddToCart(product)}
                            disabled={!inStock}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {inStock ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Start searching</h3>
                <p className="text-muted-foreground">
                  Enter a search term to find products
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

                {filteredResults.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            viewMode === 'grid' ? 'h-48' : 'h-32 w-32'
                          }`}
                        />
                        {product.isNew && (
                          <Badge className="absolute top-2 left-2 bg-green-500">
                            New
                          </Badge>
                        )}
                        {!product.inStock && (
                          <Badge className="absolute top-2 right-2 bg-red-500">
                            Out of Stock
                          </Badge>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="secondary" className="h-8 w-8">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                              {product.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({product.reviewCount})
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

                        <Button 
                          className="w-full" 
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

