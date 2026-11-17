const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getDiseases, getDisease, createDisease, updateDisease, predictDisease, getCategories } = require('../controllers/disease.controller');

router.get('/categories', getCategories);
router.post('/predict', protect, predictDisease);
router.get('/', getDiseases);
router.get('/:id', getDisease);
router.post('/', protect, authorize('admin'), createDisease);
router.put('/:id', protect, authorize('admin'), updateDisease);

module.exports = router;
