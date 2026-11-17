import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendMessage, fetchSessions, setMessages, clearChat } from '../../store/slices/chatSlice'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Plus, Trash2, Volume2, Bot, User, Sparkles, ChevronRight } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const QUICK_PROMPTS = [
  'I have a headache and fever, what should I do?',
  'What are symptoms of diabetes?',
  'How to lower blood pressure naturally?',
  'What vitamins should I take daily?',
  'I feel anxious, any tips?',
]

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'gradient-bg' : 'bg-primary-900/50 border border-primary-700/30'}`}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-primary-400" />}
      </div>
      <div className={isUser ? 'chat-user' : 'chat-bot'} style={{ maxWidth: '75%' }}>
        <p className="leading-relaxed whitespace-pre-wrap text-sm">{msg.content}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-primary-200/60' : 'text-slate-500'}`}>
          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-primary-900/50 border border-primary-700/30 flex items-center justify-center">
        <Bot className="w-3.5 h-3.5 text-primary-400" />
      </div>
      <div className="chat-bot flex items-center gap-1 py-4 px-5">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary-400"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
        ))}
      </div>
    </div>
  )
}

export default function Chat() {
  const dispatch = useDispatch()
  const { language } = useLanguage()
  const { user } = useAuth()
  const { sessions, isTyping, activeSessionId } = useSelector(s => s.chat)
  const [messages, setLocalMessages] = useState([])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showSessions, setShowSessions] = useState(true)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const bottomRef = useRef(null)
  const mediaRef = useRef(null)
  const { t } = useLanguage()

  useEffect(() => { dispatch(fetchSessions()) }, [dispatch])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  // Add welcome message
  useEffect(() => {
    setLocalMessages([{
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm MedBot, your AI healthcare assistant. I can help you with:\n\n• Health questions & symptoms\n• Medicine information\n• First aid guidance\n• Wellness tips\n\nHow can I help you today?`,
      timestamp: new Date(),
    }])
  }, [user?.name])

  const handleSend = async (text = input) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', content: text, timestamp: new Date() }
    setLocalMessages(prev => [...prev, userMsg])
    setInput('')
    try {
      const res = await api.post('/chat/message', { message: text, sessionId: currentSessionId, language })
      setCurrentSessionId(res.data.data.sessionId)
      setLocalMessages(prev => [...prev, {
        role: 'assistant', content: res.data.data.message, timestamp: new Date()
      }])
      dispatch(fetchSessions())
    } catch (err) {
      setLocalMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, I\'m having trouble connecting right now. Please check your connection and try again.',
        timestamp: new Date()
      }])
    }
  }

  const loadSession = async (sessionId) => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`)
      setLocalMessages(res.data.data.messages)
      setCurrentSessionId(sessionId)
    } catch { toast.error('Failed to load session') }
  }

  const startNewChat = () => {
    setCurrentSessionId(null)
    setLocalMessages([{
      role: 'assistant',
      content: `Hello! Starting a new conversation. What health topic can I help you with?`,
      timestamp: new Date()
    }])
  }

  // Voice recording
  const toggleVoice = async () => {
    if (isRecording) {
      mediaRef.current?.stop()
      setIsRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = e => chunks.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        toast('Voice recorded — transcription requires Speech API key', { icon: '🎤' })
      }
      recorder.start()
      mediaRef.current = recorder
      setIsRecording(true)
      setTimeout(() => { recorder.stop(); setIsRecording(false) }, 10000)
    } catch { toast.error('Microphone permission denied') }
  }

  // Text-to-speech
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.rate = 0.95
      window.speechSynthesis.speak(utt)
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 max-w-7xl mx-auto">
      {/* Sessions sidebar */}
      <AnimatePresence>
        {showSessions && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="w-64 flex-shrink-0 card flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">{t('chat.history')}</h3>
              <button onClick={startNewChat} className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1">
                <Plus className="w-3 h-3" /> {t('chat.newChat')}
              </button>
            </div>
            <div className="space-y-1 overflow-y-auto flex-1">
              {sessions.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">No previous chats</p>
              ) : sessions.map(s => (
                <button key={s.sessionId} onClick={() => loadSession(s.sessionId)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/5 ${currentSessionId === s.sessionId ? 'bg-primary-900/40 border border-primary-700/30' : ''}`}>
                  <p className="text-sm text-white truncate font-medium">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{s.lastMessage}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat main */}
      <div className="flex-1 card flex flex-col min-w-0 overflow-hidden p-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setShowSessions(p => !p)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400">
            <ChevronRight className={`w-4 h-4 transition-transform ${showSessions ? 'rotate-180' : ''}`} />
          </button>
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">{t('chat.title')}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slateald-400">Online • AI Powered</span>
            </div>
          </div>
          <div className="ml-auto">
            <button onClick={startNewChat} className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.map((msg, i) => (
            <div key={i} className="group relative">
              <MessageBubble msg={msg} />
              {msg.role === 'assistant' && (
                <button onClick={() => speak(msg.content)}
                  className="opacity-0 group-hover:opacity-100 absolute -top-1 right-0 w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                  <Volume2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {isTyping && <TypingBubble />}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-5 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
          {QUICK_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => handleSend(p)}
              className="flex-shrink-0 px-3 py-1.5 text-xs rounded-full border border-white/10 text-slate-400 hover:text-primary-300 hover:border-primary-700/40 transition-colors whitespace-nowrap">
              {p.length > 35 ? p.slice(0, 35) + '...' : p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 pb-4 pt-2 border-t border-white/5 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                id="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={t('chat.placeholder')}
                rows={1}
                className="input resize-none py-3 pr-4 max-h-32 overflow-y-auto"
                style={{ scrollbarWidth: 'none' }}
              />
            </div>
            <button onClick={toggleVoice}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <motion.button id="send-message" onClick={() => handleSend()} disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}>
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
