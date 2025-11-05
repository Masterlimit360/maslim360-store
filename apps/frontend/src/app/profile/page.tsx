'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Package,
  Heart,
  LogOut,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Ghana',
    phone: '',
    isDefault: false,
  })
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [profileRes, addressesRes, ordersRes, wishlistRes] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getAddresses(),
          apiClient.getOrders(1, 10),
          apiClient.getWishlist(),
        ])

        if (profileRes.success) {
          setUserData(profileRes.data)
        }
        if (addressesRes.success) {
          setAddresses(addressesRes.data || [])
        }
        if (ordersRes.success) {
          setOrders(ordersRes.data.orders || [])
        }
        if (wishlistRes.success) {
          setWishlist(wishlistRes.data || [])
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, router])

  const handleSaveProfile = async () => {
    try {
      await apiClient.updateProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleSaveAddress = async () => {
    try {
      if (isEditingAddress) {
        await apiClient.updateAddress(isEditingAddress, addressForm)
      } else {
        await apiClient.createAddress(addressForm)
      }
      setIsEditingAddress(null)
      setShowAddressForm(false)
      setAddressForm({
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Ghana',
        phone: '',
        isDefault: false,
      })
      // Refresh addresses
      const res = await apiClient.getAddresses()
      if (res.success) {
        setAddresses(res.data || [])
      }
    } catch (error) {
      console.error('Error saving address:', error)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiClient.deleteAddress(id)
      setAddresses(addresses.filter(addr => addr.id !== id))
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  const handleEditAddress = (address: any) => {
    setAddressForm({
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    })
    setIsEditingAddress(address.id)
    setShowAddressForm(true)
  }

  const handleAddToCart = async (productId: string) => {
    await addItem(productId)
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await apiClient.removeFromWishlist(productId)
      setWishlist(wishlist.filter(item => item.productId !== productId))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-2">
                    {userData.firstName} {userData.lastName}
                  </h1>
                  <p className="text-muted-foreground mb-4">{userData.email}</p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{orders.length}</div>
                      <div className="text-sm text-muted-foreground">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{wishlist.length}</div>
                      <div className="text-sm text-muted-foreground">Wishlist Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">Member since</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={userData.firstName || ''}
                          onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={userData.lastName || ''}
                          onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userData.email}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={userData.phone || ''}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-6">
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Link key={order.id} href={`/orders/${order.id}`}>
                          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                            <div className="flex items-center space-x-4">
                              <div className="bg-muted p-3 rounded-lg">
                                <Package className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-semibold">{order.orderNumber || order.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatPrice(order.total)}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No orders yet</p>
                      <Link href="/products">
                        <Button className="mt-4">Start Shopping</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Image
                            src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                            alt={item.product?.title || 'Product'}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <Link href={`/products/${item.product?.slug}`}>
                              <h3 className="font-semibold hover:text-primary">{item.product?.title}</h3>
                            </Link>
                            <p className="text-primary font-medium">{formatPrice(item.product?.price || 0)}</p>
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => handleAddToCart(item.productId)}>
                              Add to Cart
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRemoveFromWishlist(item.productId)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                      <Link href="/products">
                        <Button>Start Shopping</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Saved Addresses</CardTitle>
                    <Button onClick={() => {
                      setShowAddressForm(true)
                      setIsEditingAddress(null)
                      setAddressForm({
                        firstName: '',
                        lastName: '',
                        street: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: 'Ghana',
                        phone: '',
                        isDefault: false,
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showAddressForm && (
                    <Card className="mb-6">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">
                          {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input
                              value={addressForm.firstName}
                              onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input
                              value={addressForm.lastName}
                              onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Street Address</Label>
                            <Input
                              value={addressForm.street}
                              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>State</Label>
                            <Input
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input
                              value={addressForm.postalCode}
                              onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Country</Label>
                            <Input
                              value={addressForm.country}
                              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button onClick={handleSaveAddress}>
                            Save Address
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setShowAddressForm(false)
                            setIsEditingAddress(null)
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{address.firstName} {address.lastName}</h3>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs mt-1">Default</Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditAddress(address)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteAddress(address.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.postalCode}</p>
                            <p>{address.country}</p>
                            {address.phone && <p>{address.phone}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No addresses saved</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

