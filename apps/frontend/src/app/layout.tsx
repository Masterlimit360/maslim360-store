import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MasLim360 Store - Your Ultimate Shopping Destination',
  description: 'Discover amazing products at MasLim360 Store. Quality, variety, and great prices all in one place.',
  keywords: 'ecommerce, shopping, online store, products, deals',
  authors: [{ name: 'MasLim360 Team' }],
  openGraph: {
    title: 'MasLim360 Store',
    description: 'Your Ultimate Shopping Destination',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
