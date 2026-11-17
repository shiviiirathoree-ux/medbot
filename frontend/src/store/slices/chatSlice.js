import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchSessions = createAsyncThunk('chat/fetchSessions', async () => {
  const res = await api.get('/chat/sessions')
  return res.data.data
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ message, sessionId, language }) => {
  const res = await api.post('/chat/message', { message, sessionId, language })
  return res.data.data
})

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    sessions: [],
    activeSessionId: null,
    messages: [],
    isTyping: false,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveSession: (state, action) => { state.activeSessionId = action.payload },
    setMessages: (state, action) => { state.messages = action.payload },
    addMessage: (state, action) => { state.messages.push(action.payload) },
    setTyping: (state, action) => { state.isTyping = action.payload },
    clearChat: (state) => { state.messages = []; state.activeSessionId = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.fulfilled, (state, action) => { state.sessions = action.payload })
      .addCase(sendMessage.pending, (state) => { state.isTyping = true })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false
        state.activeSessionId = action.payload.sessionId
      })
      .addCase(sendMessage.rejected, (state) => { state.isTyping = false })
  },
})

export const { setActiveSession, setMessages, addMessage, setTyping, clearChat } = chatSlice.actions
export default chatSlice.reducer
