'use strict';

const COLORS = ['color-0', 'color-1', 'color-2', 'color-3', 'color-4', 'color-5'];

// ── Sample texts ──────────────────────────────────────────────────────────────
const SAMPLES = {
  'prose-small': {
    label: 'Short sentence',
    text: `GPT-4o has a 128,000-token context window. At $2.50/1M input tokens, processing a 50-page report (~25,000 tokens) costs approximately $0.063 — notice how numbers, punctuation, and currency symbols each consume extra tokens.`,
  },
  'prose-medium': {
    label: 'Technical paragraph',
    text: `Large language models process text as sequences of tokens rather than individual characters or words. The vocabulary — typically 32,000 to 200,000 entries — is built by running Byte Pair Encoding (BPE) on a large training corpus, merging the most frequent character pairs repeatedly until the desired vocabulary size is reached. Common English words like "the", "is", and "are" become single tokens, while rarer words and technical terms are split into subword pieces. This design gives the model flexibility: it can handle virtually any input text, including novel words, code identifiers, and non-Latin scripts, without ever producing an "unknown token" error.`,
  },
  'prose-large': {
    label: 'Report section',
    text: `## Executive Summary: LLM Integration in Enterprise Software

The adoption of large language models (LLMs) across enterprise software development has accelerated significantly in the past two years. Engineering teams report 20–40% reductions in boilerplate code authoring time, while product teams cite improved documentation quality and faster onboarding cycles.

However, cost and latency remain primary concerns. At scale, a platform making 10 million API calls per month — each with an average 500-token prompt and 200-token completion — generates 7 billion tokens monthly. At GPT-4o pricing ($2.50/1M input, $10.00/1M output), that equates to roughly $14,500 per month before caching or batching optimisations.

Context window utilisation is the other critical variable. Models with 128k–200k context windows enable retrieval-augmented generation (RAG) pipelines to include substantially more source material per request, reducing the number of round-trips required. Teams that moved from 4k to 128k contexts reported a 60% reduction in multi-step orchestration complexity.

Key recommendations:
- Audit prompt templates monthly; redundant instructions are a common source of token waste.
- Use structured outputs (JSON mode) to avoid verbose free-text wrapping.
- Cache repeated system prompts at the API layer where supported.
- Prefer smaller, fine-tuned models for narrow tasks over general-purpose frontier models.

The practical implication is clear: teams that invest in prompt engineering, token budgeting, and model selection frameworks will achieve significantly better unit economics than those treating LLM calls as a black box.`,
  },

  'js-small': {
    label: 'Small function',
    text: `async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  return res.json();
}`,
  },
  'js-medium': {
    label: 'Class & methods',
    text: `class TokenBudget {
  #limit;
  #used = 0;

  constructor(limit) {
    if (!Number.isInteger(limit) || limit <= 0)
      throw new RangeError('limit must be a positive integer');
    this.#limit = limit;
  }

  consume(count) {
    if (this.#used + count > this.#limit)
      throw new RangeError(
        \`Token budget exceeded: need \${count}, have \${this.remaining}\`
      );
    this.#used += count;
    return this;
  }

  get remaining() { return this.#limit - this.#used; }
  get used()      { return this.#used; }
  get pct()       { return ((this.#used / this.#limit) * 100).toFixed(1); }

  reset() { this.#used = 0; return this; }

  toString() {
    return \`TokenBudget(\${this.#used}/\${this.#limit}, \${this.pct}%)\`;
  }
}`,
  },
  'js-large': {
    label: 'Express module',
    text: `'use strict';
const express  = require('express');
const { z }    = require('zod');
const router   = express.Router();

const MessageSchema = z.object({
  role:    z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1).max(32_000),
});

const ChatSchema = z.object({
  messages:    z.array(MessageSchema).min(1).max(50),
  model:       z.string().default('gpt-4o'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens:  z.number().int().min(1).max(4096).default(1024),
});

router.post('/chat', async (req, res) => {
  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { messages, model, temperature, max_tokens } = parsed.data;

  const estTokens = messages.reduce(
    (sum, m) => sum + Math.ceil(m.content.length / 4), 0
  );
  if (estTokens > 100_000)
    return res.status(400).json({ error: 'Estimated token count exceeds limit' });

  try {
    const completion = await openai.chat.completions.create({
      model, messages, temperature, max_tokens, stream: false,
    });
    res.json({ reply: completion.choices[0].message, usage: completion.usage });
  } catch (err) {
    res.status(err.status ?? 502).json({ error: err.message });
  }
});

module.exports = router;`,
  },

  'py-small': {
    label: 'Small function',
    text: `def chunk_text(text: str, max_tokens: int = 512, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks for RAG pipelines."""
    words = text.split()
    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + max_tokens, len(words))
        chunks.append(' '.join(words[start:end]))
        if end == len(words):
            break
        start = end - overlap
    return chunks`,
  },
  'py-medium': {
    label: 'Dataclass',
    text: `from __future__ import annotations
from dataclasses import dataclass, field
from typing import Literal, Optional

Role = Literal['system', 'user', 'assistant', 'tool']

@dataclass
class Message:
    role: Role
    content: str
    name: Optional[str] = None
    token_count: Optional[int] = field(default=None, repr=False)

    def __post_init__(self) -> None:
        if not self.content.strip():
            raise ValueError('content must not be blank')

    @property
    def is_system(self) -> bool:
        return self.role == 'system'

    def to_dict(self) -> dict:
        d: dict = {'role': self.role, 'content': self.content}
        if self.name:
            d['name'] = self.name
        return d

    @classmethod
    def system(cls, content: str) -> Message:
        return cls(role='system', content=content)

    @classmethod
    def user(cls, content: str) -> Message:
        return cls(role='user', content=content)`,
  },
  'py-large': {
    label: 'Vector store',
    text: `import json
import logging
from pathlib import Path
import numpy as np
from openai import OpenAI

logger = logging.getLogger(__name__)
client = OpenAI()
EMBED_MODEL = 'text-embedding-3-small'
EMBED_DIM   = 1536


def embed_texts(texts: list[str], batch_size: int = 100) -> np.ndarray:
    all_embeddings: list[list[float]] = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        resp  = client.embeddings.create(model=EMBED_MODEL, input=batch)
        all_embeddings.extend(e.embedding for e in resp.data)
    return np.array(all_embeddings, dtype=np.float32)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    norm_a = a / (np.linalg.norm(a, axis=1, keepdims=True) + 1e-9)
    norm_b = b / (np.linalg.norm(b, axis=1, keepdims=True) + 1e-9)
    return norm_a @ norm_b.T


class VectorStore:
    def __init__(self, index_path: Path | None = None):
        self.texts: list[str]  = []
        self.embeddings        = np.empty((0, EMBED_DIM), dtype=np.float32)
        if index_path and index_path.exists():
            self.load(index_path)

    def add(self, texts: list[str]) -> None:
        new_embs        = embed_texts(texts)
        self.texts     += texts
        self.embeddings = np.vstack([self.embeddings, new_embs])
        logger.info('Added %d texts; index size: %d', len(texts), len(self.texts))

    def search(self, query: str, k: int = 5) -> list[tuple[float, str]]:
        if not self.texts:
            return []
        scores = cosine_similarity(embed_texts([query]), self.embeddings)[0]
        top_k  = np.argsort(scores)[::-1][:k]
        return [(float(scores[i]), self.texts[i]) for i in top_k]

    def save(self, path: Path) -> None:
        np.save(path.with_suffix('.npy'), self.embeddings)
        path.with_suffix('.json').write_text(json.dumps(self.texts))

    def load(self, path: Path) -> None:
        self.embeddings = np.load(path.with_suffix('.npy'))
        self.texts      = json.loads(path.with_suffix('.json').read_text())`,
  },

  'rust-small': {
    label: 'Struct + impl',
    text: `use std::collections::HashMap;

#[derive(Debug, Default)]
pub struct TokenCounter {
    counts: HashMap<u32, usize>,
    total:  usize,
}

impl TokenCounter {
    pub fn new() -> Self { Self::default() }

    pub fn record(&mut self, id: u32) {
        *self.counts.entry(id).or_insert(0) += 1;
        self.total += 1;
    }

    pub fn record_many(&mut self, ids: &[u32]) {
        ids.iter().for_each(|&id| self.record(id));
    }

    pub fn top_n(&self, n: usize) -> Vec<(u32, usize)> {
        let mut pairs: Vec<_> = self.counts
            .iter()
            .map(|(\u0026k, \u0026v)| (k, v))
            .collect();
        pairs.sort_unstable_by(|a, b| b.1.cmp(&a.1));
        pairs.truncate(n);
        pairs
    }

    pub fn unique_count(&self)    -> usize { self.counts.len() }
    pub fn repetition_rate(&self) -> f64   {
        if self.total == 0 { return 0.0; }
        1.0 - (self.counts.len() as f64 / self.total as f64)
    }
}`,
  },

  'sql-small': {
    label: 'Analytics query',
    text: `SELECT
    u.id,
    u.email,
    u.plan,
    COUNT(DISTINCT s.id)                        AS total_sessions,
    SUM(s.prompt_tokens + s.completion_tokens)  AS lifetime_tokens,
    ROUND(AVG(s.prompt_tokens), 1)              AS avg_prompt_tokens,
    ROUND(AVG(s.completion_tokens), 1)          AS avg_completion_tokens,
    MAX(s.created_at)                           AS last_active_at
FROM       users    u
LEFT JOIN  sessions s
       ON  s.user_id    = u.id
      AND  s.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
WHERE  u.status = 'active'
  AND  u.plan   IN ('pro', 'enterprise')
GROUP BY u.id, u.email, u.plan
HAVING   lifetime_tokens > 50000
ORDER BY lifetime_tokens DESC
LIMIT 50;`,
  },
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const inputText     = document.getElementById('inputText');
const charCount     = document.getElementById('charCount');
const btnTokenize   = document.getElementById('btnTokenize');
const btnCompare    = document.getElementById('btnCompare');
const btnClear      = document.getElementById('btnClear');
const spinner       = document.getElementById('spinner');
const results       = document.getElementById('results');
const compareResults= document.getElementById('compareResults');
const statsRow      = document.getElementById('statsRow');
const tokenHighlight= document.getElementById('tokenHighlight');
const approxBadge   = document.getElementById('approxBadge');
const tokenTable    = document.getElementById('tokenTable');
const tokenIdSeq    = document.getElementById('tokenIdSequence');
const compareGrid   = document.getElementById('compareGrid');
const btnCopyTable  = document.getElementById('btnCopyTable');
const btnCopyIds    = document.getElementById('btnCopyIds');
const deepStats     = document.getElementById('deepStats');

// ── Character counter & button state ──────────────────────────────────────────
inputText.addEventListener('input', () => {
  const len = inputText.value.length;
  charCount.textContent = len.toLocaleString();
  btnTokenize.disabled = len === 0;
  btnCompare.disabled  = len === 0;
});

btnClear.addEventListener('click', () => {
  inputText.value = '';
  charCount.textContent = '0';
  btnTokenize.disabled = true;
  btnCompare.disabled  = true;
  hideResults();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function selectedModel() {
  const checked = document.querySelector('input.model-radio:checked');
  return checked ? checked.value : 'gpt-4o';
}

function setLoading(on) {
  spinner.classList.toggle('d-none', !on);
  btnTokenize.disabled = on;
  btnCompare.disabled  = on;
}

function hideResults() {
  results.classList.add('d-none');
  compareResults.classList.add('d-none');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Render helpers ────────────────────────────────────────────────────────────
function renderHighlight(tokens) {
  return tokens
    .map((t, i) => {
      const cls = COLORS[i % COLORS.length];
      const idAttr = t.id !== null ? ` data-id="${t.id}"` : '';
      const title = t.id !== null
        ? `title="Token ID: ${t.id}"`
        : `title="(approximate)"`;
      return `<span class="token-span ${cls}" ${title}${idAttr}>${escapeHtml(t.text)}</span>`;
    })
    .join('');
}

function renderStatsRow(data, text) {
  const costHtml = data.cost
    ? data.cost.isFree
      ? `<span class="text-success fw-semibold">Self-hosted (free)</span>`
      : `$${data.cost.inputCost} input / $${data.cost.outputCost} output
         <br><small class="text-muted">$${data.cost.inputPer1M}/M in &middot; $${data.cost.outputPer1M}/M out</small>`
    : '—';

  // Vocab size tier badge
  const vocab = data.vocabSize;
  const vocabTier = vocab >= 150_000 ? ['Large', 'success']
                  : vocab >= 60_000  ? ['Medium', 'primary']
                  :                    ['Small', 'secondary'];
  const vocabHtml = vocab
    ? `<span class="fw-semibold font-monospace">${vocab.toLocaleString()}</span>
       <span class="badge bg-${vocabTier[1]} ms-1">${vocabTier[0]}</span>`
    : '—';

  // Sequence compression: chars → tokens
  const charCount = text.length;
  const ratio = data.count > 0 ? (charCount / data.count).toFixed(1) : '—';
  const textBytes = new TextEncoder().encode(text).length;
  const tokenBytes = data.count * 4; // uint32 per token ID
  const byteRatio = tokenBytes > 0 ? (textBytes / tokenBytes).toFixed(1) : '—';

  statsRow.innerHTML = `
    <div class="col-sm-3">
      <div class="card text-center shadow-sm h-100">
        <div class="card-body py-3">
          <div class="display-6 fw-bold text-primary">${data.count.toLocaleString()}</div>
          <div class="small text-muted">Tokens${data.approximate ? ' <span class="text-warning">~</span>' : ''}</div>
        </div>
      </div>
    </div>
    <div class="col-sm-3">
      <div class="card text-center shadow-sm h-100">
        <div class="card-body py-3">
          <div class="fw-semibold">${data.label}</div>
          <div class="small text-muted mb-1">Model</div>
          <div class="small">${vocabHtml}</div>
          <div class="small text-muted">vocab tokens</div>
        </div>
      </div>
    </div>
    <div class="col-sm-3">
      <div class="card text-center shadow-sm h-100">
        <div class="card-body py-3">
          <div class="display-6 fw-bold text-success">${ratio}<span class="fs-6 text-muted">×</span></div>
          <div class="small text-muted">${charCount.toLocaleString()} chars → ${data.count.toLocaleString()} tokens</div>
          <div class="small text-muted mt-1">${textBytes.toLocaleString()} B text vs ${tokenBytes.toLocaleString()} B tokens</div>
          <div class="small text-muted">Sequence compression</div>
        </div>
      </div>
    </div>
    <div class="col-sm-3">
      <div class="card text-center shadow-sm h-100">
        <div class="card-body py-3">
          <div class="small">${costHtml}</div>
          <div class="small text-muted mt-1">Estimated cost (as input)</div>
        </div>
      </div>
    </div>`;
}

function renderTokenTable(tokens) {
  tokenTable.innerHTML = tokens
    .map((t, i) => `
      <tr>
        <td class="text-muted">${i + 1}</td>
        <td><span class="token-span ${COLORS[i % COLORS.length]} px-1">${escapeHtml(t.text)}</span></td>
        <td class="font-monospace">${t.id !== null ? t.id : '<span class="text-muted">—</span>'}</td>
      </tr>`)
    .join('');
}

function renderTokenIdSequence(tokens) {
  const ids = tokens.map(t => t.id !== null ? t.id : '—');
  // Render as colour-coded spans matching the visual breakdown
  tokenIdSeq.innerHTML = ids
    .map((id, i) => {
      const cls = COLORS[i % COLORS.length];
      return `<span class="token-span ${cls} me-1">${id}</span>`;
    })
    .join('');
}

// ── Deep statistics panel ────────────────────────────────────────────────────
function renderDeepStats(data, text) {
  const tokens       = data.tokens || [];
  const tokenCount   = tokens.length;
  if (tokenCount === 0) { deepStats.innerHTML = ''; return; }

  const charLen      = text.length;
  const textBytes    = new TextEncoder().encode(text).length;
  const tokenIdBytes = tokenCount * 4; // uint32

  // Context window
  const cw     = data.contextWindow;
  const ctxPct = cw ? +((tokenCount / cw) * 100).toFixed(2) : null;
  const ctxColor = ctxPct === null ? 'secondary' : ctxPct >= 90 ? 'danger' : ctxPct >= 70 ? 'warning' : 'success';

  // Unique token IDs
  const uniqueCount  = new Set(tokens.filter(t => t.id !== null).map(t => t.id)).size;
  const uniquePct    = ((uniqueCount / tokenCount) * 100).toFixed(1);
  const repRate      = (100 - uniquePct).toFixed(1);

  // Token lengths
  const tLens    = tokens.map(t => [...(t.text || '')].length);
  const avgLen   = (tLens.reduce((a, b) => a + b, 0) / tokenCount).toFixed(2);
  const maxLen   = Math.max(...tLens);
  const minLen   = Math.min(...tLens);
  const longest  = tokens.find(t => [...(t.text || '')].length === maxLen);
  const shortest = tokens.find(t => [...(t.text || '')].length === minLen);

  // Words & sentences
  const words    = text.trim().split(/\s+/).filter(Boolean);
  const wordCount      = words.length;
  const wordsPerToken  = (wordCount / tokenCount).toFixed(2);
  const sentences      = text.split(/[.!?]+/).filter(s => s.trim());
  const sentenceCount  = sentences.length;
  const toksPerSentence= (tokenCount / sentenceCount).toFixed(1);

  // Attention savings (quadratic reduction vs char-level)
  const attSavings = ((charLen / tokenCount) ** 2).toFixed(1);

  // Byte ratio
  const byteRatio = (textBytes / tokenIdBytes).toFixed(2);

  // Token density
  const density = ((tokenCount / charLen) * 100).toFixed(1);

  // Longest/shortest labels (truncate for display)
  const truncate = (s, n = 12) => s.length > n ? s.slice(0, n) + '…' : s;

  const tiles = [
    {
      icon: 'bi-window-stack',  col: 'primary',
      value: ctxPct !== null ? `${ctxPct}%` : '—',
      label: 'Context window used',
      sub: cw ? `${tokenCount.toLocaleString()} / ${cw.toLocaleString()} tokens` : 'Unknown',
      extra: cw ? `<div class="progress mt-2" style="height:4px"><div class="progress-bar bg-${ctxColor}" style="width:${Math.min(ctxPct,100)}%"></div></div>` : '',
      tooltip: `How much of the model's maximum context window this text fills. Green < 70 %, yellow 70–90 %, red ≥ 90 %. Exceeding 100 % means the model will truncate your input.`,
    },
    {
      icon: 'bi-lightning-charge', col: 'success',
      value: `~${attSavings}×`,
      label: 'Attention cost savings',
      sub: `vs. character-level processing`,
      extra: `<div class="small text-muted mt-1">(chars/tokens)² = (${(charLen/tokenCount).toFixed(1)})²</div>`,
      tooltip: `Transformer attention is O(n²) in sequence length. Tokenizing compresses n characters into fewer tokens, so attention runs (chars÷tokens)² times faster than on raw characters. A 4× compression ratio = 16× cheaper attention.`,
    },
    {
      icon: 'bi-fingerprint', col: 'info',
      value: uniqueCount.toLocaleString(),
      label: 'Unique token IDs',
      sub: `${uniquePct}% unique · ${repRate}% repeated`,
      extra: '',
      tooltip: `The number of distinct token IDs in this text. High uniqueness means varied vocabulary. A high repetition rate can signal redundant content that could be trimmed to reduce token cost.`,
    },
    {
      icon: 'bi-rulers', col: 'warning',
      value: avgLen,
      label: 'Avg token length (chars)',
      sub: `Shortest: "${escapeHtml(truncate(shortest?.text||''))}" · Longest: "${escapeHtml(truncate(longest?.text||''))}"`,
      extra: `<div class="small text-muted mt-1">Min ${minLen} · Max ${maxLen} chars</div>`,
      tooltip: `Average number of Unicode characters per token. Common English words average 3–5 chars/token with BPE. Short tokens (punctuation, spaces) lower this; rare words and identifiers raise it.`,
    },
    {
      icon: 'bi-fonts', col: 'secondary',
      value: wordCount.toLocaleString(),
      label: 'Words',
      sub: `${wordsPerToken} words per token`,
      extra: '',
      tooltip: `Word count estimated by whitespace splitting. Words-per-token reflects vocabulary density: English prose ≈ 0.6–0.9, source code ≈ 0.3–0.5, CJK scripts often < 0.3 because each character becomes its own token.`,
    },
    {
      icon: 'bi-chat-text', col: 'danger',
      value: sentenceCount.toLocaleString(),
      label: 'Sentences (approx.)',
      sub: `~${toksPerSentence} tokens per sentence`,
      extra: '',
      tooltip: `Sentence count estimated by splitting on . ! ? — Tokens-per-sentence is useful for sizing prompts in summarisation or translation tasks where per-sentence budget matters.`,
    },
    {
      icon: 'bi-hdd', col: 'primary',
      value: `${textBytes.toLocaleString()} B`,
      label: 'Input size (UTF-8)',
      sub: `${tokenIdBytes.toLocaleString()} B as token IDs`,
      extra: `<div class="small text-muted mt-1">Byte ratio ${byteRatio}× (text/IDs)</div>`,
      tooltip: `Raw UTF-8 byte size of the text vs. the byte size of the token ID array (each ID is a 32-bit uint32 = 4 bytes). A byte ratio > 1 means the token sequence is smaller than the original text on the wire.`,
    },
    {
      icon: 'bi-percent', col: 'success',
      value: `${density}%`,
      label: 'Token density',
      sub: 'Tokens as % of characters',
      extra: `<div class="small text-muted mt-1">${charLen.toLocaleString()} chars → ${tokenCount.toLocaleString()} tokens</div>`,
      tooltip: `Tokens ÷ characters × 100. Lower density (20–30 %) means the tokenizer compresses many characters per token — efficient. Near 100 % means almost every character is its own token, typical of unusual scripts or adversarial inputs.`,
    },
  ];

  deepStats.innerHTML = `
    <div class="card shadow-sm mb-4">
      <div class="card-header"><i class="bi bi-graph-up-arrow me-2"></i><strong>Detailed Statistics</strong></div>
      <div class="card-body">
        <div class="row g-3">
          ${tiles.map(t => `
            <div class="col-6 col-md-4 col-lg-3">
              <div class="stat-tile h-100 p-3 rounded border"
                   data-bs-toggle="tooltip" data-bs-placement="top"
                   data-bs-custom-class="stat-tooltip"
                   title="${t.tooltip.replace(/"/g, '&quot;')}">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <i class="bi ${t.icon} text-${t.col} fs-5"></i>
                  <span class="fw-bold fs-5">${t.value}</span>
                </div>
                <div class="small fw-semibold">${t.label}</div>
                <div class="small text-muted">${t.sub}</div>
                ${t.extra}
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  // Initialise Bootstrap tooltips for freshly rendered tiles
  deepStats.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    bootstrap.Tooltip.getOrCreateInstance(el, { trigger: 'hover focus' });
  });
}

