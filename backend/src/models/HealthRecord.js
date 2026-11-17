const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    vitals: {
      bloodPressure: {
        systolic: { type: Number },
        diastolic: { type: Number },
      },
      heartRate: { type: Number }, // bpm
      bloodSugar: { type: Number }, // mg/dL
      temperature: { type: Number }, // Celsius
      oxygenSaturation: { type: Number }, // SpO2 %
      weight: { type: Number }, // kg
      bmi: { type: Number },
    },
    lifestyle: {
      waterIntake: { type: Number, default: 0 }, // glasses
      sleepHours: { type: Number, default: 0 },
      steps: { type: Number, default: 0 },
      exerciseMinutes: { type: Number, default: 0 },
      caloriesConsumed: { type: Number, default: 0 },
      stressLevel: { type: Number, min: 1, max: 10 }, // 1-10 scale
      moodScore: { type: Number, min: 1, max: 10 },
      mood: { type: String, enum: ['happy', 'sad', 'anxious', 'calm', 'stressed', 'neutral', ''] },
    },
    notes: { type: String, default: '' },
    reportUrl: { type: String, default: '' }, // Cloudinary URL of uploaded report
    reportSummary: { type: String, default: '' }, // AI-generated summary
    reportOcrText: { type: String, default: '' },
    healthScore: { type: Number, min: 0, max: 100 }, // AI-calculated
    aiInsights: [{ type: String }], // AI-generated health tips
    recordedBy: { type: String, enum: ['self', 'doctor', 'device'], default: 'self' },
  },
  { timestamps: true }
);

HealthRecordSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
