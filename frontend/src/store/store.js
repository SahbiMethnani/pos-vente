import { configureStore, createSlice } from '@reduxjs/toolkit'

// ─── Auth slice ──────────────────────────────────────────────────────────────

const storedUser = localStorage.getItem('pos_user')
let parsedUser = null
if (storedUser) {
  try {
    parsedUser = JSON.parse(storedUser)
  } catch (error) {
    parsedUser = null
    localStorage.removeItem('pos_user')
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: parsedUser,
    token: localStorage.getItem('pos_token') || null,
  },
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user ?? null
      state.token = action.payload.token
      localStorage.setItem('pos_token', action.payload.token)
      if (action.payload.user) {
        localStorage.setItem('pos_user', JSON.stringify(action.payload.user))
      } else {
        localStorage.removeItem('pos_user')
      }
    },
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
    },
  },
})

// ─── Cart slice ───────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    customer: null,
    discount: 0,
  },
  reducers: {
    addToCart(state, action) {
      const product = action.payload
      const existing = state.items.find((i) => i.product_id === product.id)
      if (existing) {
        existing.quantity += 1
        existing.line_total = existing.quantity * existing.unit_price - existing.discount
      } else {
        state.items.push({
          product_id: product.id,
          name: product.name,
          reference: product.reference,
          unit_price: product.selling_price,
          quantity: 1,
          discount: 0,
          line_total: product.selling_price,
          tax_rate: product.tax_rate,
        })
      }
    },
    updateCartItem(state, action) {
      const { product_id, quantity, discount } = action.payload
      const item = state.items.find((i) => i.product_id === product_id)
      if (item) {
        if (quantity !== undefined) item.quantity = quantity
        if (discount !== undefined) item.discount = discount
        item.line_total = item.quantity * item.unit_price - item.discount
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.product_id !== action.payload)
    },
    clearCart(state) {
      state.items = []
      state.customer = null
      state.discount = 0
    },
    setCustomer(state, action) {
      state.customer = action.payload
    },
    setDiscount(state, action) {
      state.discount = action.payload
    },
  },
})

export const { setAuth, logout } = authSlice.actions
export const { addToCart, updateCartItem, removeFromCart, clearCart, setCustomer, setDiscount } = cartSlice.actions

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
  },
})
