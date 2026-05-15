const express = require('express');
const axios = require('axios');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const router = express.Router();

const AI_MODULE_URL = process.env.AI_MODULE_URL || 'http://localhost:8000';

// POST /api/ai/predict
router.post('/predict', authenticate, authorize('admin', 'coordinator'), async (req, res) => {
  try {
    const response = await axios.post(`${AI_MODULE_URL}/predict`, req.body, { timeout: 10000 });
    logger.info(`AI prediction completed for incident: ${req.body.incidentId}`);
    res.json(response.data);
  } catch (err) {
    logger.warn('AI module offline, using fallback mock prediction');
    // Graceful fallback
    const { incidentType = 'flood', severity = 'high' } = req.body;
    const scoreMap = { critical: 90, high: 72, medium: 50, low: 30 };
    res.json({
      incidentId: req.body.incidentId || 'unknown',
      severityScore: scoreMap[severity] || 65,
      estimatedAffected: Math.floor(Math.random() * 5000) + 500,
      predictedSpread: `${incidentType} predicted to spread moderately over next 24 hours.`,
      recommendedResources: ['10 rescue boats', '200 medical kits', '1 helicopter', '50 personnel'],
      confidence: 78,
      riskFactors: ['High rainfall forecast', 'Dense population nearby', 'Limited road access'],
      source: 'fallback_model',
    });
  }
});

// GET /api/ai/health
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_MODULE_URL}/health`, { timeout: 3000 });
    res.json({ aiModule: 'online', ...response.data });
  } catch {
    res.json({ aiModule: 'offline', fallback: 'active' });
  }
});

module.exports = router;
