const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadReport, uploadAvatar } = require('../controllers/upload.controller');
const uploadMiddleware = require('../middleware/upload.middleware');

router.use(protect);
router.post('/report', uploadMiddleware.reportUpload.single('report'), uploadReport);
router.post('/avatar', uploadMiddleware.avatarUpload.single('avatar'), uploadAvatar);

module.exports = router;
