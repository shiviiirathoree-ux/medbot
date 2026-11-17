const { EmergencyContact, SOSLog } = require('../models/EmergencyContact');
const smsService = require('../services/sms.service');
const notificationService = require('../services/notification.service');

// @desc    Get emergency contacts
// @route   GET /api/emergency/contacts
exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user._id }).sort({ isPrimary: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
};

// @desc    Add emergency contact
// @route   POST /api/emergency/contacts
exports.addContact = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    if (req.body.isPrimary) {
      await EmergencyContact.updateMany({ user: req.user._id }, { isPrimary: false });
    }
    const contact = await EmergencyContact.create(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Update emergency contact
// @route   PUT /api/emergency/contacts/:id
exports.updateContact = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/emergency/contacts/:id
exports.deleteContact = async (req, res, next) => {
  try {
    await EmergencyContact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger SOS
// @route   POST /api/emergency/sos
exports.triggerSOS = async (req, res, next) => {
  try {
    const { lat, lng, address } = req.body;
    const contacts = await EmergencyContact.find({ user: req.user._id, notifyOnSOS: true });

    const sosLog = await SOSLog.create({
      user: req.user._id,
      location: { lat, lng, address },
      contactsNotified: contacts.map((c) => c.phone),
    });

    const message = `🚨 SOS ALERT: ${req.user.name} needs emergency help! Location: ${address || `${lat},${lng}`} - Sent from HealthBot`;

    // Send SMS to all emergency contacts
    const smsPromises = contacts.map((contact) =>
      smsService.sendSMS(contact.phone, message).catch(() => null)
    );
    await Promise.all(smsPromises);

    // Also emit socket event
    if (req.io) {
      req.io.emit('sos_triggered', { userId: req.user._id, location: { lat, lng, address } });
    }

    res.status(200).json({
      success: true,
      message: `SOS sent to ${contacts.length} emergency contact(s)`,
      data: sosLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get SOS history
// @route   GET /api/emergency/sos/history
exports.getSOSHistory = async (req, res, next) => {
  try {
    const logs = await SOSLog.find({ user: req.user._id }).sort({ triggeredAt: -1 }).limit(10);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
