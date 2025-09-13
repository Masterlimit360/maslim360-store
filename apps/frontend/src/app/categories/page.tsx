'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter, Grid, List } from 'lucide-react'

const categories = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and electronic devices',
    image: 'https://images.unsplash.com/photo-1498049794561-77839e85b9fd?w=600',
    productCount: 150,
    subcategories: [
      { name: 'Smartphones', count: 45 },
      { name: 'Laptops', count: 32 },
      { name: 'Headphones', count: 28 },
      { name: 'Cameras', count: 25 },
      { name: 'Gaming', count: 20 },
    ],
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
    productCount: 200,
    subcategories: [
      { name: 'Men\'s Clothing', count: 60 },
      { name: 'Women\'s Clothing', count: 80 },
      { name: 'Shoes', count: 35 },
      { name: 'Accessories', count: 25 },
    ],
  },
  {
    id: '3',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home and garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
    productCount: 120,
    subcategories: [
      { name: 'Furniture', count: 40 },
      { name: 'Kitchen', count: 30 },
      { name: 'Garden', count: 25 },
      { name: 'Decor', count: 25 },
    ],
  },
  {
    id: '4',
    name: 'Sports & Fitness',
    slug: 'sports',
    description: 'Gear up for your fitness journey',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
    productCount: 80,
    subcategories: [
      { name: 'Fitness Equipment', count: 25 },
      { name: 'Outdoor Gear', count: 20 },
      { name: 'Sports Apparel', count: 20 },
      { name: 'Accessories', count: 15 },
    ],
  },
  {
    id: '5',
    name: 'Books & Media',
    slug: 'books',
    description: 'Expand your knowledge and entertainment',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
    productCount: 300,
    subcategories: [
      { name: 'Fiction', count: 100 },
      { name: 'Non-Fiction', count: 80 },
      { name: 'Educational', count: 60 },
      { name: 'Children\'s Books', count: 40 },
      { name: 'Magazines', count: 20 },
    ],
  },
  {
    id: '6',
    name: 'Beauty & Health',
    slug: 'beauty',
    description: 'Look and feel your best',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
    productCount: 90,
    subcategories: [
      { name: 'Skincare', count: 30 },
      { name: 'Makeup', count: 25 },
      { name: 'Hair Care', count: 20 },
      { name: 'Health Supplements', count: 15 },
    ],
  },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Shop by Category</h1>
          <p className="text-muted-foreground max-w-2xl">
            Discover our wide range of categories and find exactly what you're looking for. 
            From electronics to fashion, we have everything you need.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <Link href={`/categories/${category.slug}`}>
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={600}
                      height={400}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <Badge className="absolute top-4 right-4 bg-white/90 text-black">
                    {category.productCount} items
                  </Badge>
                </div>
                
                <div className="p-6">
                  <Link href={`/categories/${category.slug}`}>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  
                  {/* Subcategories */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Popular in this category:</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 3).map((subcategory, index) => (
                        <Link
                          key={index}
                          href={`/categories/${category.slug}?subcategory=${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors"
                        >
                          {subcategory.name} ({subcategory.count})
                        </Link>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{category.subcategories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link href={`/categories/${category.slug}`}>
                    <Button className="w-full">
                      Browse {category.name}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 p-6 hover:from-yellow-200 hover:to-orange-200 transition-all"
              >
                <div className="text-center">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.productCount} products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-lg mb-6 opacity-90">
              Browse our complete product catalog or contact our support team
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-white text-yellow-600 hover:bg-gray-100">
                  Browse All Products
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-yellow-600">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
