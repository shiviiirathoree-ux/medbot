import { createSlice } from '@reduxjs/toolkit'
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('token') },
  reducers: {
    setUser: (state, action) => { state.user = action.payload },
    setToken: (state, action) => { state.token = action.payload },
    clearAuth: (state) => { state.user = null; state.token = null },
  },
})
export const { setUser, setToken, clearAuth } = authSlice.actions
export default authSlice.reducer
