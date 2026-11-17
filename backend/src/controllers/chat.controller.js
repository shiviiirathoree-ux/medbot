const { v4: uuidv4 } = require('uuid');
const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/ai.service');
const translateService = require('../services/translate.service');
const logger = require('../utils/logger');

// @desc    Send message to AI chatbot
// @route   POST /api/chat/message
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId, language = 'en' } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    // Find or create chat session
    let session = sessionId
      ? await ChatHistory.findOne({ sessionId, user: userId })
      : null;

    if (!session) {
      session = await ChatHistory.create({
        user: userId,
        sessionId: uuidv4(),
        language,
        messages: [],
        title: message.slice(0, 50),
      });
    }

    // Translate to English if needed for AI processing
    let processMessage = message;
    if (language !== 'en') {
      try {
        processMessage = await translateService.translateToEnglish(message, language);
      } catch (e) {
        logger.warn(`Translation failed, using original: ${e.message}`);
      }
    }

    // Build conversation history for context
    const conversationHistory = session.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI response
    const aiResponse = await aiService.getHealthResponse(processMessage, conversationHistory, req.user);

    // Translate response back if needed
    let finalResponse = aiResponse;
    if (language !== 'en') {
      try {
        finalResponse = await translateService.translateFromEnglish(aiResponse, language);
      } catch (e) {
        logger.warn(`Response translation failed: ${e.message}`);
      }
    }

    // Save messages to session
    session.messages.push({ role: 'user', content: message, language });
    session.messages.push({ role: 'assistant', content: finalResponse, language });
    session.language = language;
    await session.save();

    // Emit via socket if connected
    if (req.io) {
      req.io.to(`user_${userId}`).emit('chat_response', {
        sessionId: session.sessionId,
        message: finalResponse,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        message: finalResponse,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history sessions
// @route   GET /api/chat/sessions
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatHistory.find({ user: req.user._id })
      .select('sessionId title language createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20);

    const sessionList = sessions.map((s) => ({
      sessionId: s.sessionId,
      title: s.title,
      language: s.language,
      messageCount: s.messages.length,
      lastMessage: s.messages.length > 0 ? s.messages[s.messages.length - 1].content.slice(0, 80) : '',
      updatedAt: s.updatedAt,
    }));

    res.status(200).json({ success: true, count: sessionList.length, data: sessionList });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a specific session
// @route   GET /api/chat/sessions/:sessionId
exports.getSessionMessages = async (req, res, next) => {
  try {
    const session = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chat session
// @route   DELETE /api/chat/sessions/:sessionId
exports.deleteSession = async (req, res, next) => {
  try {
    await ChatHistory.findOneAndDelete({ sessionId: req.params.sessionId, user: req.user._id });
    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Symptom Checker
// @route   POST /api/chat/symptom-check
exports.symptomCheck = async (req, res, next) => {
  try {
    const { symptoms, language = 'en' } = req.body;
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide symptoms' });
    }
    const symptomText = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;
    const result = await aiService.analyzeSymptoms(symptomText, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
