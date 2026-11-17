const Notification = require('../models/Notification');
const logger = require('../utils/logger');

let firebaseAdmin = null;

const getFirebase = () => {
  if (firebaseAdmin) return firebaseAdmin;
  if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === 'your_firebase_project_id') {
    logger.warn('Firebase not configured. Push notifications disabled.');
    return null;
  }
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    firebaseAdmin = admin;
    return admin;
  } catch (error) {
    logger.error(`Firebase init error: ${error.message}`);
    return null;
  }
};

// Create in-app notification
exports.createNotification = async (userId, title, message, type = 'system', metadata = {}) => {
  try {
    const notification = await Notification.create({
      user: userId, title, message, type,
      channels: ['app'], metadata,
    });
    return notification;
  } catch (error) {
    logger.error(`Create notification error: ${error.message}`);
  }
};

// Send push notification via Firebase
exports.sendPushNotification = async (fcmToken, title, body, data = {}) => {
  const admin = getFirebase();
  if (!admin || !fcmToken) {
    logger.info(`[PUSH MOCK] To: ${fcmToken} | ${title}: ${body}`);
    return;
  }
  try {
    const result = await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    logger.info(`Push notification sent: ${result}`);
    return result;
  } catch (error) {
    logger.error(`Push notification error: ${error.message}`);
  }
};

// Send notification to multiple users
exports.sendBulkNotification = async (tokens, title, body) => {
  const admin = getFirebase();
  if (!admin || !tokens?.length) return;
  try {
    const result = await admin.messaging().sendEachForMulticast({
      tokens, notification: { title, body },
    });
    logger.info(`Bulk notification: ${result.successCount} sent, ${result.failureCount} failed`);
    return result;
  } catch (error) {
    logger.error(`Bulk push error: ${error.message}`);
  }
};
