import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
};

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setServices: (state, action) => {
      state.list = action.payload;
    },
  },
});

export const serviceActions = serviceSlice.actions;

export const serviceSelector = {
  selectAll: (state) => state.service.list,
};

export default serviceSlice.reducer;
