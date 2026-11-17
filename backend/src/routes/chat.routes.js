const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { sendMessage, getSessions, getSessionMessages, deleteSession, symptomCheck } = require('../controllers/chat.controller');

router.use(protect);
router.post('/message', sendMessage);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId', getSessionMessages);
router.delete('/sessions/:sessionId', deleteSession);
router.post('/symptom-check', symptomCheck);

module.exports = router;
