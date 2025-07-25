import { createSlice } from "@reduxjs/toolkit";

// helpers
const loadCartFromStorage = (booking) => {
  try {
    const raw = localStorage.getItem(`cart_items_${booking.id}`);
    if (!raw) return [];

    const { items, expiry } = JSON.parse(raw);

    const now = new Date();
    const expiryDate = new Date(expiry);

    if (now > expiryDate) {
      // đã quá hạn checkout → xóa
      localStorage.removeItem(`cart_items_${booking.id}`);
      return [];
    }

    return items;
  } catch {
    return [];
  }
};

const saveCartToStorage = (booking, cart) => {
  const data = {
    items: cart,
    expiry: booking.endDate,
  };

  localStorage.setItem(`cart_items_${booking.id}`, JSON.stringify(data));
};


// reducer
const initialState = {
  booking: {},
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setBooking: (state, action) => {
      state.booking = action.payload;
      state.items = loadCartFromStorage(action.payload);
    },
    addToCart: (state, action) => {
      state.items.push(action.payload)
      saveCartToStorage(state.booking, state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.uuid !== action.payload);
      saveCartToStorage(state.booking, state.items);
    },
    clearCart: (state) => {
      state.items = [];
      if (state.booking) {
        localStorage.removeItem(`cart_items_${state.booking.id}`);
      }
    },
  },
});

export const cartAction = cartSlice.actions;

export const cartSelector = {
  selectCart: (state) => state.cart.items,
  booking: (state) => state.cart.booking,
};

export default cartSlice.reducer
