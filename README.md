# TokenLens

**TokenLens is a free, offline educational tool for anyone who wants to understand how large language models (LLMs) actually read text.**

LLMs don't process words — they process *tokens*. A token is a small chunk of text (a word, part of a word, a punctuation mark, or even a single character) that the model has learned to recognise as a unit. TokenLens lets you paste any text, see exactly how it breaks into tokens for each major model, and explore what that means for context limits, cost, and model behaviour — all without an account or API key.

> Interactive tokenizer for GPT, Claude, Llama, Gemini & Mistral. Visualise token boundaries, compare models side-by-side, and analyse context window usage, cost, and compression stats. Runs entirely offline — no API keys required.

![Node.js](https://img.shields.io/badge/Node.js-22%2B-brightgreen) ![Express](https://img.shields.io/badge/Express-5.x-blue) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Who is this for?

- **Developers** building with LLM APIs who want to understand prompt token budgets and cost
- **Students & researchers** learning how transformer models process language
- **Writers & content creators** curious why some words cost more tokens than others
- **Anyone** who has heard the word "token" and wants to see it in action

No sign-up. No API key. No data leaves your machine. Just clone, `npm install`, and open your browser.

---

## Features

- **Visual token breakdown** — every token highlighted with a unique colour, exactly as the model receives it
- **14 models across 5 providers** — OpenAI (GPT-4o, GPT-4o mini, GPT-3.5 Turbo, o1, o3), Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus), Meta (Llama 2, Llama 3), Google (Gemini 1.5 Pro, Gemini 2.5 Flash), Mistral (Large, Small)
- **Side-by-side comparison** — tokenize the same text across all models at once
- **Detailed statistics panel** — context window usage, attention cost savings, unique token IDs, average token length, word/sentence counts, byte sizes, and token density (with hover tooltips)
- **Cost estimation** — input and output cost at current per-model pricing
- **Token ID sequence** — the raw integer array the model processes, with a one-click copy button
- **Sample inputs** — 11 built-in samples across prose, JavaScript, Python, Rust, and SQL
- **Auto-retokenize on model switch** — results update instantly when you change model
- **100% offline** — no API keys, no external calls; tokenization runs entirely on the server

---

## Models & Tokenizers

| Provider | Models | Tokenizer |
|---|---|---|
| OpenAI | GPT-4o, GPT-4o mini, o1, o3 | `tiktoken` o200k_base |
| OpenAI | GPT-3.5 Turbo | `tiktoken` cl100k_base |
| Anthropic | Claude 3.5 Sonnet, Haiku, Opus | `@anthropic-ai/tokenizer` |
| Meta | Llama 3 | `tiktoken` cl100k_base |
| Meta | Llama 2 | `llama-tokenizer-js` |
| Google | Gemini 1.5 Pro, 2.5 Flash | Character-ratio approximation (~4 chars/token) |
| Mistral | Large, Small | Character-ratio approximation |

---

## Requirements

- **Node.js** v18 or higher (tested on v22)
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
├── app.js                  # Express entry point
├── config/
│   └── pricing.js          # Model metadata, vocab sizes, context windows & pricing
├── routes/
│   └── index.js            # GET /, GET /learn, POST /api/tokenize, POST /api/tokenize/compare
├── services/
│   └── tokenizer.js        # Tokenizer dispatch for all models
├── views/
│   ├── index.ejs           # Main UI
│   └── learn.ejs           # Documentation / how-it-works page
└── public/
    ├── css/styles.css
    └── js/main.js          # Client-side rendering & API calls
```

---

## API

### `POST /api/tokenize`

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
    "outputPer1M": 10,
    "isFree": false
  }
}
```

### `POST /api/tokenize/compare`

```json
{ "text": "Hello world" }
```

Returns an array of the above response shape for all 14 models.

---

## Rate Limiting

API routes are limited to **100 requests per minute** per IP.

---

## License

MIT
