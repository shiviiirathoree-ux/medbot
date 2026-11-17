const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  language: { type: String, default: 'en' },
  audioUrl: { type: String, default: '' }, // for voice messages
  timestamp: { type: Date, default: Date.now },
  tokens: { type: Number, default: 0 },
});

const ChatHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    title: { type: String, default: 'Health Consultation' },
    language: { type: String, default: 'en' },
    messages: [MessageSchema],
    totalTokens: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }], // auto-tagged topics like 'diabetes', 'headache'
    summary: { type: String, default: '' }, // AI-generated session summary
    sentiment: { type: String, enum: ['positive', 'neutral', 'concerned', 'urgent', ''], default: '' },
  },
  { timestamps: true }
);

ChatHistorySchema.index({ user: 1, createdAt: -1 });
ChatHistorySchema.index({ sessionId: 1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
