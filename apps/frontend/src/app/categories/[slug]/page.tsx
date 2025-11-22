 'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Grid,
  List,
  Star,
  ShoppingCart,
  ArrowLeft,
  Loader2,
  Heart,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import { apiClient } from '@/lib/api'

export default function CategoryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | 'all'>('all')
  const [priceRange, setPriceRange] = useState<'all' | string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [catRes, prodRes] = await Promise.all([
          apiClient.getCategory(slug),
          apiClient.getProducts({ category: slug, sortBy, sortOrder }),
        ])

        if (catRes?.success) setCategory(catRes.data)
        if (prodRes?.success) setProducts(prodRes.data?.products || [])
      } catch (err) {
        console.error('Error fetching category page data', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchData()
  }, [slug, sortBy, sortOrder])

  const handleAddToCart = async (product: any) => {
    try {
      await addItem(product.id || product)
    } catch (err) {
      console.error('Add to cart failed', err)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSubcategory =
      selectedSubcategory === 'all' || product.subcategory === selectedSubcategory

    // price range parsing (simple)
    let matchesPrice = true
    if (priceRange !== 'all' && typeof priceRange === 'string') {
      if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-').map((s) => Number(s))
        matchesPrice = product.price >= min && product.price <= max
      } else if (priceRange.endsWith('+')) {
        const min = Number(priceRange.replace('+', ''))
        matchesPrice = product.price >= min
      }
    }

    return matchesSearch && matchesSubcategory && matchesPrice
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <Link href="/categories">
            <Button>Back to Categories</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Link href="/categories" className="flex items-center gap-2 text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Categories</span>
              </Link>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{category.name}</h1>
            {category.description && (
              <p className="text-xl md:text-2xl mb-8 text-white/90">{category.description}</p>
            )}
            {category.children && category.children.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {category.children.map((child: any) => (
                  <Link key={child.id} href={`/categories/${child.slug}`}>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                      {child.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search in ${category.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
              <Select
                value={sortBy === 'createdAt' && sortOrder === 'desc' ? 'newest' : sortBy === 'price' && sortOrder === 'asc' ? 'price-low' : sortBy === 'price' && sortOrder === 'desc' ? 'price-high' : 'rating'}
                onValueChange={(val: string) => {
                  switch (val) {
                    case 'newest':
                      setSortBy('createdAt')
                      setSortOrder('desc')
                      break
                    case 'price-low':
                      setSortBy('price')
                      setSortOrder('asc')
                      break
                    case 'price-high':
                      setSortBy('price')
                      setSortOrder('desc')
                      break
                    case 'rating':
                      setSortBy('averageRating')
                      setSortOrder('desc')
                      break
                    default:
                      setSortBy('createdAt')
                      setSortOrder('desc')
                  }
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {filteredProducts.length} products in {category.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <Card>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Subcategories</h4>
                  <div className="space-y-2">
                    <button onClick={() => setSelectedSubcategory('all')} className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedSubcategory === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                      All ({(category.children || []).reduce((sum: number, c: any) => sum + (c.productCount || 0), 0)})
                    </button>
                    {(category.children || []).map((child: any) => (
                      <button key={child.id} onClick={() => setSelectedSubcategory(child.name)} className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedSubcategory === child.name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                        {child.name} ({child.productCount || 0})
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'All Prices', value: 'all' },
                      { label: 'Under $50', value: '0-50' },
                      { label: '$50 - $100', value: '50-100' },
                      { label: '$100 - $200', value: '100-200' },
                      { label: 'Over $200', value: '200+' },
                    ].map((range) => (
                      <button key={range.value} onClick={() => setPriceRange(range.value as any)} className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${priceRange === range.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No products found in this category</div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <Link href={`/products/${product.slug}`}>
                          <Image src={product.images?.[0]?.url || product.image || '/placeholder-product.jpg'} alt={product.title} width={400} height={300} className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${viewMode === 'grid' ? 'h-48' : 'h-32 w-32'}`} />
                        </Link>
                        {(product.isFeatured || product.isNew) && (
                          <Badge className="absolute top-2 left-2 bg-green-500">{product.isFeatured ? 'Featured' : 'New'}</Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">{product.title}</h3>
                        </Link>
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.averageRating || product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">({product.reviewCount || 0})</span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                            {product.comparePrice && (<span className="text-sm text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>)}
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
          </div>
        </div>
      </div>
    </div>
  )
}

