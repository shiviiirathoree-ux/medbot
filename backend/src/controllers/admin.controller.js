const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const ChatHistory = require('../models/ChatHistory');
const Medicine = require('../models/Medicine');
const HealthRecord = require('../models/HealthRecord');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalDoctors, totalAppointments, totalChats, totalMedicines] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      ChatHistory.countDocuments(),
      Medicine.countDocuments(),
    ]);
    const recentUsers = await User.find({ role: 'patient' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt');
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.status(200).json({
      success: true,
      data: { totalUsers, totalDoctors, totalAppointments, totalChats, totalMedicines, recentUsers, appointmentsByStatus },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-password'),
      User.countDocuments(query),
    ]);
    res.status(200).json({ success: true, count: users.length, total, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ success: true, data: { isActive: user.isActive } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chatbot analytics
// @route   GET /api/admin/chat-analytics
exports.getChatAnalytics = async (req, res, next) => {
  try {
    const totalSessions = await ChatHistory.countDocuments();
    const avgMessagesPerSession = await ChatHistory.aggregate([
      { $project: { msgCount: { $size: '$messages' } } },
      { $group: { _id: null, avg: { $avg: '$msgCount' } } },
    ]);
    const languageStats = await ChatHistory.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
    ]);
    res.status(200).json({
      success: true,
      data: { totalSessions, avgMessagesPerSession: avgMessagesPerSession[0]?.avg || 0, languageStats },
    });
  } catch (error) {
    next(error);
  }
};
