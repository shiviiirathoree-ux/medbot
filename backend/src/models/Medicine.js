const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Medicine name is required'], trim: true },
    genericName: { type: String, default: '' },
    dosage: { type: String, required: [true, 'Dosage is required'] }, // e.g. "500mg"
    form: { type: String, enum: ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'other'], default: 'tablet' },
    frequency: { type: String, enum: ['once', 'twice', 'thrice', 'four_times', 'custom'], default: 'once' },
    reminderTimes: [{ type: String }], // e.g. ["08:00", "20:00"]
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    instructions: { type: String, default: '' }, // e.g. "Take after meals"
    prescribedBy: { type: String, default: '' },
    totalQuantity: { type: Number, default: 0 },
    remainingQuantity: { type: Number, default: 0 },
    refillReminder: { type: Boolean, default: true },
    refillThreshold: { type: Number, default: 5 }, // remind when <= 5 left
    isActive: { type: Boolean, default: true },
    familyMember: { type: String, default: 'self' }, // self or family member name
    logs: [
      {
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['taken', 'missed', 'skipped'], default: 'taken' },
        scheduledTime: { type: String },
        note: { type: String },
      },
    ],
    imageUrl: { type: String, default: '' },
    color: { type: String, default: '#6366f1' }, // color tag for UI
  },
  { timestamps: true }
);

MedicineSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Medicine', MedicineSchema);
