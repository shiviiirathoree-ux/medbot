const Disease = require('../models/Disease');
const aiService = require('../services/ai.service');

// @desc    Get all diseases / search
// @route   GET /api/diseases
exports.getDiseases = async (req, res, next) => {
  try {
    const { search, category, riskLevel, page = 1, limit = 12 } = req.query;
    const query = {};
    if (category) query.category = { $regex: category, $options: 'i' };
    if (riskLevel) query.riskLevel = riskLevel;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { aliases: { $regex: search, $options: 'i' } },
        { symptoms: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [diseases, total] = await Promise.all([
      Disease.find(query).select('-__v').skip(skip).limit(parseInt(limit)).sort({ name: 1 }),
      Disease.countDocuments(query),
    ]);
    res.status(200).json({ success: true, count: diseases.length, total, data: diseases });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single disease
// @route   GET /api/diseases/:id
exports.getDisease = async (req, res, next) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.status(200).json({ success: true, data: disease });
  } catch (error) {
    next(error);
  }
};

// @desc    Create disease (Admin)
// @route   POST /api/diseases
exports.createDisease = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const disease = await Disease.create(req.body);
    res.status(201).json({ success: true, data: disease });
  } catch (error) {
    next(error);
  }
};

// @desc    Update disease (Admin)
// @route   PUT /api/diseases/:id
exports.updateDisease = async (req, res, next) => {
  try {
    const disease = await Disease.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.status(200).json({ success: true, data: disease });
  } catch (error) {
    next(error);
  }
};

// @desc    AI symptom to disease prediction
// @route   POST /api/diseases/predict
exports.predictDisease = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide symptoms' });
    }
    const prediction = await aiService.predictDisease(symptoms);

    // Also search our DB for matching diseases
    const dbMatches = await Disease.find({
      symptoms: { $in: symptoms.map((s) => new RegExp(s, 'i')) },
    }).limit(5).select('name overview riskLevel symptoms imageUrl');

    res.status(200).json({ success: true, data: { aiPrediction: prediction, dbMatches } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get disease categories
// @route   GET /api/diseases/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Disease.distinct('category');
    res.status(200).json({ success: true, data: categories.filter(Boolean) });
  } catch (error) {
    next(error);
  }
};
