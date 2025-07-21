import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userReducer";
import cartReducer from "./reducers/cartReducer";
import roomTypeReducer from "./reducers/roomTypeReducer";
import serviceReducer from "./reducers/serviceReducer";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    roomType: roomTypeReducer,
    service: serviceReducer,
  },
});
