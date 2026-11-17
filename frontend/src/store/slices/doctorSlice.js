import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchDoctors = createAsyncThunk('doctors/fetchAll', async (params = {}) => {
  const res = await api.get('/doctors', { params })
  return res.data
})
export const fetchDoctor = createAsyncThunk('doctors/fetchOne', async (id) => {
  const res = await api.get(`/doctors/${id}`)
  return res.data.data
})
export const fetchSpecializations = createAsyncThunk('doctors/specializations', async () => {
  const res = await api.get('/doctors/specializations')
  return res.data.data
})

const doctorSlice = createSlice({
  name: 'doctors',
  initialState: { list: [], selected: null, specializations: [], total: 0, pages: 0, loading: false, error: null },
  reducers: { clearSelected: (state) => { state.selected = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => { state.loading = true })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.data
        state.total = action.payload.total
        state.pages = action.payload.pages
      })
      .addCase(fetchDoctors.rejected, (state, a) => { state.loading = false; state.error = a.error.message })
      .addCase(fetchDoctor.fulfilled, (state, action) => { state.selected = action.payload })
      .addCase(fetchSpecializations.fulfilled, (state, action) => { state.specializations = action.payload })
  },
})
export const { clearSelected } = doctorSlice.actions
export default doctorSlice.reducer
