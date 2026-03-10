'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Percent, Star, ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import toast from 'react-hot-toast'

// Mock deals data - replace with API call later
const dealsData = [
  {
    id: '1',
    title: 'Wireless Bluetooth Headphones',
    originalPrice: 89.99,
    salePrice: 49.99,
    discount: 44,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    rating: 4.5,
    reviews: 128,
    timeLeft: '2 days',
    category: 'Electronics',
    description: 'High-quality wireless headphones with noise cancellation and premium sound.'
  },
  {
    id: '2',
    title: 'Smart Fitness Watch',
    originalPrice: 199.99,
    salePrice: 129.99,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    rating: 4.3,
    reviews: 89,
    timeLeft: '1 day',
    category: 'Wearables',
    description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.'
  },
  {
    id: '3',
    title: 'Gaming Mechanical Keyboard',
    originalPrice: 149.99,
    salePrice: 99.99,
    discount: 33,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    rating: 4.7,
    reviews: 256,
    timeLeft: '3 days',
    category: 'Gaming',
    description: 'RGB backlit mechanical keyboard with customizable keys and fast response time.'
  },
  {
    id: '4',
    title: 'Portable Power Bank 20000mAh',
    originalPrice: 39.99,
    salePrice: 24.99,
    discount: 38,
    image: 'https://images.unsplash.com/photo-1609592806500-3e27a7b0b5a8?w=400',
    rating: 4.2,
    reviews: 67,
    timeLeft: '5 days',
    category: 'Accessories',
    description: 'High-capacity power bank to keep your devices charged on the go.'
  },
  {
    id: '5',
    title: 'Wireless Charging Pad',
    originalPrice: 29.99,
    salePrice: 19.99,
    discount: 33,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
    rating: 4.4,
    reviews: 94,
    timeLeft: '4 days',
    category: 'Accessories',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.'
  },
  {
    id: '6',
    title: 'Bluetooth Speaker',
    originalPrice: 79.99,
    salePrice: 49.99,
    discount: 38,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    rating: 4.6,
    reviews: 178,
    timeLeft: '2 days',
    category: 'Audio',
    description: 'Waterproof Bluetooth speaker with 360-degree sound and 12-hour battery life.'
  }
]

export default function DealsPage() {
  const [deals, setDeals] = useState(dealsData)
  const [filteredDeals, setFilteredDeals] = useState(dealsData)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('discount')
  const { addItem } = useCart()

  const categories = ['all', ...Array.from(new Set(deals.map(deal => deal.category)))]

  useEffect(() => {
    let filtered = deals.filter(deal =>
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(deal => deal.category === categoryFilter)
    }

    // Sort deals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          return b.discount - a.discount
        case 'price-low':
          return a.salePrice - b.salePrice
        case 'price-high':
          return b.salePrice - a.salePrice
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    setFilteredDeals(filtered)
  }, [deals, searchTerm, categoryFilter, sortBy])

  const handleAddToCart = async (deal: typeof dealsData[0]) => {
    try {
      await addItem(deal.id)
      toast.success(`${deal.title} added to cart!`)
    } catch (error) {
      toast.error('Failed to add item to cart')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              🔥 Hot Deals & Offers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Limited time offers on premium products. Don't miss out!
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-300">
              <Clock className="h-6 w-6" />
              <span className="text-lg font-semibold">Deals end soon - Shop now!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Highest Discount</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal) => (
              <Card key={deal.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200">
                <CardContent className="p-0">
                  <div className="relative">
                    <Link href={`/products/${deal.id}`}>
                      <Image
                        src={deal.image}
                        alt={deal.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold">
                        -{deal.discount}%
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-yellow-500 text-black">
                        <Clock className="h-3 w-3 mr-1" />
                        {deal.timeLeft}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {deal.category}
                      </Badge>
                    </div>

                    <Link href={`/products/${deal.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                        {deal.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {deal.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm ml-1">{deal.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({deal.reviews} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(deal.salePrice)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(deal.originalPrice)}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(deal)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDeals.length === 0 && (
            <div className="text-center py-12">
              <Percent className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No deals found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't Miss Future Deals!</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive deals,
            flash sales, and special promotions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}