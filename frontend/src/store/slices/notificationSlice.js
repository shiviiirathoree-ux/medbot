import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const res = await api.get('/notifications')
  return res.data
})
export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.put('/notifications/read-all')
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification: (state, action) => { state.list.unshift(action.payload); state.unreadCount += 1 },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.data
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(markAllRead.fulfilled, (state) => { state.unreadCount = 0; state.list.forEach(n => n.isRead = true) })
  },
})
export const { addNotification } = notificationSlice.actions
export default notificationSlice.reducer
