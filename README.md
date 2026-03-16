# AURILIX.io — Symbolic Language Engine

> A living symbolic language that encodes natural speech into geometric grammar, learns from every sentence, and decodes back to fluent English.

---

## What is this?

AURILIX is a two-way symbolic language interpreter. It converts English sentences into a compact symbolic notation using grammar symbols and vocabulary IDs, then reconstructs those symbols back into natural speech — with memory, pattern learning, and semantic understanding that improves over time.

```
"I want a pen"   →   ◯@1 ╱@347 ◯@170   →   "I want a pen."
```

The system has two layers:

- **Grammar symbols** — describe the grammatical role of each word (`◯` = entity, `╱` = action, `▬` = resource...)
- **Vocabulary IDs** — `@170` points to the word "pen" stored in the vocabulary

---

## Grammar symbols

| Symbol | Name | Role |
|--------|------|------|
| `◯` | ENTITY | Noun — person, object, place, concept |
| `╱` | ACTION | Verb — process, activity |
| `→` | CAUSE | Causation — leads to, results in |
| `✶` | IMPORTANT | Adjective — critical, significant quality |
| `△` | SYSTEM | System — mechanism, structure |
| `▬` | RESOURCE | Material — data, media, medium |
| `⊂` | CATEGORY | Possession — belongs to, type of |
| `≡` | DEFINITION | Equals — is defined as |
| `↑` | PRIORITY | Urgency — high importance |
| `#` | QUANTITY | Count — number, amount |

---

## Encoding examples

| Input | Symbolic | Pattern |
|-------|----------|---------|
| "I want a pen" | `◯@1 ╱@347 ◯@170` | Entity → Action → Entity |
| "This is my pen" | `◯@170 ⊂@1` | Possession |
| "Surgery leads to recovery" | `◯@345 →@347` | Causation |
| "AI is a language model" | `◯@21 ≡@300` | Definition |
| "The patient undergoes surgery" | `◯@346 ╱@120 ▬@345` | Action on Resource |

---

## Project structure

```
Aurilix.io/
├── src/
│   ├── app/
│   │   ├── audio-to-symbol/
│   │   │   └── page.tsx          # Mode 01 — encode speech/text to symbols
│   │   ├── symbol-to-audio/
│   │   │   └── page.tsx          # Mode 02 — decode symbols to speech
│   │   └── api/
│   │       ├── symbolize/
│   │       │   └── route.ts      # POST /api/symbolize — encode
│   │       ├── speak/
│   │       │   └── route.ts      # POST /api/speak — decode
│   │       ├── transcribe/
│   │       │   └── route.ts      # POST /api/transcribe — audio → text
│   │       └── vocabulary/
│   │           └── route.ts      # GET/POST/DELETE /api/vocabulary
│   └── lib/
│       ├── vocabulary.ts          # Word ↔ ID store with pos + symbol
│       ├── abbreviations.ts       # Abbreviation expansion (LLM → large language model)
│       ├── symbols.ts             # Grammar symbol definitions + metadata
│       ├── patterns.ts            # Pattern learning + compression rules
│       ├── graph-decoder.ts       # Deterministic geometric graph reconstruction
│       ├── semantic-memory.ts     # Viterbi path + LLM edge weight learning
│       └── graph-probe.ts         # Targeted LLM probability probing
├── data/
│   ├── vocabulary.json            # Persistent word store (auto-managed)
│   ├── patterns.json              # Learned sentence patterns (auto-created)
│   └── semantic-memory.json       # Edge weights + probe cache (auto-created)
├── scripts/
│   ├── enrich-vocabulary.ts       # Add symbol field to existing vocab entries
│   ├── seed-vocabulary.ts         # Pre-seed common English + domain words
│   └── assign-ids.ts              # Manually assign specific words to specific IDs
└── types/
    └── index.ts                   # TypeScript interfaces
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Gemini API key

```bash
# .env.local
GEMINI_API_KEY=your_key_here
```

### 3. Enrich your vocabulary

If your `vocabulary.json` was created before the symbol field was added, run this once:

```bash
npx tsx scripts/enrich-vocabulary.ts
```

This adds the `symbol` field to every entry based on its `pos`:

```
noun → ◯   verb → ╱   adjective → ✶   adverb → ↑   other → △
```

### 4. (Optional) Seed common words

```bash
npx tsx scripts/seed-vocabulary.ts
```

Registers ~400 common English + tech/AI/blockchain words so the system starts with a rich base vocabulary.

### 5. (Optional) Assign specific IDs to specific words

Edit `scripts/assign-ids.ts` and add your mappings:

```ts
[2,   'pen',     'noun'],
[344, 'teacup',  'noun'],
[100, 'write',   'verb'],
```

Then run:

```bash
npx tsx scripts/assign-ids.ts
```

After this, `◯@2` will always mean "pen" and `◯@344` will always mean "teacup".

### 6. Start the app

```bash
npm run dev
```

---

## How encoding works

```
Input text
    ↓
lib/abbreviations.ts     — expand "LLM" → "large language model"
    ↓
Gemini (tokeniser)       — identify words + POS + grammar symbol
    ↓
lib/vocabulary.ts        — look up or register each word, get @ID
    ↓
lib/patterns.ts          — learn pattern, update compression rules
    ↓
