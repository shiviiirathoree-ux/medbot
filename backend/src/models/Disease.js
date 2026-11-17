const mongoose = require('mongoose');

const DiseaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    aliases: [{ type: String }],
    icdCode: { type: String, default: '' }, // ICD-10 code
    category: { type: String, default: '' }, // e.g. "Respiratory", "Cardiovascular"
    overview: { type: String, required: true },
    symptoms: [{ type: String }],
    causes: [{ type: String }],
    riskFactors: [{ type: String }],
    complications: [{ type: String }],
    prevention: [{ type: String }],
    treatments: [
      {
        type: { type: String }, // Medical, Surgical, Home remedy
        description: { type: String },
      },
    ],
    lifestyleChanges: [{ type: String }],
    riskLevel: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'moderate' },
    emergencyWarnings: [{ type: String }],
    isContagious: { type: Boolean, default: false },
    affectedAgeGroups: [{ type: String }],
    imageUrl: { type: String, default: '' },
    relatedDiseases: [{ type: String }],
    disclaimer: {
      type: String,
      default: 'This information is for educational purposes only. Consult a qualified medical professional for diagnosis and treatment.',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

DiseaseSchema.index({ name: 'text', aliases: 'text', symptoms: 'text', category: 'text' });

module.exports = mongoose.model('Disease', DiseaseSchema);
