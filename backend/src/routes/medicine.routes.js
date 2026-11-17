const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getMedicines, addMedicine, updateMedicine, deleteMedicine, logDose, getMedicineLogs, getTodaySchedule } = require('../controllers/medicine.controller');

router.use(protect);
router.get('/today', getTodaySchedule);
router.get('/', getMedicines);
router.post('/', addMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);
router.post('/:id/log', logDose);
router.get('/:id/logs', getMedicineLogs);

module.exports = router;
