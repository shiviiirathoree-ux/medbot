const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { bookAppointment, getAppointments, cancelAppointment, getAvailableSlots } = require('../controllers/appointment.controller');

router.use(protect);
router.get('/slots/:doctorId', getAvailableSlots);
router.get('/', getAppointments);
router.post('/', bookAppointment);
router.put('/:id/cancel', cancelAppointment);

module.exports = router;
