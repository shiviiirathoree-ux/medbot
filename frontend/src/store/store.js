import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import chatSlice from './slices/chatSlice'
import medicineSlice from './slices/medicineSlice'
import doctorSlice from './slices/doctorSlice'
import healthSlice from './slices/healthSlice'
import notificationSlice from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    chat: chatSlice,
    medicines: medicineSlice,
    doctors: doctorSlice,
    health: healthSlice,
    notifications: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})
