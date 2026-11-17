const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { register, login, getMe, updateProfile, changePassword, logout, updateFcmToken } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/fcm-token', protect, updateFcmToken);

module.exports = router;
