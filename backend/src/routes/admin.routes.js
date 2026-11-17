const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getStats, getUsers, toggleUserStatus, getChatAnalytics } = require('../controllers/admin.controller');

router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/chat-analytics', getChatAnalytics);

module.exports = router;
