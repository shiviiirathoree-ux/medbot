const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const aiService = require('../services/ai.service');

// @desc    Log health record
// @route   POST /api/health/records
exports.logHealthRecord = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    // Calculate BMI if weight/height provided
    if (req.body.vitals?.weight && req.user.healthProfile?.height) {
      const heightM = req.user.healthProfile.height / 100;
      req.body.vitals.bmi = parseFloat((req.body.vitals.weight / (heightM * heightM)).toFixed(1));
    }
    // Calculate health score via AI
    try {
      const scoreData = await aiService.calculateHealthScore(req.body.vitals, req.body.lifestyle, req.user.healthProfile);
      req.body.healthScore = scoreData.score;
      req.body.aiInsights = scoreData.insights;
    } catch (e) { /* fallback if AI fails */ }
    const record = await HealthRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Get health records
// @route   GET /api/health/records
exports.getHealthRecords = async (req, res, next) => {
  try {
    const { days = 30, limit = 30 } = req.query;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));
    const records = await HealthRecord.find({ user: req.user._id, date: { $gte: fromDate } })
      .sort({ date: -1 }).limit(parseInt(limit));
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary
// @route   GET /api/health/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecord = await HealthRecord.findOne({ user: req.user._id, date: { $gte: today } }).sort({ date: -1 });
    const last7 = await HealthRecord.find({ user: req.user._id, date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
      .sort({ date: 1 }).select('vitals lifestyle date healthScore');

    res.status(200).json({
      success: true,
      data: {
        user: { name: user.name, avatar: user.avatar, healthProfile: user.healthProfile },
        todayMetrics: user.healthMetrics,
        todayRecord,
        last7DaysTrend: last7,
        healthScore: todayRecord?.healthScore || 0,
        aiInsights: todayRecord?.aiInsights || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update daily health metrics (water, steps, sleep)
// @route   PUT /api/health/metrics
exports.updateMetrics = async (req, res, next) => {
  try {
    const { waterIntake, sleepHours, steps, heartRate } = req.body;
    const updateData = { 'healthMetrics.lastUpdated': new Date() };
    if (waterIntake !== undefined) updateData['healthMetrics.waterIntake'] = waterIntake;
    if (sleepHours !== undefined) updateData['healthMetrics.sleepHours'] = sleepHours;
    if (steps !== undefined) updateData['healthMetrics.steps'] = steps;
    if (heartRate !== undefined) updateData['healthMetrics.heartRate'] = heartRate;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    res.status(200).json({ success: true, data: user.healthMetrics });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Health Risk Analyzer
// @route   POST /api/health/risk-analysis
exports.analyzeRisk = async (req, res, next) => {
  try {
    const { age, weight, bloodPressure, bloodSugar, lifestyle } = req.body;
    const analysis = await aiService.analyzeHealthRisk({ age, weight, bloodPressure, bloodSugar, lifestyle });
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI diet plan
// @route   GET /api/health/diet-plan
exports.getDietPlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const plan = await aiService.generateDietPlan(user.healthProfile, user.healthMetrics);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};
