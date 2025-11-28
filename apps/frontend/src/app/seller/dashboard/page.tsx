"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Package, ShoppingBag } from 'lucide-react'
import { api } from '@/lib/api'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'

export default function SellerDashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({ sku: '', title: '', slug: '', price: '', categoryId: '', tags: '', description: '' })
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [primaryIndex, setPrimaryIndex] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') router.push('/auth/login')
      return
    }

    const loadCategories = async () => {
      try {
        const resp = await apiClient.getCategories()
        if (resp && resp.success) {
          setCategories(resp.data || [])
        }
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }

    loadCategories()
  }, [isAuthenticated, router])

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFiles = (e: any) => {
    const list = Array.from(e.target.files || [])
    setFiles(list)
    // create previews
    const urls = list.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // basic client-side validation
    if (!form.title || !form.categoryId || !form.price) {
      setError('Please provide title, price and category')
      setLoading(false)
      return
    }
    try {
      // upload images first
      const uploaded: string[] = []
      for (const f of files) {
        const fd = new FormData()
        fd.append('file', f)
        const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        if (res.data && res.data.success && res.data.data?.url) {
          uploaded.push(res.data.data.url)
        }
      }

      const images = uploaded.map((url, idx) => ({ url, alt: form.title || '', isPrimary: idx === primaryIndex }))
      
      // Parse tags - send as array, backend will handle it
      const tagsArray = (form.tags || '').split(',').map((t) => t.trim()).filter(Boolean)
      
      const payload = {
        sku: form.sku || `SKU-${Date.now()}`,
        title: form.title,
        slug: form.slug || form.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `product-${Date.now()}`,
        price: Number(form.price) || 0,
        categoryId: form.categoryId,
        ...(tagsArray.length > 0 && { tags: JSON.stringify(tagsArray) }),
        ...(form.description && { description: form.description }),
        images,
      }

      const createRes = await api.post('/products', payload)
      if (createRes.status === 201 || createRes.status === 200) {
        const created = createRes.data
        // navigate to newly created product if returned
        const slug = created?.data?.slug || created?.slug || form.slug
        if (slug) router.push(`/products/${slug}`)
        else router.push('/seller')
      } else {
        setError('Failed to create product')
      }
    } catch (err: any) {
      console.error(err)
      if (err?.response?.status === 403) {
        setError('You are not authorized to create products. Register as a seller first.')
      } else {
        setError(err?.message || 'Error creating product')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your products and orders</p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="create">
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            My Products
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input name="title" value={form.title} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <Input name="slug" value={form.slug} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <Input name="sku" value={form.sku} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input name="price" value={form.price} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full border rounded px-3 py-2" aria-label="Category" title="Category">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <Input name="tags" value={form.tags} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2 min-h-[120px]" aria-label="Description" title="Description" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Images</label>
            <input type="file" accept="image/*" multiple onChange={handleFiles} aria-label="Product images" title="Product images" />
            {files.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-2 mb-2">
                  {previews.map((src, idx) => (
                    <div key={idx} className={`w-20 h-20 rounded overflow-hidden border ${primaryIndex === idx ? 'border-primary' : 'border-transparent'}`}>
                      <img src={src} className="w-full h-full object-cover" alt={`preview-${idx}`} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{files.length} file(s) ready to upload</span>
                  <label className="ml-4">Primary:</label>
                  <select value={primaryIndex} onChange={(e) => setPrimaryIndex(Number(e.target.value))} className="border rounded px-2 py-1" aria-label="Primary image" title="Primary image">
                    {files.map((_, i) => <option key={i} value={i}>#{i + 1}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

                <div className="mt-6">
                  <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Product'}</Button>
                  {error && <div className="text-destructive mt-3">{error}</div>}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Products</CardTitle>
                <Link href="/seller/products">
                  <Button variant="outline">View All Products</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View and manage all your products. You can delete products to make them unavailable to buyers.
              </p>
              <Link href="/seller/products">
                <Button>
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Orders for My Products</CardTitle>
                <Link href="/seller/orders">
                  <Button variant="outline">View All Orders</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View orders for products you've listed. Update order status to track delivery.
              </p>
              <Link href="/seller/orders">
                <Button>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
