import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

interface CartItem {
  id: string
  product: {
    id: string
    title: string
    price: number
    images: Array<{
      url: string
      alt: string
      isPrimary: boolean
    }>
  }
  variant?: {
    id: string
    title: string
    price: number
  }
  quantity: number
}

interface CartState {
  items: CartItem[]
  subtotal: number
  itemCount: number
  isLoading: boolean
  error: string | null
}

interface CartActions {
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  fetchCart: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const createCartStore = (set: any, get: any) => ({
  items: [],
      subtotal: 0,
      itemCount: 0,
      isLoading: false,
      error: null,

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      fetchCart: async () => {
        set({ isLoading: true, error: null })
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
          if (!token) {
            set({ items: [], subtotal: 0, itemCount: 0, isLoading: false })
            return
          }

          const response = await fetch(`${API_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            if (response.status === 401) {
              // User not authenticated, clear cart
              set({ items: [], subtotal: 0, itemCount: 0, isLoading: false })
              return
            }
            throw new Error('Failed to fetch cart')
          }

          const data = await response.json()
          // Handle both wrapped and direct response formats
          const cartData = data.data || data
          set({
            items: cartData.items || [],
            subtotal: cartData.subtotal || 0,
            itemCount: cartData.itemCount || 0,
            isLoading: false,
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      addItem: async (productId: string, variantId?: string, quantity = 1) => {
        set({ isLoading: true, error: null })
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            throw new Error('Please log in to add items to cart')
          }

          if (!productId) {
            throw new Error('Product ID is required')
          }

          const payload: any = {
            productId,
            quantity: Number(quantity) || 1,
          }

          if (variantId) {
            payload.variantId = variantId
          }

          const response = await fetch(`${API_URL}/cart/items`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            let errorMessage = 'Failed to add item to cart'
            try {
              const errorData = await response.json()
              // Handle NestJS validation errors (array format)
              if (Array.isArray(errorData.message)) {
                errorMessage = errorData.message.join(', ') || errorMessage
              } else {
                errorMessage = errorData.message || errorData.error || errorMessage
              }
            } catch {
              // If response is not JSON, try to get text
              try {
                const errorText = await response.text()
                errorMessage = errorText || errorMessage
              } catch {
                // If that also fails, use status text
                errorMessage = response.statusText || errorMessage
              }
            }
            throw new Error(errorMessage)
          }

          // Refresh cart after adding item
          await get().fetchCart()
          
          // Show success notification
          toast.success('Item added to cart!')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          set({ error: errorMessage, isLoading: false })
          
          // Show error notification
          toast.error(errorMessage)
          throw error // Re-throw to allow components to handle
        } finally {
          set({ isLoading: false })
        }
      },

      updateItem: async (itemId: string, quantity: number) => {
        set({ isLoading: true, error: null })
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            throw new Error('Please log in to update cart')
          }

          const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
          })

          if (!response.ok) {
            let errorMessage = 'Failed to update cart item'
            try {
              const errorData = await response.json()
              errorMessage = errorData.message || errorData.error || errorMessage
            } catch {
              try {
                const errorText = await response.text()
                errorMessage = errorText || errorMessage
              } catch {
                errorMessage = response.statusText || errorMessage
              }
            }
            throw new Error(errorMessage)
          }

          // Refresh cart after updating item
          await get().fetchCart()
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      removeItem: async (itemId: string) => {
        set({ isLoading: true, error: null })
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            throw new Error('Please log in to remove items from cart')
          }

          const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            let errorMessage = 'Failed to remove cart item'
            try {
              const errorData = await response.json()
              errorMessage = errorData.message || errorData.error || errorMessage
            } catch {
              try {
                const errorText = await response.text()
                errorMessage = errorText || errorMessage
              } catch {
                errorMessage = response.statusText || errorMessage
              }
            }
            throw new Error(errorMessage)
          }

          // Refresh cart after removing item
          await get().fetchCart()
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null })
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            throw new Error('Please log in to clear cart')
          }

          const response = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            let errorMessage = 'Failed to clear cart'
            try {
              const errorData = await response.json()
              errorMessage = errorData.message || errorData.error || errorMessage
            } catch {
              try {
                const errorText = await response.text()
                errorMessage = errorText || errorMessage
              } catch {
                errorMessage = response.statusText || errorMessage
              }
            }
            throw new Error(errorMessage)
          }

          set({ items: [], subtotal: 0, itemCount: 0, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },
  })

// Use persisted store only in the browser
export const useCart = (typeof window !== 'undefined')
  ? create<CartState & CartActions>()(
      persist(createCartStore as any, {
        name: 'cart-storage',
        partialize: (state) => ({
          items: state.items,
          subtotal: state.subtotal,
          itemCount: state.itemCount,
        }),
      }) as any
    )
  : create<CartState & CartActions>()(createCartStore as any)