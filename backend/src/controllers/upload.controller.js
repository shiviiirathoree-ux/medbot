const HealthRecord = require('../models/HealthRecord');
const ocrService = require('../services/ocr.service');
const aiService = require('../services/ai.service');
const cloudinary = require('../config/cloudinary');

// @desc    Upload and scan medical report
// @route   POST /api/upload/report
exports.uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }
    const imageUrl = req.file.path; // Cloudinary URL

    // OCR extraction
    let ocrText = '';
    try {
      ocrText = await ocrService.extractText(imageUrl);
    } catch (e) {
      ocrText = 'OCR extraction failed';
    }

    // AI summary
    let summary = '';
    let abnormalValues = [];
    try {
      const aiResult = await aiService.summarizeMedicalReport(ocrText);
      summary = aiResult.summary;
      abnormalValues = aiResult.abnormalValues || [];
    } catch (e) {
      summary = 'AI summary unavailable';
    }

    // Save to health record
    const record = await HealthRecord.create({
      user: req.user._id,
      reportUrl: imageUrl,
      reportOcrText: ocrText,
      reportSummary: summary,
      aiInsights: abnormalValues,
      recordedBy: 'self',
    });

    res.status(200).json({
      success: true,
      data: { imageUrl, ocrText, summary, abnormalValues, recordId: record._id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile avatar
// @route   POST /api/upload/avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });
    const { User } = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, { avatar: req.file.path });
    res.status(200).json({ success: true, data: { avatarUrl: req.file.path } });
  } catch (error) {
    next(error);
  }
};
