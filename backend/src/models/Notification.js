const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['medicine_reminder', 'appointment', 'health_tip', 'emergency', 'system', 'refill'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    channels: [{ type: String, enum: ['app', 'sms', 'push', 'email'] }],
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra data
    actionUrl: { type: String, default: '' }, // deep link
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
