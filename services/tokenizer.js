'use strict';

const { get_encoding } = require('tiktoken');
const { getTokenizer: getAnthropicTokenizer } = require('@anthropic-ai/tokenizer');
const llamaTokenizer = require('llama-tokenizer-js');

// Cache encoding instances (they're expensive to init)
let _cl100k = null;
let _o200k = null;
let _anthropic = null;

function getCl100k() {
  if (!_cl100k) _cl100k = get_encoding('cl100k_base');
  return _cl100k;
}

function getO200k() {
  if (!_o200k) _o200k = get_encoding('o200k_base');
  return _o200k;
}

function getAnthropic() {
  if (!_anthropic) _anthropic = getAnthropicTokenizer();
  return _anthropic;
}

const llamaInst = llamaTokenizer.default ?? llamaTokenizer;

// ─── Tokenizer implementations ────────────────────────────────────────────────

function tiktokenTokenize(text, encoding) {
  const enc = encoding === 'o200k_base' ? getO200k() : getCl100k();
  const ids = enc.encode(text);
  const tokens = [];
  for (const id of ids) {
    const bytes = enc.decode(new Uint32Array([id]));
    tokens.push({ id, text: Buffer.from(bytes).toString('utf8') });
  }
  return tokens;
}

function anthropicTokenize(text) {
  const tok = getAnthropic();
  const ids = tok.encode(text);
  const tokens = [];
  for (const id of ids) {
    const bytes = tok.decode(new Uint32Array([id]));
    tokens.push({ id, text: Buffer.from(bytes).toString('utf8') });
  }
  return tokens;
}

function llamaTokenize(text) {
  const ids = llamaInst.encode(text);
  const tokens = [];
  for (const id of ids) {
    const decoded = llamaInst.decode([id]);
    // Skip BOS/EOS control tokens that decode to empty string
    if (decoded === '') continue;
    tokens.push({ id, text: decoded });
  }
  return tokens;
}

// Gemini: no public offline tokenizer — approximate with ~4 chars/token
function geminiApproxTokenize(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + 4);
    tokens.push({ id: null, text: chunk });
    i += 4;
  }
  return tokens;
}

// ─── Model → tokenizer dispatch ──────────────────────────────────────────────

const MODEL_CONFIG = {
  'gpt-4o':          { fn: () => tiktokenTokenize, enc: 'o200k_base', approximate: false },
  'gpt-4o-mini':     { fn: () => tiktokenTokenize, enc: 'o200k_base', approximate: false },
  'gpt-3.5-turbo':   { fn: () => tiktokenTokenize, enc: 'cl100k_base', approximate: false },
  'o1':              { fn: () => tiktokenTokenize, enc: 'o200k_base', approximate: false },
  'o3':              { fn: () => tiktokenTokenize, enc: 'o200k_base', approximate: false },
  'claude-3-5-sonnet': { fn: null, type: 'anthropic', approximate: false },
  'claude-3-haiku':    { fn: null, type: 'anthropic', approximate: false },
  'claude-3-opus':     { fn: null, type: 'anthropic', approximate: false },
  'llama-2':         { fn: null, type: 'llama', approximate: false },
  'llama-3':         { fn: null, type: 'llama', approximate: true },
  'mistral-large':   { fn: null, type: 'llama', approximate: true },
  'mistral-small':   { fn: null, type: 'llama', approximate: true },
  'gemini-1-5-pro':  { fn: null, type: 'gemini', approximate: true },
  'gemini-2-5-flash':{ fn: null, type: 'gemini', approximate: true },
};

/**
 * Tokenize text for a given model.
 * @param {string} text
 * @param {string} modelId
 * @returns {{ tokens: Array<{id: number|null, text: string}>, count: number, approximate: boolean }}
 */
function tokenize(text, modelId) {
  const config = MODEL_CONFIG[modelId];
  if (!config) throw new Error(`Unknown model: ${modelId}`);

  let tokens;
  if (config.type === 'anthropic') {
    tokens = anthropicTokenize(text);
  } else if (config.type === 'llama') {
    tokens = llamaTokenize(text);
  } else if (config.type === 'gemini') {
    tokens = geminiApproxTokenize(text);
  } else {
    // tiktoken
    tokens = tiktokenTokenize(text, config.enc);
  }

  return {
    tokens,
    count: tokens.length,
    approximate: config.approximate,
  };
}

module.exports = { tokenize };
