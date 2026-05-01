'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { tokenize } = require('../services/tokenizer');
const { PRICING, estimateCost } = require('../config/pricing');

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

router.get('/', (_req, res) => {
  res.render('index', { pricing: PRICING });
});

router.get('/learn', (_req, res) => {
  res.render('learn');
});

router.post('/api/tokenize', apiLimiter, (req, res) => {
  const { text, model } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  if (!model || typeof model !== 'string') {
    return res.status(400).json({ error: 'model is required' });
  }
  if (text.length > 50_000) {
    return res.status(400).json({ error: 'Text too long (max 50,000 characters)' });
  }

  try {
    const result = tokenize(text, model);
    const cost = estimateCost(model, result.count);
    const pricing = PRICING[model];
    return res.json({
      model,
      label: pricing ? pricing.label : model,
      count: result.count,
      tokens: result.tokens,
      approximate: result.approximate,
      cost,
      vocabSize: pricing ? pricing.vocabSize : null,
      contextWindow: pricing ? pricing.contextWindow : null,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/api/tokenize/compare', apiLimiter, (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  if (text.length > 50_000) {
    return res.status(400).json({ error: 'Text too long (max 50,000 characters)' });
  }

  const models = Object.keys(PRICING);
  const results = models.map((modelId) => {
    try {
      const result = tokenize(text, modelId);
      const cost = estimateCost(modelId, result.count);
      return {
        model: modelId,
        label: PRICING[modelId].label,
        provider: PRICING[modelId].provider,
        count: result.count,
        tokens: result.tokens,
        approximate: result.approximate,
        cost,
        vocabSize: PRICING[modelId].vocabSize,
        contextWindow: PRICING[modelId].contextWindow,
      };
    } catch (err) {
      return { model: modelId, label: PRICING[modelId].label, error: err.message };
    }
  });

  return res.json(results);
});

module.exports = router;
