'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Grid, List, Star, ShoppingCart, Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [priceRange, setPriceRange] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const { addItem } = useCart()

  useEffect(() => {
    let cancelled = false

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params: any = {
          page,
          limit: 20,
          sortBy,
          sortOrder,
        }

        if (searchQuery) params.search = searchQuery
        if (priceRange && priceRange !== 'all') {
          if (priceRange.includes('+')) {
            params.minPrice = Number(priceRange.replace('+', ''))
          } else if (priceRange.includes('-')) {
            const [min, max] = priceRange.split('-').map(Number)
            params.minPrice = min
            params.maxPrice = max
          }
        }

        const res = await apiClient.getProducts(params)
        if (cancelled) return

        const payload = (res && (res as any).data) ? (res as any).data : res

        if (payload && payload.products) {
          setProducts(payload.products)
          setTotal(payload.total || 0)
        } else if (Array.isArray(payload)) {
          setProducts(payload)
          setTotal(payload.length)
        } else {
          setProducts([])
          setTotal(0)
        }
      } catch (err: any) {
        console.error('Failed to fetch products', err?.message || err)
        setProducts([])
        setTotal(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProducts()

    return () => {
      cancelled = true
    }
  }, [page, sortBy, sortOrder, priceRange, searchQuery])

  function handleAddToCart(product: any) {
    addItem({
      id: product.id,
      product,
      quantity: 1,
    })
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-72"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>

          <Select onValueChange={(val) => setPriceRange(val)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-50">Under $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="200+">Over $200</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* View Toggle & Summary */}
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {products.length} of {total} products
          </p>
          <div className="flex gap-2">
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
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No products found</div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {products.map((product) => (
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
                    <Badge className="absolute top-2 left-2 bg-green-500">Featured</Badge>
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
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">({product.reviewCount || 0})</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                      {product.comparePrice && (
                        <span className="text-sm text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
                      )}
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="default">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>
    </div>
  )
}
