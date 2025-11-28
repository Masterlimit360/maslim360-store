'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Package,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import toast from 'react-hot-toast'

export default function SellerProductsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    fetchProducts()
  }, [isAuthenticated, router, page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products/seller/my-products?page=${page}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      const productsData = data.data || data
      setProducts(productsData.products || [])
      setTotal(productsData.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? Buyers will no longer see it.')) {
      return
    }

    try {
      setDeletingId(productId)
      const response = await api.delete(`/products/${productId}`)
      
      if (response.status === 200 || response.status === 204) {
        toast.success('Product deleted successfully')
        fetchProducts() // Refresh the list
      } else {
        throw new Error('Failed to delete product')
      }
    } catch (error: any) {
      console.error('Error deleting product:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product'
      toast.error(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Products</h1>
            <p className="text-muted-foreground">
              Manage your products and inventory
            </p>
          </div>
          <Link href="/seller/dashboard">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'No products match your search'
                : 'You haven\'t added any products yet'
              }
            </p>
            {!searchQuery && (
              <Link href="/seller/dashboard">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">SKU: {product.sku}</p>
                    <p className="text-lg font-bold mb-4">{formatPrice(product.price)}</p>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/products/${product.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

