import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchDashboard = createAsyncThunk('health/dashboard', async () => {
  const res = await api.get('/health/dashboard')
  return res.data.data
})
export const fetchHealthRecords = createAsyncThunk('health/records', async (params = {}) => {
  const res = await api.get('/health/records', { params })
  return res.data.data
})
export const updateMetrics = createAsyncThunk('health/updateMetrics', async (data) => {
  const res = await api.put('/health/metrics', data)
  return res.data.data
})
export const logHealthRecord = createAsyncThunk('health/logRecord', async (data) => {
  const res = await api.post('/health/records', data)
  return res.data.data
})

const healthSlice = createSlice({
  name: 'health',
  initialState: { dashboard: null, records: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload })
      .addCase(fetchDashboard.rejected, (state, a) => { state.loading = false; state.error = a.error.message })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => { state.records = action.payload })
      .addCase(updateMetrics.fulfilled, (state, action) => {
        if (state.dashboard) state.dashboard.todayMetrics = action.payload
      })
  },
})
export default healthSlice.reducer