function renderCompareCard(data) {
  const badge = data.approximate
    ? `<span class="badge bg-warning text-dark ms-1">~approx</span>` : '';
  const providerColor = {
    openai: 'success', anthropic: 'warning', meta: 'primary',
    google: 'danger', mistral: 'info',
  }[data.provider] || 'secondary';

  const costLine = data.cost
    ? data.cost.isFree
      ? `<span class="text-success">Free (self-hosted)</span>`
      : `$${data.cost.inputCost} input`
    : '';

  const miniHtml = data.tokens
    ? data.tokens.slice(0, 80).map((t, i) =>
        `<span class="token-span ${COLORS[i % COLORS.length]}">${escapeHtml(t.text)}</span>`
      ).join('') + (data.tokens.length > 80 ? '…' : '')
    : `<span class="text-danger small">${data.error}</span>`;

  return `
    <div class="col-md-6 col-xl-4">
      <div class="card shadow-sm h-100 compare-card">
        <div class="card-header d-flex justify-content-between align-items-center py-2">
          <span class="fw-semibold small">${data.label}${badge}</span>
          <span class="badge bg-${providerColor}">${data.provider}</span>
        </div>
        <div class="card-body py-2">
          <div class="display-6 fw-bold text-primary mb-0">${(data.count || 0).toLocaleString()}</div>
          <div class="small text-muted mb-1">tokens · ${costLine}</div>
          <div class="small text-muted mb-2">Vocab: ${data.vocabSize ? data.vocabSize.toLocaleString() : '—'}</div>
          <div class="token-mini font-monospace">${miniHtml}</div>
        </div>
      </div>
    </div>`;
}

