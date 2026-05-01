'use strict';

// Prices in USD per 1,000,000 tokens (as of 2025/2026)
const PRICING = {
  // ── OpenAI ──────────────────────────────────────────────
  'gpt-4o': {
    label: 'GPT-4o',
    provider: 'openai',
    input: 2.50,
    output: 10.00,
    vocabSize: 200019,   // o200k_base
    contextWindow: 128000,
  },
  'gpt-4o-mini': {
    label: 'GPT-4o mini',
    provider: 'openai',
    input: 0.15,
    output: 0.60,
    vocabSize: 200019,   // o200k_base
    contextWindow: 128000,
  },
  'gpt-3.5-turbo': {
    label: 'GPT-3.5 Turbo',
    provider: 'openai',
    input: 0.50,
    output: 1.50,
    vocabSize: 100277,   // cl100k_base
    contextWindow: 16385,
  },
  'o1': {
    label: 'o1',
    provider: 'openai',
    input: 15.00,
    output: 60.00,
    vocabSize: 200019,   // o200k_base
    contextWindow: 200000,
  },
  'o3': {
    label: 'o3',
    provider: 'openai',
    input: 4.00,
    output: 16.00,
    vocabSize: 200019,   // o200k_base
    contextWindow: 200000,
  },

  // ── Anthropic ────────────────────────────────────────────
  'claude-3-5-sonnet': {
    label: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    input: 3.00,
    output: 15.00,
    vocabSize: 100256,   // Claude BPE vocabulary
    contextWindow: 200000,
  },
  'claude-3-haiku': {
    label: 'Claude 3 Haiku',
    provider: 'anthropic',
    input: 0.80,
    output: 4.00,
    vocabSize: 100256,
    contextWindow: 200000,
  },
  'claude-3-opus': {
    label: 'Claude 3 Opus',
    provider: 'anthropic',
    input: 15.00,
    output: 75.00,
    vocabSize: 100256,
    contextWindow: 200000,
  },

  // ── Google ───────────────────────────────────────────────
  'gemini-1-5-pro': {
    label: 'Gemini 1.5 Pro',
    provider: 'google',
    input: 1.25,
    output: 10.00,
    vocabSize: 256000,   // SentencePiece, ~256k (not publicly disclosed)
    contextWindow: 2000000,
  },
  'gemini-2-5-flash': {
    label: 'Gemini 2.5 Flash',
    provider: 'google',
    input: 0.30,
    output: 2.50,
    vocabSize: 256000,
    contextWindow: 1000000,
  },

  // ── Mistral ──────────────────────────────────────────────
  'mistral-large': {
    label: 'Mistral Large',
    provider: 'mistral',
    input: 2.00,
    output: 6.00,
    vocabSize: 32000,    // shares Llama 2 SentencePiece tokenizer
    contextWindow: 128000,
  },
  'mistral-small': {
    label: 'Mistral Small',
    provider: 'mistral',
    input: 0.20,
    output: 0.60,
    vocabSize: 32000,
    contextWindow: 32000,
  },

  // ── Meta Llama (self-hosted = $0) ────────────────────────
  'llama-2': {
    label: 'Llama 2',
    provider: 'meta',
    input: 0,
    output: 0,
    vocabSize: 32000,    // SentencePiece BPE
    contextWindow: 4096,
  },
  'llama-3': {
    label: 'Llama 3',
    provider: 'meta',
    input: 0,
    output: 0,
    vocabSize: 128256,   // tiktoken cl100k_base extended
    contextWindow: 128000,
  },
};

/**
 * Calculate cost for a given token count and model.
 * @param {string} modelId
 * @param {number} tokenCount
 * @returns {{ inputCost: string, outputCost: string, isFree: boolean }}
 */
function estimateCost(modelId, tokenCount) {
  const model = PRICING[modelId];
  if (!model) return null;
  const inputCost = (tokenCount / 1_000_000) * model.input;
  const outputCost = (tokenCount / 1_000_000) * model.output;
  return {
    inputCost: inputCost.toFixed(6),
    outputCost: outputCost.toFixed(6),
    inputPer1M: model.input,
    outputPer1M: model.output,
    isFree: model.input === 0 && model.output === 0,
  };
}

module.exports = { PRICING, estimateCost };
