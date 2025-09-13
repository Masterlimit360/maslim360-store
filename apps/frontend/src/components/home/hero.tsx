'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Truck, Shield, RotateCcw } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Products
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-800">
            Quality, variety, and great prices all in one place. 
            Shop with confidence at MasLim360 Store.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-white text-yellow-600 hover:bg-gray-100">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-yellow-500">
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-white/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">Free Shipping</h3>
            <p className="text-sm text-gray-700">On orders over $50</p>
          </div>
          <div className="text-center">
            <div className="bg-white/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">Secure Payment</h3>
            <p className="text-sm text-gray-700">100% secure checkout</p>
          </div>
          <div className="text-center">
            <div className="bg-white/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">Easy Returns</h3>
            <p className="text-sm text-gray-700">30-day return policy</p>
          </div>
          <div className="text-center">
            <div className="bg-white/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">Quality Products</h3>
            <p className="text-sm text-gray-700">Curated selection</p>
          </div>
        </div>
      </div>
    </section>
  )
}
