const { createWorker } = require('tesseract.js');
const logger = require('../utils/logger');

// Extract text from image URL using Tesseract.js OCR
exports.extractText = async (imageUrl) => {
  let worker = null;
  try {
    worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageUrl);
    logger.info(`OCR completed, extracted ${text.length} characters`);
    return text;
  } catch (error) {
    logger.error(`OCR error: ${error.message}`);
    throw new Error(`OCR extraction failed: ${error.message}`);
  } finally {
    if (worker) await worker.terminate();
  }
};

// Extract key values from medical report text
exports.extractMedicalValues = (text) => {
  const patterns = {
    hemoglobin: /hemoglobin[:\s]+([0-9.]+)/i,
    glucose: /glucose[:\s]+([0-9.]+)/i,
    cholesterol: /cholesterol[:\s]+([0-9.]+)/i,
    bloodPressure: /blood pressure[:\s]+([0-9]+\/[0-9]+)/i,
    heartRate: /heart rate[:\s]+([0-9]+)/i,
    creatinine: /creatinine[:\s]+([0-9.]+)/i,
  };

  const values = {};
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) values[key] = match[1];
  }
  return values;
};
