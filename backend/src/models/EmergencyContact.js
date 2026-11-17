const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true }, // e.g. "Mother", "Doctor"
    email: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
    notifyOnSOS: { type: Boolean, default: true },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

const SOSLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    triggeredAt: { type: Date, default: Date.now },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    contactsNotified: [{ type: String }],
    status: { type: String, enum: ['triggered', 'resolved', 'false_alarm'], default: 'triggered' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

const EmergencyContact = mongoose.model('EmergencyContact', EmergencyContactSchema);
const SOSLog = mongoose.model('SOSLog', SOSLogSchema);

module.exports = { EmergencyContact, SOSLog };
