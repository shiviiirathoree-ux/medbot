const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const smsService = require('./sms.service');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

// Check medicine reminders every minute
const checkMedicineReminders = async () => {
  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const medicines = await Medicine.find({
      isActive: true,
      reminderTimes: currentTime,
      startDate: { $lte: now },
      $or: [{ endDate: { $gte: today } }, { endDate: null }],
    }).populate('user', 'name phone fcmToken');

    logger.info(`[Reminder Check] ${currentTime} - Found ${medicines.length} reminders`);

    for (const medicine of medicines) {
      const user = medicine.user;
      if (!user) continue;

      // In-app notification
      await notificationService.createNotification(
        user._id,
        '💊 Medicine Reminder',
        `Time to take ${medicine.name} ${medicine.dosage}. ${medicine.instructions || ''}`,
        'medicine_reminder',
        { medicineId: medicine._id, scheduledTime: currentTime }
      );

      // Push notification
      if (user.fcmToken) {
        await notificationService.sendPushNotification(
          user.fcmToken,
          '💊 Medicine Reminder',
          `Time to take ${medicine.name} (${medicine.dosage})`
        );
      }

      // SMS reminder
      if (user.phone) {
        try {
          await smsService.sendMedicineReminder(user.phone, medicine.name, medicine.dosage, currentTime);
        } catch (e) {
          logger.warn(`SMS reminder failed for ${user.phone}: ${e.message}`);
        }
      }
    }
  } catch (error) {
    logger.error(`Reminder check error: ${error.message}`);
  }
};

// Daily health tip at 8 AM
const sendDailyHealthTip = async () => {
  const tips = [
    'Drink at least 8 glasses of water today! 💧',
    'Take a 30-minute walk for better cardiovascular health! 🚶',
    'Practice deep breathing for 5 minutes to reduce stress! 🧘',
    'Eat 5 servings of fruits and vegetables today! 🥗',
    'Get 7-8 hours of sleep tonight for optimal health! 😴',
    'Limit screen time before bed for better sleep quality! 📵',
    'Schedule your annual health checkup if you haven\'t! 🏥',
  ];
  const tip = tips[new Date().getDay()];
  try {
    const users = await User.find({ isActive: true, fcmToken: { $ne: '' } }).select('_id fcmToken');
    const tokens = users.map((u) => u.fcmToken).filter(Boolean);
    if (tokens.length > 0) {
      await notificationService.sendBulkNotification(tokens, '🌟 Daily Health Tip', tip);
    }
    logger.info(`Daily health tip sent to ${tokens.length} users`);
  } catch (error) {
    logger.error(`Daily health tip error: ${error.message}`);
  }
};

exports.startReminderJobs = () => {
  // Check medicine reminders every minute
  cron.schedule('* * * * *', checkMedicineReminders, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  });

  // Daily health tip at 8:00 AM
  cron.schedule('0 8 * * *', sendDailyHealthTip, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  });

  logger.info('✅ Reminder cron jobs started');
};
