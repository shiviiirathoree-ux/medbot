const Medicine = require('../models/Medicine');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');

// @desc    Get all medicines for user
// @route   GET /api/medicines
exports.getMedicines = async (req, res, next) => {
  try {
    const { active, familyMember } = req.query;
    const query = { user: req.user._id };
    if (active !== undefined) query.isActive = active === 'true';
    if (familyMember) query.familyMember = familyMember;
    const medicines = await Medicine.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    next(error);
  }
};

// @desc    Add medicine
// @route   POST /api/medicines
exports.addMedicine = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const medicine = await Medicine.create(req.body);
    logger.info(`Medicine added: ${medicine.name} for user ${req.user._id}`);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    Object.assign(medicine, req.body);
    await medicine.save();
    res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.status(200).json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark medicine as taken/missed
// @route   POST /api/medicines/:id/log
exports.logDose = async (req, res, next) => {
  try {
    const { status, scheduledTime, note } = req.body;
    const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    medicine.logs.push({ status, scheduledTime, note, date: new Date() });
    if (status === 'taken' && medicine.remainingQuantity > 0) {
      medicine.remainingQuantity -= 1;
      if (medicine.refillReminder && medicine.remainingQuantity <= medicine.refillThreshold) {
        await notificationService.createNotification(
          req.user._id,
          'Refill Reminder',
          `${medicine.name} is running low. Only ${medicine.remainingQuantity} left.`,
          'refill'
        );
      }
    }
    await medicine.save();
    res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medicine history/logs
// @route   GET /api/medicines/:id/logs
exports.getMedicineLogs = async (req, res, next) => {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.status(200).json({ success: true, data: medicine.logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's medicine schedule
// @route   GET /api/medicines/today
exports.getTodaySchedule = async (req, res, next) => {
  try {
    const today = new Date();
    const medicines = await Medicine.find({
      user: req.user._id,
      isActive: true,
      startDate: { $lte: today },
      $or: [{ endDate: { $gte: today } }, { endDate: null }],
    });
    const schedule = medicines.map((med) => ({
      _id: med._id,
      name: med.name,
      dosage: med.dosage,
      form: med.form,
      reminderTimes: med.reminderTimes,
      instructions: med.instructions,
      color: med.color,
      familyMember: med.familyMember,
      takenToday: med.logs.filter(
        (log) => new Date(log.date).toDateString() === today.toDateString() && log.status === 'taken'
      ).length,
    }));
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};