Output: ◯@1 ╱@347 ◯@170  (full)
        @1 @347 @170      (compressed, after enough observations)
```

---

## How decoding works

```
Input: ◯@1 ╱@347 ◯@170
    ↓
lib/patterns.ts          — expand compressed tokens (@1 → ◯@1)
    ↓
lib/vocabulary.ts        — resolve @IDs → words (pen, want, i)
    ↓
lib/graph-decoder.ts     — deterministic graph reconstruction
    ↓
lib/semantic-memory.ts   — Viterbi path (max-probability sequence)
    ↓
confidence >= 0.80?
  YES → return directly   "I want a pen."      (no LLM call)
  NO  → Gemini refines    (grammar polish)
    ↓
lib/patterns.ts          — record decode confidence, learn edge weights
lib/semantic-memory.ts   — update edge weights for future decoding
```

---

## The learning system

The system learns from every sentence encoded or decoded.

### What gets stored in `data/patterns.json`

- **Sequences** — which symbol patterns appear most often (`◯ ╱ ▬` seen 23×)
- **Word roles** — which symbol each word uses and how consistently (`pen` is always `◯`)
- **Bigrams** — which words appear together and what's implied between them (`pen + paper → write`)
- **Fingerprints** — hash of symbol sequence → confidence score (enables full compression)
- **Compression rules** — when a word's symbol can be safely omitted

### What gets stored in `data/semantic-memory.json`

- **Edge weights** — how likely two words are connected (`pen → write`: 0.87)
- **Probe cache** — cached LLM probability questions (never re-asked for the same pair)

### Compression over time

```
Session 1  (pen is new):     ◯@170 ╱@100 ▬@3
Session 5  (pen seen 5×):    @170 ╱@100 @3      ← ◯ omitted for pen
Session 10 (all known):      @170 @100 @3        ← all symbols omitted
```

---

## API reference

### `POST /api/symbolize`

Encode natural language text into symbolic form.

**Request:**
```json
{ "text": "I want a pen", "sessionId": "optional-session-id" }
```

**Response:**
```json
{
  "symbolic":     "◯@1 ╱@347 ◯@170",
  "symbolicFull": "◯@1 ╱@347 ◯@170",
  "tokens": [
    { "word": "i",    "pos": "noun", "symbol": "◯", "id": 1,   "ref": "@1",   "isNew": false },
    { "word": "want", "pos": "verb", "symbol": "╱", "id": 347, "ref": "@347", "isNew": false },
    { "word": "pen",  "pos": "noun", "symbol": "◯", "id": 170, "ref": "@170", "isNew": false }
  ],
  "pattern":      "◯ ╱ ◯",
  "explanation":  "subject performs action on object",
  "newWords":     [],
  "expandedText": "I want a pen"
}
```

---

### `POST /api/speak`

Decode symbolic sentence back to natural language.

**Request:**
```json
{ "symbolic": "◯@1 ╱@347 ◯@170", "sessionId": "optional-session-id" }
```

**Response:**
```json
{
  "text":        "I want a pen.",
  "confidence":  0.91,
  "usedGemini":  false,
  "pattern":     "◯ ╱ ◯",
  "patternName": "Action on Entity",
  "viterbiPath": [
    { "word": "i",    "prob": 0.95 },
    { "word": "want", "prob": 0.91 },
    { "word": "pen",  "prob": 0.87 }
  ]
}
```

---

### `POST /api/transcribe`

Transcribe audio to text (used by Mode 01).

**Request:**
```json
{ "audioBase64": "...", "mimeType": "audio/webm" }
```

**Response:**
```json
{ "text": "I want a pen" }
```

---

### `GET /api/vocabulary`

Inspect the full vocabulary.

**Response:**
```json
{
  "totalWords": 1624,
  "nextId": 1625,
  "vocabulary": { "pen": 170, "want": 347 },
  "entries": {
    "170": { "id": 170, "word": "pen", "pos": "noun", "symbol": "◯" }
  }
}
```

### `POST /api/vocabulary`

Register a word manually.

```json
{ "word": "telescope", "pos": "noun" }
{ "word": "pen", "pos": "noun", "id": 2 }
{ "word": "pen", "pos": "noun", "id": 2, "force": true }
```

### `DELETE /api/vocabulary`

Wipe and reset the vocabulary. **Development only.**

---

## Important notes

**Symbols without `@ID` references cannot be decoded.**

`◯ ╱ ◯` means "an entity does something to another entity" — that's all the system knows.
`◯@170 ╱@347 ◯@1` means "a pen wants me" or "I want a pen" — actual words are attached.

Always use the output from **Mode 01** (audio-to-symbol) as input to **Mode 02** (symbol-to-audio). The symbolic string with `@ID` references carries the full meaning.

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key (required) |

---

## Tech stack

- **Next.js 14** — App Router, API routes
- **TypeScript** — Full type safety
- **Google Gemini 2.5 Flash** — Tokenisation, encoding, decoding refinement
- **Node.js `fs`** — Persistent vocabulary + pattern storage
- **Web Speech API** — Text-to-speech playback in browser

---

## Roadmap ideas

- Grammar rules file (100% confidence for known patterns, no learning needed)
- Cross-session vocabulary sharing
- Export symbolic sentences as QR codes
- Visual graph renderer in the UI
- Custom symbol sets per domain (medical, legal, code)