import { createSlice } from '@reduxjs/toolkit'

// Nếu cần lưu persist cart vào localStorage:
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem('cart_items')
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    return []
  }
}

const saveCartToStorage = (cart) => {
  localStorage.setItem('cart_items', JSON.stringify(cart))
}

const initialState = {
  items: loadCartFromStorage(),
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload
      saveCartToStorage(state.items)
    },
    addToCart: (state, action) => {
      const existing = state.items.find((item) => item.id === action.payload.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
      saveCartToStorage(state.items)
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      saveCartToStorage(state.items)
    },
    updateQuantity: (state, action) => {
      const { id, change } = action.payload
      state.items = state.items
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + change
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
      saveCartToStorage(state.items)
    },
    clearCart: (state) => {
      state.items = []
      saveCartToStorage([])
    },
  },
})

export const cartAction = cartSlice.actions

export const cartSelector = {
  selectCart: (state) => state.cart.items,
  totalItems: (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  totalServices: (state) => state.cart.items.length,
}

export default cartSlice.reducer
