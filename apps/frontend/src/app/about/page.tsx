'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Award, 
  Users, 
  Globe, 
  Heart, 
  Shield, 
  Truck,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import Image from 'next/image'

const stats = [
  { number: '50K+', label: 'Happy Customers' },
  { number: '10K+', label: 'Products Sold' },
  { number: '99%', label: 'Customer Satisfaction' },
  { number: '24/7', label: 'Customer Support' },
]

const team = [
  {
    name: 'Kelvin Osei',
    role: 'Founder & CEO',
    image: '/assets/images/ceo-founder.jpg',
    bio: 'Visionary leader with 10+ years in e-commerce and technology.',
  },
  {
    name: 'Sarah Johnson',
    role: 'Head of Operations',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    bio: 'Expert in supply chain management and customer experience.',
  },
  {
    name: 'Michael Chen',
    role: 'Tech Lead',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Full-stack developer passionate about creating seamless user experiences.',
  },
  {
    name: 'Emily Davis',
    role: 'Marketing Director',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'Creative strategist focused on building brand awareness and customer engagement.',
  },
]

const values = [
  {
    icon: <Heart className="h-8 w-8 text-yellow-500" />,
    title: 'Customer First',
    description: 'We put our customers at the center of everything we do, ensuring their satisfaction is our top priority.',
  },
  {
    icon: <Shield className="h-8 w-8 text-yellow-500" />,
    title: 'Trust & Security',
    description: 'Your data and transactions are protected with industry-leading security measures.',
  },
  {
    icon: <Award className="h-8 w-8 text-yellow-500" />,
    title: 'Quality Products',
    description: 'We carefully curate every product to ensure you receive only the highest quality items.',
  },
  {
    icon: <Globe className="h-8 w-8 text-yellow-500" />,
    title: 'Global Reach',
    description: 'Serving customers worldwide with fast, reliable shipping and local support.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About MasLim360 Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-800">
              Your trusted partner in online shopping since 2020
            </p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              We're passionate about bringing you the best products at unbeatable prices, 
              with exceptional customer service that makes shopping a pleasure.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    MasLim360 Store was born from a simple idea: to make quality products 
                    accessible to everyone, everywhere. Founded in 2020 by Kelvin Osei, 
                    our journey began with a vision to revolutionize online shopping.
                  </p>
                  <p>
                    What started as a small local business has grown into a global platform 
                    serving thousands of customers worldwide. We've maintained our core values 
                    of quality, affordability, and exceptional customer service throughout our growth.
                  </p>
                  <p>
                    Today, we're proud to offer a curated selection of products across 
                    multiple categories, from electronics to fashion, home goods to sports equipment. 
                    Every product in our catalog is carefully selected to meet our high standards.
                  </p>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
                  alt="Our team at work"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-yellow-500 text-black p-4 rounded-lg">
                  <div className="text-2xl font-bold">4+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment to you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind MasLim360 Store who work tirelessly to bring you the best shopping experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose MasLim360?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Here's what sets us apart from the competition.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Truck className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast & Free Shipping</h3>
              <p className="text-muted-foreground">
                Free shipping on orders over $50 with delivery tracking and insurance.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
              <p className="text-muted-foreground">
                Your payment information is encrypted and secure with our trusted payment partners.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Guarantee</h3>
              <p className="text-muted-foreground">
                Every product comes with our quality guarantee and 30-day return policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 text-gray-800">
            Join thousands of satisfied customers and discover amazing products today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-yellow-600 hover:bg-gray-100">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-yellow-500">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

