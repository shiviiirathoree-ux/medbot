const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getDoctors, getDoctor, createDoctor, updateDoctor, addReview, getSpecializations } = require('../controllers/doctor.controller');

router.get('/specializations', getSpecializations);
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.post('/:id/review', protect, addReview);
router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('admin', 'doctor'), updateDoctor);

module.exports = router;
