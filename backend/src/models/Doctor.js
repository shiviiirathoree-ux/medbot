const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    avatar: { type: String, default: '' },
    specialization: { type: String, required: true },
    qualifications: [{ type: String }],
    experience: { type: Number, default: 0 }, // years
    licenseNumber: { type: String },
    hospital: {
      name: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    consultationFee: { type: Number, default: 0 },
    languages: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    availability: {
      days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
    },
    onlineConsultation: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    bio: { type: String, maxlength: 1000 },
    about: { type: String },
  },
  { timestamps: true }
);

DoctorSchema.index({ specialization: 'text', name: 'text', 'hospital.city': 'text' });
DoctorSchema.index({ 'hospital.city': 1, specialization: 1 });

module.exports = mongoose.model('Doctor', DoctorSchema);
