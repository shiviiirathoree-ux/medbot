const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const notificationService = require('../services/notification.service');

// @desc    Book appointment
// @route   POST /api/appointments
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, type, symptoms, notes } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Check for conflicting appointments
    const conflict = await Appointment.findOne({ doctor: doctorId, appointmentDate, timeSlot, status: { $ne: 'cancelled' } });
    if (conflict) return res.status(400).json({ success: false, message: 'This time slot is already booked' });

    const appointment = await Appointment.create({
      patient: req.user._id, doctor: doctorId, appointmentDate, timeSlot,
      type: type || 'in-person', symptoms, notes, amount: doctor.consultationFee,
    });

    await notificationService.createNotification(
      req.user._id,
      'Appointment Confirmed',
      `Your appointment with Dr. ${doctor.name} on ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot} is confirmed.`,
      'appointment'
    );

    const populated = await appointment.populate('doctor', 'name specialization hospital avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;
    const query = { patient: req.user._id };
    if (status) query.status = status;
    if (upcoming === 'true') query.appointmentDate = { $gte: new Date() };
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization hospital avatar rating consultationFee')
      .sort({ appointmentDate: -1 });
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user._id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.status === 'completed') return res.status(400).json({ success: false, message: 'Cannot cancel completed appointment' });
    appointment.status = 'cancelled';
    appointment.cancelledBy = 'patient';
    appointment.cancellationReason = req.body.reason || '';
    await appointment.save();
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots for a doctor
// @route   GET /api/appointments/slots/:doctorId
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Generate slots from doctor availability
    const slots = [];
    const start = parseInt(doctor.availability.startTime.split(':')[0]);
    const end = parseInt(doctor.availability.endTime.split(':')[0]);
    for (let h = start; h < end; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00 ${h < 12 ? 'AM' : 'PM'}`);
      slots.push(`${h.toString().padStart(2, '0')}:30 ${h < 12 ? 'AM' : 'PM'}`);
    }

    // Remove booked slots
    if (date) {
      const booked = await Appointment.find({
        doctor: req.params.doctorId,
        appointmentDate: new Date(date),
        status: { $ne: 'cancelled' },
      }).select('timeSlot');
      const bookedSlots = booked.map((a) => a.timeSlot);
      const available = slots.filter((s) => !bookedSlots.includes(s));
      return res.status(200).json({ success: true, data: available });
    }
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
};
