import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchMedicines = createAsyncThunk('medicines/fetchAll', async () => {
  const res = await api.get('/medicines')
  return res.data.data
})
export const fetchTodaySchedule = createAsyncThunk('medicines/today', async () => {
  const res = await api.get('/medicines/today')
  return res.data.data
})
export const addMedicine = createAsyncThunk('medicines/add', async (data) => {
  const res = await api.post('/medicines', data)
  return res.data.data
})
export const deleteMedicine = createAsyncThunk('medicines/delete', async (id) => {
  await api.delete(`/medicines/${id}`)
  return id
})
export const logDose = createAsyncThunk('medicines/logDose', async ({ id, ...data }) => {
  const res = await api.post(`/medicines/${id}/log`, data)
  return res.data.data
})

const medicineSlice = createSlice({
  name: 'medicines',
  initialState: { list: [], todaySchedule: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicines.pending, (state) => { state.loading = true })
      .addCase(fetchMedicines.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchMedicines.rejected, (state, action) => { state.loading = false; state.error = action.error.message })
      .addCase(fetchTodaySchedule.fulfilled, (state, action) => { state.todaySchedule = action.payload })
      .addCase(addMedicine.fulfilled, (state, action) => { state.list.unshift(action.payload) })
      .addCase(deleteMedicine.fulfilled, (state, action) => { state.list = state.list.filter(m => m._id !== action.payload) })
  },
})
export default medicineSlice.reducer
