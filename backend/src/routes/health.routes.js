const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { logHealthRecord, getHealthRecords, getDashboard, updateMetrics, analyzeRisk, getDietPlan } = require('../controllers/health.controller');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/records', getHealthRecords);
router.post('/records', logHealthRecord);
router.put('/metrics', updateMetrics);
router.post('/risk-analysis', analyzeRisk);
router.get('/diet-plan', getDietPlan);

module.exports = router;
