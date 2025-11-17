import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  info: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.info = action.payload;
    },
    logout: (state) => {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      state.info = null;
    },
  },
});

export const userAction = userSlice.actions;

export const userSelector = {
  selectUser: (state) => state.user.info,
  selectRole: (state) => state.user.info?.role,
  isLoggedIn: (state) => state.user.info?.isSuccess,
  selectTier: (state) => state.user.info?.tier,
};

export default userSlice.reducer;
