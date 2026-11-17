const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder');

const HEALTHCARE_SYSTEM_PROMPT = `You are MedBot, an expert AI healthcare assistant. Your role is to:
- Answer health-related questions accurately and compassionately
- Provide general health information, first-aid guidance, and wellness tips
- Explain symptoms, diseases, medications, and treatments in simple language
- Suggest when users should consult a doctor (always recommend for serious conditions)
- Offer mental health support and stress management tips
- Provide diet and lifestyle recommendations
- ALWAYS include a disclaimer that you are an AI and not a substitute for professional medical advice
- Never diagnose definitively - always encourage professional consultation
- Be empathetic, clear, and concise
- Format responses with bullet points or numbered lists when listing multiple items
- If the question is not health-related, gently redirect to health topics`;

const getModel = () => {
  try {
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (e) {
    logger.error('Failed to get Gemini model:', e.message);
    return null;
  }
};

// Main health chat response
exports.getHealthResponse = async (message, conversationHistory = [], user = null) => {
  try {
    const model = getModel();
    if (!model) throw new Error('AI model unavailable');

    const userContext = user
      ? `\nUser context: ${user.name}, Age: ${user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 'unknown'}, Blood Group: ${user.healthProfile?.bloodGroup || 'unknown'}`
      : '';

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: HEALTHCARE_SYSTEM_PROMPT + userContext }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am MedBot, your AI healthcare assistant. How can I help you today?' }],
        },
        ...conversationHistory.slice(-8).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      ],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    logger.error(`AI service error: ${error.message}`);
    return 'I apologize, I am temporarily unavailable. Please try again in a moment. For urgent health concerns, contact your healthcare provider or emergency services.';
  }
};

// Symptom analysis
exports.analyzeSymptoms = async (symptoms, user = null) => {
  try {
    const model = getModel();
    if (!model) throw new Error('AI model unavailable');

    const prompt = `As a medical AI, analyze these symptoms: "${symptoms}". 
    Provide a structured JSON response with:
    {
      "possibleConditions": ["condition1", "condition2"],
      "urgencyLevel": "low|moderate|high|emergency",
      "immediateActions": ["action1", "action2"],
      "doctorConsultation": "recommendation text",
      "disclaimer": "standard medical disclaimer",
      "homeRemedies": ["remedy1", "remedy2"],
      "warningSignsToWatch": ["sign1", "sign2"]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { possibleConditions: [], urgencyLevel: 'moderate', immediateActions: [text], doctorConsultation: 'Please consult a doctor', disclaimer: 'This is AI-generated information only.' };
  } catch (error) {
    logger.error(`Symptom analysis error: ${error.message}`);
    return { error: 'Analysis unavailable', message: 'Please consult a healthcare provider.' };
  }
};

// Disease prediction from symptoms
exports.predictDisease = async (symptoms) => {
  try {
    const model = getModel();
    if (!model) throw new Error('AI model unavailable');

    const symptomList = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;
    const prompt = `Based on these symptoms: ${symptomList}
    Return JSON:
    {
      "topPredictions": [{"disease": "name", "probability": "percentage", "description": "brief"}],
      "recommendedSpecialist": "specialist type",
      "urgency": "description",
      "disclaimer": "text"
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { topPredictions: [], disclaimer: 'Please consult a doctor.' };
  } catch (error) {
    logger.error(`Disease prediction error: ${error.message}`);
    return { error: 'Prediction unavailable' };
  }
};

// Health risk analysis
exports.analyzeHealthRisk = async ({ age, weight, bloodPressure, bloodSugar, lifestyle }) => {
  try {
    const model = getModel();
    if (!model) throw new Error('AI model unavailable');

    const prompt = `Analyze health risk for: Age:${age}, Weight:${weight}kg, BP:${JSON.stringify(bloodPressure)}, Blood Sugar:${bloodSugar}mg/dL, Lifestyle:${JSON.stringify(lifestyle)}.
    Return JSON:
    {
      "healthScore": 0-100,
      "riskLevel": "low|moderate|high|critical",
      "risks": [{"condition": "name", "probability": "low/medium/high", "description": "text"}],
      "recommendations": ["tip1", "tip2"],
      "dietAdvice": "text",
      "exerciseAdvice": "text",
      "disclaimer": "text"
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { healthScore: 70, riskLevel: 'moderate', recommendations: [], disclaimer: 'Consult your doctor.' };
  } catch (error) {
    logger.error(`Health risk analysis error: ${error.message}`);
    return { error: 'Analysis unavailable' };
  }
};

// Calculate health score
exports.calculateHealthScore = async (vitals = {}, lifestyle = {}, healthProfile = {}) => {
  try {
    const model = getModel();
    if (!model) return { score: 70, insights: ['Regular checkups recommended'] };

    const prompt = `Calculate health score for vitals: ${JSON.stringify(vitals)}, lifestyle: ${JSON.stringify(lifestyle)}.
    Return JSON: {"score": 0-100, "insights": ["insight1", "insight2", "insight3"]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 70, insights: [] };
  } catch (error) {
    return { score: 70, insights: ['Stay hydrated', 'Exercise regularly', 'Get adequate sleep'] };
  }
};

// Summarize medical report
exports.summarizeMedicalReport = async (ocrText) => {
  try {
    const model = getModel();
    if (!model) return { summary: 'AI unavailable', abnormalValues: [] };

    const prompt = `Analyze this medical report text and provide a patient-friendly summary:
    "${ocrText.slice(0, 2000)}"
    Return JSON:
    {
      "summary": "patient-friendly summary",
      "abnormalValues": ["value1 is high/low", "value2..."],
      "normalValues": ["value3 is normal"],
      "recommendations": ["tip1"],
      "disclaimer": "consult your doctor"
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: ocrText.slice(0, 200), abnormalValues: [] };
  } catch (error) {
    logger.error(`Report summary error: ${error.message}`);
    return { summary: 'Unable to generate summary', abnormalValues: [] };
  }
};

// Generate diet plan
exports.generateDietPlan = async (healthProfile = {}, healthMetrics = {}) => {
  try {
    const model = getModel();
    if (!model) return { plan: 'Balanced diet recommended' };

    const prompt = `Create a personalized 7-day diet plan for: Health Profile: ${JSON.stringify(healthProfile)}, Current Metrics: ${JSON.stringify(healthMetrics)}.
    Return JSON:
    {
      "weeklyPlan": [{"day": "Monday", "breakfast": "text", "lunch": "text", "dinner": "text", "snacks": "text"}],
      "nutritionTips": ["tip1", "tip2"],
      "foodsToAvoid": ["food1"],
      "hydrationGoal": "text",
      "disclaimer": "text"
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { weeklyPlan: [], nutritionTips: ['Eat balanced meals', 'Stay hydrated'] };
  } catch (error) {
    return { weeklyPlan: [], nutritionTips: ['Consult a nutritionist for personalized advice'] };
  }
};
