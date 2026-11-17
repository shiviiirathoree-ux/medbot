const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "10:00 AM"
    type: { type: String, enum: ['in-person', 'online'], default: 'in-person' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
    },
    symptoms: { type: String, default: '' },
    notes: { type: String, default: '' },
    prescription: {
      medicines: [{ name: String, dosage: String, duration: String }],
      advice: String,
      followUp: Date,
    },
    meetingLink: { type: String, default: '' }, // for online consultations
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    amount: { type: Number, default: 0 },
    cancelledBy: { type: String, enum: ['patient', 'doctor', ''], default: '' },
    cancellationReason: { type: String, default: '' },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AppointmentSchema.index({ patient: 1, appointmentDate: -1 });
AppointmentSchema.index({ doctor: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
