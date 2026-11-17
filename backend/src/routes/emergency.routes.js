const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getContacts, addContact, updateContact, deleteContact, triggerSOS, getSOSHistory } = require('../controllers/emergency.controller');

router.use(protect);
router.get('/contacts', getContacts);
router.post('/contacts', addContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);
router.post('/sos', triggerSOS);
router.get('/sos/history', getSOSHistory);

module.exports = router;
