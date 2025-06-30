import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 'light',
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    
  },
})

export const userAction = userSlice.actions

export const userSelector = {
  selectValue: state => state.user.value
}

export default userSlice.reducer