// ── Tokenize (single model) ───────────────────────────────────────────────────
async function runTokenize() {
  const text  = inputText.value.trim();
  const model = selectedModel();
  if (!text) return;

  hideResults();
  setLoading(true);

  try {
    const res  = await fetch('/api/tokenize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');

    renderStatsRow(data, text);
    renderDeepStats(data, text);
    tokenHighlight.innerHTML = renderHighlight(data.tokens);
    approxBadge.classList.toggle('d-none', !data.approximate);
    renderTokenIdSequence(data.tokens);
    renderTokenTable(data.tokens);
    results.classList.remove('d-none');
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
}

btnTokenize.addEventListener('click', runTokenize);

// Re-tokenize automatically when the user switches model (if results are visible)
document.querySelectorAll('input.model-radio').forEach(radio => {
  radio.addEventListener('change', () => {
    if (!results.classList.contains('d-none')) runTokenize();
  });
});

// ── Compare all models ────────────────────────────────────────────────────────
btnCompare.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) return;

  hideResults();
  setLoading(true);

  try {
    const res  = await fetch('/api/tokenize/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');

    compareGrid.innerHTML = data.map(renderCompareCard).join('');
    compareResults.classList.remove('d-none');
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
});

// ── Copy token table ──────────────────────────────────────────────────
function flashCopied(btn, original) {
  btn.innerHTML = '<i class="bi bi-check2 me-1"></i>Copied!';
  setTimeout(() => { btn.innerHTML = original; }, 2000);
}

