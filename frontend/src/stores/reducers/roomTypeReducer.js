import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
};

const roomTypeSlice = createSlice({
  name: 'roomType',
  initialState,
  reducers: {
    setRoomTypes: (state, action) => {
      state.list = action.payload;
    },
  },
});

export const roomTypeActions = roomTypeSlice.actions;

export const roomTypeSelector = {
  selectAll: (state) => state.roomType.list,
  selectById: (id) => (state) => state.roomType.list.find(t => t.id === id)?.name,
};

export default roomTypeSlice.reducer;
