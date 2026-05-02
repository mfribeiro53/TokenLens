# TokenLens

**TokenLens is a free, offline educational tool for anyone who wants to understand how large language models (LLMs) actually read text.**

LLMs don't process words — they process *tokens*. A token is a small chunk of text (a word, part of a word, a punctuation mark, or even a single character) that the model has learned to recognise as a unit. TokenLens lets you paste any text, see exactly how it breaks into tokens for each major model, and explore what that means for context limits, cost, and model behaviour — all without an account or API key.

> Interactive tokenizer for GPT, Claude, Llama, Gemini & Mistral. Visualise token boundaries, compare models side-by-side, and analyse context window usage, cost, and compression stats. Runs entirely offline — no API keys required.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen) ![Express](https://img.shields.io/badge/Express-5.x-blue) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Who is this for?

- **Developers** building with LLM APIs who want to understand prompt token budgets and cost
- **Students & researchers** learning how transformer models process language
- **Writers & content creators** curious why some words cost more tokens than others
- **Anyone** who has heard the word "token" and wants to see it in action

No sign-up. No API key. No data leaves your machine. Just clone, `npm install`, and open your browser.

---

## Features

- **Visual token breakdown** — every token colour-coded with a cycling 6-colour palette, exactly as the model receives it; hover any token to see its integer ID and character length
- **14 models across 5 providers** — OpenAI (GPT-4o, GPT-4o mini, GPT-3.5 Turbo, o1, o3), Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus), Meta (Llama 2, Llama 3), Google (Gemini 1.5 Pro, Gemini 2.5 Flash), Mistral (Large, Small)
- **Side-by-side comparison** — tokenize the same text across all 14 models at once in a single request
- **Rich statistics panel** — 8 metrics with hover tooltips: context window usage (%), attention cost savings (O(n²) reduction), unique token count & repetition rate, average token length, word count & words-per-token ratio, sentence count & tokens-per-sentence, UTF-8 byte size, and token density
- **Cost estimation** — real-time input *and* output cost at current per-model pricing (USD per 1M tokens)
- **Token ID sequence** — the raw integer array the model processes, with a one-click copy button
- **Sortable token table** — every token listed with its ID and text, copyable as TSV
- **Sample inputs** — built-in samples across prose, JavaScript, Python, Rust, and SQL
- **Auto-retokenize on model switch** — results update instantly when you change model
- **Educational guide** — a nine-section `/learn` page covering BPE, vocabulary differences, context windows, cost, and practical prompt-engineering tips
- **100% offline** — no API keys, no external calls; all tokenization runs on the local server

---

## Models & Tokenizers

| Provider | Models | Tokenizer | Exact? |
|---|---|---|---|
| OpenAI | GPT-4o, GPT-4o mini, o1, o3 | `tiktoken` `o200k_base` | ✓ Exact |
| OpenAI | GPT-3.5 Turbo | `tiktoken` `cl100k_base` | ✓ Exact |
| Anthropic | Claude 3.5 Sonnet, Haiku, Opus | `@anthropic-ai/tokenizer` | ✓ Exact |
| Meta | Llama 2 | `llama-tokenizer-js` SentencePiece | ✓ Exact |
| Meta | Llama 3 | `llama-tokenizer-js` (Llama 2 vocab stand-in) | ~ Approximate |
| Google | Gemini 1.5 Pro, 2.5 Flash | Character-ratio (~4 chars/token) | ~ Approximate |
| Mistral | Large, Small | `llama-tokenizer-js` (shared SentencePiece vocab) | ~ Approximate |

Results marked approximate will be noted in the UI. No offline tokenizer is publicly available for Llama 3, Gemini, or Mistral at this time.

---

## Requirements

- **Node.js** v18 or higher
- **npm** v9 or higher

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/mfribeiro53/TokenLens.git
cd TokenLens

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Then open **http://localhost:3000** in your browser.

### Development mode (auto-restart on file changes)

```bash
npm run dev
```

---

## Project Structure

```
TokenLens/
├── app.js                  # Express entry point, middleware (compression, rate-limit)
├── config/
│   └── pricing.js          # Model metadata: vocab sizes, context windows & USD pricing
├── routes/
│   └── index.js            # GET /, GET /learn, POST /api/tokenize, POST /api/tokenize/compare
├── services/
│   └── tokenizer.js        # Tokenizer dispatch — tiktoken / Anthropic / llama / gemini approx
├── views/
│   ├── index.ejs           # Main tokenizer UI
│   └── learn.ejs           # Nine-section educational guide
└── public/
    ├── css/styles.css      # Token visualization & layout styles
    └── js/main.js          # Client-side rendering, API calls, copy utilities
```

---

## API

All endpoints accept and return JSON. Text input is limited to **50,000 characters**.

### `POST /api/tokenize`

Tokenize text with a single model.

**Request body**
```json
{ "text": "Hello world", "model": "gpt-4o" }
```

**Response**
```json
{
  "model": "gpt-4o",
  "label": "GPT-4o",
  "provider": "openai",
  "count": 2,
  "approximate": false,
  "vocabSize": 200019,
  "contextWindow": 128000,
  "tokens": [
    { "id": 9906, "text": "Hello" },
    { "id": 1917, "text": " world" }
  ],
  "cost": {
    "inputCost": "0.000005",
    "outputCost": "0.000020",
    "inputPer1M": 2.5,
    "outputPer1M": 10.0,
    "isFree": false
  }
}
```

### `POST /api/tokenize/compare`

Tokenize text with all 14 models in a single call.

**Request body**
```json
{ "text": "Hello world" }
```

Returns an array of the response shape above, one entry per model.

---

## Rate Limiting

API routes are limited to **100 requests per 60 seconds** per IP address.

---

## Statistics Reference

The results panel surfaces the following metrics after tokenization:

| Metric | Description |
|---|---|
| **Token count** | Total number of tokens the model receives |
| **Context window used** | Tokens ÷ model's max context window, as a percentage |
| **Compression ratio** | Characters ÷ tokens — how many characters each token represents on average |
| **Attention cost savings** | Reduction in O(n²) attention operations vs. processing one character at a time |
| **Unique token IDs** | Count of distinct token integers; paired with a repetition rate |
| **Average token length** | Mean number of characters per token |
| **Words / Words-per-token** | Standard word count and the words-to-tokens ratio |
| **Sentence count** | Number of sentences detected, with tokens-per-sentence |
| **Input size** | UTF-8 byte length of the input string |
| **Token density** | Unique tokens ÷ total tokens — a measure of lexical variety |
| **Estimated cost** | Input cost (and equivalent output cost) in USD at current pricing |

---

## Learn Page (`/learn`)

The `/learn` page is a standalone educational guide covering:

1. **The Core Idea** — what tokens are and why LLMs use them instead of characters or words
2. **Why Not Just Use Words?** — the case for sub-word tokenization
3. **How BPE Works** — a plain-English walkthrough of the Byte Pair Encoding algorithm
4. **Why Vocabularies Differ** — how training data shapes each model's vocabulary
5. **Tokens and the Context Window** — what the context limit actually means in practice
6. **Why Token Count Affects Cost** — input vs. output pricing and how to budget for it
7. **Different Models, Different Tokenizers** — an overview of the tiktoken / BPE / SentencePiece families
8. **Practical Tips** — prompt engineering, code formatting, and non-English text considerations
9. **Understanding the Statistics Dashboard** — a detailed explanation of every metric in the results panel

---

## License

MIT
