import { Hero } from '@/components/home/hero'
import { FeaturedProducts } from '@/components/home/featured-products'
import { Categories } from '@/components/home/categories'
import { Newsletter } from '@/components/home/newsletter'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Newsletter />
    </div>
  )
}