btnCopyTable.addEventListener('click', () => {
  const rows = [...tokenTable.querySelectorAll('tr')];
  const tsv = rows.map(r => {
    const cells = [...r.querySelectorAll('td')];
    return cells.map(c => c.textContent.trim()).join('\t');
  }).join('\n');
  navigator.clipboard.writeText(tsv).then(() =>
    flashCopied(btnCopyTable, '<i class="bi bi-clipboard me-1"></i>Copy')
  );
});

// ── Copy token ID sequence ──────────────────────────────────────────
btnCopyIds.addEventListener('click', () => {
  const ids = [...tokenIdSeq.querySelectorAll('span')].map(s => s.textContent.trim());
  navigator.clipboard.writeText('[' + ids.join(', ') + ']').then(() =>
    flashCopied(btnCopyIds, '<i class="bi bi-clipboard me-1"></i>Copy')
  );
});

// ── Load sample texts ─────────────────────────────────────────────────────────
document.querySelectorAll('[data-sample]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const sample = SAMPLES[el.dataset.sample];
    if (!sample) return;
    inputText.value = sample.text;
    const len = sample.text.length;
    charCount.textContent = len.toLocaleString();
    btnTokenize.disabled = false;
    btnCompare.disabled  = false;
    inputText.focus();
    if (!results.classList.contains('d-none')) runTokenize();
  });
});
