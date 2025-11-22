import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
          const token = localStorage.getItem('token')
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
            throw new Error('Failed to fetch cart')
          }

          const data = await response.json()
          set({
            items: data.items || [],
            subtotal: data.subtotal || 0,
            itemCount: data.itemCount || 0,
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

          const response = await fetch(`${API_URL}/cart/items`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId,
              variantId,
              quantity,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to add item to cart')
          }

          // Refresh cart after adding item
          await get().fetchCart()
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
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
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to update cart item')
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
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to remove cart item')
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
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to clear cart')
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