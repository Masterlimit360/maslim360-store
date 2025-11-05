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
  Loader2
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import { apiClient } from '@/lib/api'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [categoryResponse, productsResponse] = await Promise.all([
          apiClient.getCategory(slug),
          apiClient.getProducts({ category: slug, sortBy, sortOrder }),
        ])
        
        if (categoryResponse.success) {
          setCategory(categoryResponse.data)
        }
        
        if (productsResponse.success) {
          setProducts(productsResponse.data.products || [])
        }
      } catch (error) {
        console.error('Error fetching category data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug, sortBy, sortOrder])

  const handleAddToCart = async (product: any) => {
    await addItem(product.id)
  }

  const handleSortChange = (value: string) => {
    switch (value) {
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
  }

  const filteredProducts = products.filter(product =>
    searchQuery === '' || 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      {/* Category Hero */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Link href="/categories" className="flex items-center gap-2 text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Categories</span>
              </Link>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                {category.description}
              </p>
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
        {/* Search and Filters */}
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
              <Select value={sortBy === 'createdAt' && sortOrder === 'desc' ? 'newest' : sortBy === 'price' && sortOrder === 'asc' ? 'price-low' : sortBy === 'price' && sortOrder === 'desc' ? 'price-high' : 'rating'} onValueChange={handleSortChange}>
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

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} products in {category.name}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No products found in this category</div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
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
                  </div>
                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                    </Link>
                    
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
                    >
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
  )
}

const categoryData = {
  electronics: {
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    image: 'https://images.unsplash.com/photo-1498049794561-77839e85b9fd?w=800',
    subcategories: [
      { name: 'Smartphones', count: 45 },
      { name: 'Laptops', count: 32 },
      { name: 'Headphones', count: 28 },
      { name: 'Cameras', count: 25 },
      { name: 'Gaming', count: 20 },
    ],
  },
  fashion: {
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    subcategories: [
      { name: 'Men\'s Clothing', count: 60 },
      { name: 'Women\'s Clothing', count: 80 },
      { name: 'Shoes', count: 35 },
      { name: 'Accessories', count: 25 },
    ],
  },
  'home-garden': {
    name: 'Home & Garden',
    description: 'Everything for your home and garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    subcategories: [
      { name: 'Furniture', count: 40 },
      { name: 'Kitchen', count: 30 },
      { name: 'Garden', count: 25 },
      { name: 'Decor', count: 25 },
    ],
  },
  sports: {
    name: 'Sports & Fitness',
    description: 'Gear up for your fitness journey',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    subcategories: [
      { name: 'Fitness Equipment', count: 25 },
      { name: 'Outdoor Gear', count: 20 },
      { name: 'Sports Apparel', count: 20 },
      { name: 'Accessories', count: 15 },
    ],
  },
  books: {
    name: 'Books & Media',
    description: 'Expand your knowledge and entertainment',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    subcategories: [
      { name: 'Fiction', count: 100 },
      { name: 'Non-Fiction', count: 80 },
      { name: 'Educational', count: 60 },
      { name: 'Children\'s Books', count: 40 },
      { name: 'Magazines', count: 20 },
    ],
  },
  beauty: {
    name: 'Beauty & Health',
    description: 'Look and feel your best',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    subcategories: [
      { name: 'Skincare', count: 30 },
      { name: 'Makeup', count: 25 },
      { name: 'Hair Care', count: 20 },
      { name: 'Health Supplements', count: 15 },
    ],
  },
}

const mockProducts = [
  {
    id: '1',
    title: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    price: 99.99,
    comparePrice: 149.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    rating: 4.5,
    reviewCount: 128,
    isNew: true,
    category: 'Electronics',
    subcategory: 'Headphones',
  },
  {
    id: '2',
    title: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    price: 199.99,
    comparePrice: 249.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    rating: 4.8,
    reviewCount: 89,
    isNew: false,
    category: 'Electronics',
    subcategory: 'Wearables',
  },
  {
    id: '3',
    title: 'Premium Coffee Maker',
    slug: 'premium-coffee-maker',
    price: 79.99,
    comparePrice: 99.99,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    rating: 4.3,
    reviewCount: 156,
    isNew: true,
    category: 'Home & Garden',
    subcategory: 'Kitchen',
  },
  {
    id: '4',
    title: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    price: 299.99,
    comparePrice: 399.99,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    rating: 4.7,
    reviewCount: 67,
    isNew: false,
    category: 'Home & Garden',
    subcategory: 'Furniture',
  },
]

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { addItem } = useCart()

  const category = categoryData[slug as keyof typeof categoryData]

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The category you're looking for doesn't exist.
            </p>
            <Link href="/categories">
              <Button>Browse All Categories</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleAddToCart = (product: any) => {
    addItem(product)
  }

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = product.category === category.name
    const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory
    const matchesSearch = searchQuery === '' || product.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSubcategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Category Hero */}
      <section className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Link href="/categories" className="flex items-center gap-2 text-black hover:underline">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Categories</span>
              </Link>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {category.name}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-800">
              {category.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {category.subcategories.map((subcategory, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-black">
                  {subcategory.name} ({subcategory.count})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
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
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
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
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} products in {category.name}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Filters</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subcategories */}
                <div>
                  <h4 className="font-medium mb-3">Subcategories</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSubcategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedSubcategory === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      All ({category.subcategories.reduce((sum, sub) => sum + sub.count, 0)})
                    </button>
                    {category.subcategories.map((subcategory, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSubcategory(subcategory.name)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedSubcategory === subcategory.name
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {subcategory.name} ({subcategory.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
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
                      <button
                        key={range.value}
                        onClick={() => setPriceRange(range.value)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          priceRange === range.value
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <Link href={`/products/${product.slug}`}>
                          <Image
                            src={product.image}
                            alt={product.title}
                            width={400}
                            height={300}
                            className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              viewMode === 'grid' ? 'h-48' : 'h-32 w-32'
                            }`}
                          />
                        </Link>
                        {product.isNew && (
                          <Badge className="absolute top-2 left-2 bg-green-500">
                            New
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
                            <Link href={`/products/${product.slug}`}>
                              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                {product.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">{product.subcategory}</p>
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
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
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
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedSubcategory('all')
                  setPriceRange('all')
                }}>
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

