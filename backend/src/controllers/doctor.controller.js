const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const logger = require('../utils/logger');

// @desc    Search/Get all doctors with filters
// @route   GET /api/doctors
exports.getDoctors = async (req, res, next) => {
  try {
    const { specialization, city, language, minRating, onlineOnly, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (city) query['hospital.city'] = { $regex: city, $options: 'i' };
    if (language) query.languages = { $in: [language] };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (onlineOnly === 'true') query.onlineConsultation = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { 'hospital.city': { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [doctors, total] = await Promise.all([
      Doctor.find(query).sort({ rating: -1, experience: -1 }).skip(skip).limit(parseInt(limit)),
      Doctor.countDocuments(query),
    ]);
    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Create doctor (Admin)
// @route   POST /api/doctors
exports.createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to doctor
// @route   POST /api/doctors/:id/review
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    doctor.reviews.push({ user: req.user._id, rating, comment });
    const avgRating = doctor.reviews.reduce((sum, r) => sum + r.rating, 0) / doctor.reviews.length;
    doctor.rating = Math.round(avgRating * 10) / 10;
    doctor.totalReviews = doctor.reviews.length;
    await doctor.save();
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specializations list
// @route   GET /api/doctors/specializations
exports.getSpecializations = async (req, res, next) => {
  try {
    const specializations = await Doctor.distinct('specialization');
    res.status(200).json({ success: true, data: specializations });
  } catch (error) {
    next(error);
  }
};
