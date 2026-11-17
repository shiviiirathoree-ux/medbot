const logger = require('../utils/logger');

let twilioClient = null;

const getClient = () => {
  if (twilioClient) return twilioClient;
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid'
  ) {
    logger.warn('Twilio credentials not configured. SMS will be logged only.');
    return null;
  }
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return twilioClient;
};

// Send SMS
exports.sendSMS = async (to, message) => {
  const client = getClient();
  if (!client) {
    logger.info(`[SMS MOCK] To: ${to} | Message: ${message}`);
    return { sid: 'mock_sid', status: 'sent_mock' };
  }
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS sent to ${to}: ${result.sid}`);
    return result;
  } catch (error) {
    logger.error(`SMS failed to ${to}: ${error.message}`);
    throw error;
  }
};

// Send medicine reminder SMS
exports.sendMedicineReminder = async (phone, medicineName, dosage, time) => {
  const message = `💊 Medicine Reminder: Time to take ${medicineName} (${dosage}) at ${time}. Stay healthy! - HealthBot`;
  return exports.sendSMS(phone, message);
};

// Send appointment reminder SMS
exports.sendAppointmentReminder = async (phone, doctorName, date, time) => {
  const message = `📅 Appointment Reminder: You have an appointment with Dr. ${doctorName} on ${date} at ${time}. - HealthBot`;
  return exports.sendSMS(phone, message);
};
