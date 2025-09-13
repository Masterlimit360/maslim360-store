'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ProductVariant } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, variant, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(
          item => item.product.id === product.id && item.variant?.id === variant?.id
        )

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${variant?.id || 'default'}`,
            product,
            variant,
            quantity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          set({ items: [...items, newItem] })
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter(item => item.id !== itemId) })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set({
          items: get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      get itemCount() {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((total, item) => {
          const price = item.variant?.price || item.product.price
          return total + (price * item.quantity)
        }, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
