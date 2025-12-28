# BibleBench 📖

An industry-standard LLM benchmark for Christian scripture accuracy and theological understanding

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Evalite](https://img.shields.io/badge/built%20with-evalite-blue.svg)](https://evalite.dev)
[![AI SDK v5](https://img.shields.io/badge/powered%20by-AI%20SDK%20v5-blue.svg)](https://sdk.vercel.ai)

BibleBench is a comprehensive evaluation suite designed to assess Large Language Models (LLMs) on their knowledge of Christian scripture, theological accuracy, and ability to apply biblical principles with wisdom and nuance. Built with [Evalite](https://evalite.dev) and the [AI SDK v5](https://sdk.vercel.ai), it provides rigorous, reproducible testing across multiple dimensions of biblical and theological competence.

## 🎯 Purpose

As LLMs become increasingly used for religious education, pastoral care, and theological discussion, there is a critical need for standardized benchmarks that evaluate their:

1. **Scripture Knowledge**: Accurate recall of verses, references, and biblical context
2. **Theological Accuracy**: Understanding of core Christian doctrines and orthodoxy
3. **Heresy Detection**: Ability to identify and reject heterodox teachings
4. **Denominational Fairness**: Representing diverse Christian traditions without bias
5. **Pastoral Wisdom**: Applying theology to real-world situations with grace and truth

BibleBench fills this gap by providing a rigorous, multi-dimensional benchmark grounded in historic Christian orthodoxy while respecting legitimate theological diversity.

## 🏗️ Architecture

### Technology Stack

- **Evalite (beta)**: Modern TypeScript testing framework for AI applications
- **AI SDK v5**: Unified interface for multiple LLM providers
- **Vitest**: Fast unit testing framework (underlying Evalite)
- **TypeScript**: Type-safe evaluation development
- **Autoevals**: Pre-built evaluation scorers

### Project Structure

```text
biblebench/
├── evals/
│   ├── scripture/              # Scripture accuracy evaluations
│   │   ├── verse-recall.eval.ts
│   │   ├── reference-knowledge.eval.ts
│   │   ├── context-understanding.eval.ts
│   │   └── translation-recall.eval.ts    # NEW: Bible translation testing
│   ├── theology/               # Theological concept evaluations
│   │   ├── core-doctrines.eval.ts
│   │   ├── heresy-detection.eval.ts
│   │   ├── denominational-nuance.eval.ts
│   │   └── pastoral-application.eval.ts
│   └── lib/                    # Shared utilities
│       ├── models.ts           # AI model configurations
│       ├── scorers.ts          # Custom scoring functions
│       └── README.md
├── evalite.config.ts          # Evalite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 📊 Evaluation Categories

### 1. Scripture Accuracy

Tests LLMs' foundational knowledge of the Bible itself.

**Verse Recall** (`scripture/verse-recall.eval.ts`)

- Ability to complete famous Bible verses
- Accuracy of verse recitation
- Measured with Levenshtein similarity, exact match, and word overlap

**Reference Knowledge** (`scripture/reference-knowledge.eval.ts`)

- Correctly identifying where verses are found
- Understanding of Bible book/chapter/verse structure
- Validated against standard reference formats

**Context Understanding** (`scripture/context-understanding.eval.ts`)

- Authorship and historical background
- Purpose and audience of biblical books
- Understanding of scriptural context
- Uses LLM-as-judge for nuanced evaluation

**Translation Recall** (`scripture/translation-recall.eval.ts`)

- Accurate recall of verses in specific Bible translations (KJV, NIV, ESV, NASB, NLT, CSB, etc.)
- Understanding of translation-specific vocabulary and phrasing
- Distinguishing between translation variations (e.g., "begotten" in KJV vs "one and only" in NIV)
- Ability to identify which translation a verse comes from based on distinctive wording
- Tests 25+ verses across 8+ major English translations
- Measured with translation-specific phrase matching, vocabulary fidelity, and Levenshtein similarity

### 2. Theological Understanding

Tests comprehension of Christian doctrine and theology.

**Core Doctrines** (`theology/core-doctrines.eval.ts`)

- Trinity, Incarnation, Justification, Atonement
- Original sin, Image of God, Gospel
- Resurrection and eschatology
- Evaluated with theological accuracy judge and completeness scoring

**Heresy Detection** (`theology/heresy-detection.eval.ts`)

- Identifying historical heresies (Arianism, Modalism, Pelagianism, Docetism, Gnosticism)
- Distinguishing orthodoxy from heterodoxy
- Understanding why certain teachings are problematic
- Tests both identification and explanation

**Denominational Nuance** (`theology/denominational-nuance.eval.ts`)

- Fair representation of Catholic, Protestant, Orthodox perspectives
- Understanding of legitimate theological diversity
- Avoiding denominational bias
- Measured with custom bias detection and balance scoring

**Pastoral Application** (`theology/pastoral-application.eval.ts`)

- Applying theology to real-world situations
- Balancing truth with grace
- Pastoral sensitivity and wisdom
- Biblical grounding in practical advice
- Most complex evaluation using multi-dimensional LLM-as-judge

## 🧪 Scoring Methodology

BibleBench employs multiple scoring approaches:

### Rule-Based Scorers

- **Exact Match**: Binary match of expected output
- **Contains**: Substring matching
- **Levenshtein Distance**: Edit distance similarity
- **Reference Format Validation**: Regex-based format checking

### Heuristic Scorers

- **Word Overlap**: Percentage of expected words present
- **Key Points Coverage**: Presence of critical theological terms
- **Multiple Perspectives**: Counting denominational views represented

### Translation-Aware Scorers

- **Translation Phrase Match**: Checks for translation-specific key phrases (e.g., "begotten" in KJV)
- **Translation Vocabulary Fidelity**: Validates use of appropriate vocabulary for each translation
- **Translation Accuracy**: Comprehensive scoring combining word overlap and key phrase matching

### LLM-as-Judge Scorers

- **Theological Accuracy Judge**: Evaluates doctrinal soundness, biblical grounding, and nuance
- **Heresy Detection Judge**: Identifies heterodox teaching with severity ratings
- **Denominational Bias Detector**: Measures ecumenical balance
- **Pastoral Wisdom Judge**: Multi-dimensional evaluation of pastoral responses
- **Translation Identification Judge**: Evaluates ability to correctly identify Bible translations based on distinctive vocabulary

All LLM-as-judge scorers use structured output (via AI SDK's `generateObject`) with detailed rationales, providing transparency and debuggability.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- API keys for LLM providers you want to test

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/biblebench.git
cd biblebench

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

BibleBench uses **OpenRouter** exclusively for accessing all LLM models. This means you only need **one API key** to access hundreds of models from multiple providers.

Create a `.env` file with your OpenRouter API key:

```env
# OpenRouter API Key (REQUIRED)
# Get your key at: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_key
```

**Benefits of using OpenRouter:**

- ✅ **One API key** for all models (GPT, Claude, Llama, Grok, Gemini, etc.)
- ✅ **Pay-as-you-go pricing** with transparent per-token costs
- ✅ **Automatic failover** for reliability
- ✅ **Immediate access** to newly released models
- ✅ **Unified billing** across all providers

See available models at [OpenRouter Models](https://openrouter.ai/docs#models)

### Running Evaluations

```bash
# Run in development mode with UI
pnpm eval:dev

# Run all evaluations
pnpm eval

# View results in UI
pnpm eval:ui
```

The Evalite UI will be available at `http://localhost:3006`, providing:

- Real-time evaluation progress
- Detailed score breakdowns
- Trace inspection
- Metadata exploration

### Running Specific Evaluations

```bash
# Run only scripture evaluations
pnpm eval evals/scripture/

# Run specific test file
pnpm eval evals/theology/core-doctrines.eval.ts
```

## 🤖 Configured Models

BibleBench is currently configured to test **17 cutting-edge models** across 10 different providers, all accessed through OpenRouter:

### OpenAI Models (5)

- **GPT-5 Mini** - Default judge model (efficient and cost-effective)
- **GPT-5.1** - Advanced reasoning model
- **GPT-5 Nano** - Efficient compact model
- **GPT-OSS-120B** - Open-source 120B parameter model
- **GPT-OSS-20B** - Open-source 20B parameter model

### Anthropic Models (1)

- **Claude Haiku 4.5** - Fast, efficient Claude variant

### X.AI Models (2)

- **Grok 4.1 Fast** - Speed-optimized Grok
- **Grok 4** - Full Grok model

### Google Models (2)

- **Gemini 3 Flash Preview** - Fast preview model
- **Gemini 3 Pro Preview** - Advanced preview model

### Other Advanced Models (7)

- **Mistral Large 2512** (Mistral AI)
- **DeepSeek V3.2** (DeepSeek)
- **Intellect-3** (Prime Intellect)
- **OLMo 3.1 32B Think** (AllenAI)
- **Nemotron 3 Nano 30B** (NVIDIA)
- **GLM-4.7** (Zhipu AI)
- **MiniMax M2.1** (MiniMax)

All models are accessed through a **single OpenRouter API key**, making it easy to test across diverse architectures, training approaches, and capabilities.

## 🔧 Customization

### Running with Model Subsets

You can easily run evaluations on specific models or categories by modifying `evals/lib/models.ts`:

#### Option 1: Test Specific Models

Edit the `benchmarkModels` array to include only the models you want:

```typescript
// In evals/lib/models.ts
export const benchmarkModels = [
  // Test only these specific models
  { name: "GPT-5.2", model: gpt52 },
  { name: "Claude Haiku 4.5", model: claudeHaiku45 },
  { name: "Grok 4", model: grok4 },
] as const;
```

#### Option 2: Test by Provider Category

Use the pre-organized model categories:

```typescript
// Test only OpenAI models
export const benchmarkModels = openaiModels.map((model, i) => ({
  name: `OpenAI Model ${i + 1}`,
  model
})) as const;

// Test only Google models
export const benchmarkModels = [
  { name: "Gemini 3 Flash", model: gemini3FlashPreview },
  { name: "Gemini 3 Pro", model: gemini3ProPreview },
] as const;

// Mix providers
export const benchmarkModels = [
  ...openaiModels.map(m => ({ name: "OpenAI", model: m })),
  ...anthropicModels.map(m => ({ name: "Anthropic", model: m })),
] as const;
```

#### Option 3: Temporarily Comment Out Models

For quick testing, comment out models you don't want to test:

```typescript
export const benchmarkModels = [
  { name: "GPT-5.2", model: gpt52 },
  // { name: "GPT-5.1", model: gpt51 },  // Commented out
  // { name: "GPT-5 Nano", model: gpt5Nano },  // Commented out
  { name: "Claude Haiku 4.5", model: claudeHaiku45 },
  // ... etc
] as const;
```

**Note:** After modifying `models.ts`, TypeScript will recompile automatically in dev mode, or you can manually run:

```bash
pnpm tsc --noEmit  # Check for errors
pnpm eval          # Run evaluations with new configuration
```

### Adding New Models

All models are accessed through OpenRouter. Simply add any model from the [OpenRouter catalog](https://openrouter.ai/docs#models):

```typescript
// In evals/lib/models.ts
import { wrapAISDKModel } from "evalite/ai-sdk";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Add any model from OpenRouter's catalog
export const newModel = wrapAISDKModel(
  openrouter.chat("provider/model-name")
);

// Add to benchmarkModels array
export const benchmarkModels = [
  // ... existing models
  { name: "New Model", model: newModel },
];
```

**Examples:**

- `openrouter.chat("openai/gpt-4o")` - GPT-4o
- `openrouter.chat("anthropic/claude-3.5-sonnet")` - Claude Sonnet
- `openrouter.chat("meta-llama/llama-3.1-405b-instruct")` - Llama 3.1
- `openrouter.chat("x-ai/grok-beta")` - Grok
- `openrouter.chat("google/gemini-pro-1.5")` - Gemini Pro

### Creating Custom Scorers

Add to `evals/lib/scorers.ts`:

```typescript
export const myCustomScorer = createScorer<string, string, string>({
  name: "My Custom Scorer",
  description: "Description of what it scores",
  scorer: ({ input, output, expected }) => {
    // Your scoring logic
    const score = /* calculate 0-1 score */;

    return {
      score,
      metadata: {
        // Additional debugging info
      }
    };
  }
});
```

### Adding New Evaluations

Create a new `.eval.ts` file in the appropriate directory:

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { benchmarkModels } from "../lib/models.js";
import { myScorer } from "../lib/scorers.js";

const myData = [
  { input: "question", expected: "answer" },
  // ... more test cases
];

for (const { name, model } of benchmarkModels) {
  evalite(`My Evaluation - ${name}`, {
    data: myData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `Your prompt here: ${input}`,
      });
      return result.text;
    },
    scorers: [myScorer],
  });
}
```

## 📈 Benchmark Results

Results include:

- **Overall scores** per model per evaluation category
- **Detailed metrics** for each scorer
- **Metadata** including rationales from LLM-as-judge scorers
- **Traces** of model inputs and outputs
- **Comparison views** across models

Results are stored in `node_modules/.evalite` and can be exported as static HTML for CI/CD integration.

## 🎓 Use Cases

### For LLM Developers

- Benchmark your models against established theological standards
- Identify weaknesses in scripture knowledge or theological reasoning
- Track improvements across model versions

### For Religious Organizations

- Evaluate LLMs before deploying them in educational or pastoral contexts
- Ensure models align with your theological positions
- Test for heresy detection and denominational fairness

### For Researchers

- Study how different LLM architectures handle theological reasoning
- Compare performance on factual recall vs. nuanced application
- Analyze bias in religious content generation

### For Application Developers

- Select the best LLM for your Christian education app
- Validate that your fine-tuned model maintains theological accuracy
- Monitor for theological drift in deployed systems

## 🤝 Contributing

We welcome contributions! Areas for expansion:

1. **More Test Cases**: Additional verses, doctrines, scenarios
2. **Additional Categories**: Church history, apologetics, biblical languages
3. **More Scorers**: Novel evaluation approaches
4. **Other Faiths**: Adaptations for Judaism, Islam, etc.
5. **Denominational Extensions**: Specific evaluations for particular traditions

Please open an issue or pull request on GitHub.

## 📚 Theological Methodology

### Doctrinal Framework

BibleBench is grounded in **historic Christian orthodoxy** as expressed in:

- The Apostles' Creed
- The Nicene Creed
- The Chalcedonian Definition
- Core Reformation principles (sola fide, sola gratia, sola scriptura)

### Handling Denominational Diversity

We recognize legitimate theological diversity among Christians while maintaining commitment to core orthodoxy:

- **Non-negotiable**: Trinity, deity of Christ, salvation by grace, biblical authority, resurrection
- **Denominational differences**: Baptism, church governance, eschatology, spiritual gifts
- Evaluations test for *fair representation* of different views, not adherence to one

### Heresy Definitions

Historical heresies are defined according to ecumenical church councils and historic Christian consensus:

- Arianism, Modalism, Nestorianism, Docetism, Pelagianism, Gnosticism, etc.
- Scorers detect these patterns while allowing for legitimate theological diversity

## 🔒 Ethical Considerations

### Limitations

- **Not a replacement for human judgment**: Especially in pastoral care
- **Western/Protestant bias possible**: We strive for ecumenism but acknowledge potential blind spots
- **English-only**: Currently focused on English Bible translations
- **Cultural context**: Designed primarily for Western Christian contexts

### Responsible Use

- Don't use benchmark scores to make definitive claims about model "theological soundness"
- Recognize that high scores don't qualify an LLM to replace pastors or theologians
- Be aware of potential biases in training data and evaluation design
- Use results to inform, not replace, human theological oversight

## 📖 Scripture Translations

BibleBench includes comprehensive testing of multiple Bible translations:

### Translation Coverage

The benchmark explicitly tests models on these major English translations:

- **KJV** (King James Version, 1611) - Traditional language with "thee/thou/thy"
- **NKJV** (New King James Version, 1982) - Modernized KJV
- **NIV** (New International Version, 1978/2011) - Widely-used modern translation
- **ESV** (English Standard Version, 2001) - Literal, modern English
- **NASB** (New American Standard Bible, 1971/1995) - Very literal translation
- **NLT** (New Living Translation, 1996/2015) - Thought-for-thought translation
- **CSB** (Christian Standard Bible, 2017) - Balance of accuracy and readability

### Evaluation Approach

- **General Recall** (`verse-recall.eval.ts`): Accepts any standard translation
- **Translation-Specific** (`translation-recall.eval.ts`): Tests precise recall of translation-specific wording
- **Translation Identification**: Tests ability to identify translations based on distinctive vocabulary

This approach ensures models are evaluated both on general scripture knowledge and on their ability to distinguish between translation variations.

## 📄 License

MIT License - see LICENSE file for details.

This benchmark is provided for educational and evaluative purposes. It represents an attempt to create rigorous standards for LLM theological knowledge, but does not claim to be the definitive measure of an LLM's theological accuracy.

## 🙏 Acknowledgments

- Built with [Evalite](https://evalite.dev) by the Evalite team
- Powered by [Vercel AI SDK](https://sdk.vercel.ai)
- Inspired by existing LLM benchmarks: MMLU, TruthfulQA, HumanEval, etc.
- Theological input from various Christian traditions and scholars

## 📧 Contact

For questions, suggestions, or collaboration:

- Open an issue on GitHub
- Email: [your-email@example.com]
- Twitter: [@yourusername]

---

*"Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth." - 2 Timothy 2:15 (NIV)*
