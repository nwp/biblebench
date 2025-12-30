![BibleBench logo](docs/logo.png)

# BibleBench
An LLM benchmark for Christian scripture accuracy and theological understanding

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
│   │   ├── scripture-matching.eval.ts  # Exact verse recall across translations
│   │   ├── reference-knowledge.eval.ts
│   │   └── context-understanding.eval.ts
│   ├── theology/               # Theological concept evaluations
│   │   ├── core-doctrines.eval.ts
│   │   ├── heresy-detection.eval.ts
│   │   ├── denominational-nuance.eval.ts
│   │   ├── pastoral-application.eval.ts
│   │   ├── sect-theology.eval.ts               # Sect/cult theology evaluation
│   │   ├── theological-orientation.eval.ts     # Theological spectrum analysis
│   │   └── steering-compliance.eval.ts         # Bias asymmetry detection
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

**Exact Scripture Matching** (`scripture/scripture-matching.eval.ts`)

- Precise recall of Bible verses with exact wording across multiple translations
- Tests the same verses in KJV, NIV, ESV, and NASB to verify translation-specific accuracy
- 49 test cases covering 16 different verses (both well-known and less common)
- Requires perfect matches—every word, comma, and punctuation mark must be correct
- Includes famous verses (John 3:16, Psalm 23:1) and lesser-known passages (Micah 6:8, Lamentations 3:22-23)
- Measured with exact match scorer—no fuzzy matching since scripture is sacred
- Each test case includes translation-specific key phrases for verification

**Reference Knowledge** (`scripture/reference-knowledge.eval.ts`)

- Correctly identifying where verses are found
- Understanding of Bible book/chapter/verse structure
- Validated against standard reference formats

**Context Understanding** (`scripture/context-understanding.eval.ts`)

- Authorship and historical background
- Purpose and audience of biblical books
- Understanding of scriptural context
- Uses LLM-as-judge for nuanced evaluation

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

**Sect Theology** (`theology/sect-theology.eval.ts`)

- Identifying teachings of groups outside historic Christian orthodoxy
- Tests knowledge of Mormonism (LDS), Jehovah's Witnesses, Christian Science, Oneness Pentecostalism, and Unitarian Universalism
- Evaluates ability to articulate how sect teachings depart from orthodoxy
- Measures respectful tone while maintaining theological accuracy
- Includes 18 test cases covering core doctrines (Trinity, Christology, salvation, resurrection, etc.)
- Scorers: Theological accuracy judge, sect identification, orthodox defense, respectful tone

**Theological Orientation Spectrum** (`theology/theological-orientation.eval.ts`)

- Descriptive assessment of where models fall on the theological spectrum (progressive to conservative)
- Covers Biblical Authority, Gender & Ministry, Sexual Ethics, Gender Identity, Social Issues, and Ecclesiology
- Not pass/fail - measures theological positioning on contested issues
- Tests 23 questions across categories like inerrancy, women in leadership, LGBTQ+ issues, abortion, social justice
- Scorers: Orientation classifier (0=progressive, 0.5=moderate, 1=conservative), position clarity detector, scripture usage analyzer
- Provides insight into models' theological default positions and handling of diverse Christian perspectives

**Steering Compliance & Bias Asymmetry** (`theology/steering-compliance.eval.ts`)

- Tests whether models comply symmetrically with system prompts adopting different theological perspectives
- Each test case includes both conservative and progressive persona prompts with the same question
- Measures compliance asymmetry - do models refuse, hedge, or add disclaimers more for one perspective?
- Covers 10 contentious topics: same-sex marriage, transgender identity, women in ministry, abortion, biblical authority, etc.
- Scorers: Pure compliance (binary pass/fail for clean adoption), persona compliance, refusal detection, viewpoint expression
- Reveals potential bias in model guardrails and safety systems
- Descriptive study of model behavior, not endorsement of any theological position

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

- **Exact Match**: Binary scorer for precise scripture text matching (used in scripture-matching evaluation)
- **Translation Phrase Match**: Checks for translation-specific key phrases (e.g., "begotten" in KJV)
- **Translation Vocabulary Fidelity**: Validates use of appropriate vocabulary for each translation

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

BibleBench is currently configured to test **20 cutting-edge models** across 10 different providers, all accessed through OpenRouter:

### OpenAI Models (6)

- **GPT-5 Mini** - Default judge model (efficient and cost-effective)
- **GPT-5.2** - Latest generation with enhanced capabilities
- **GPT-5.1** - Advanced reasoning model
- **GPT-5 Nano** - Efficient compact model
- **GPT-OSS-120B** - Open-source 120B parameter model
- **GPT-OSS-20B** - Open-source 20B parameter model

### Anthropic Models (3)

- **Claude Haiku 4.5** - Fast, efficient Claude variant
- **Claude Sonnet 4.5** - Balanced quality and speed
- **Claude Opus 4.5** - Maximum capability model

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

You can easily run evaluations on specific models using the `MODELS` environment variable - no code changes needed!

#### Filter by Model Name

Use comma-separated patterns to match model names (case-insensitive):

```bash
# Run only GPT models
MODELS="gpt" pnpm eval

# Run only Claude models
MODELS="claude" pnpm eval

# Run GPT and Claude models
MODELS="gpt,claude" pnpm eval

# Run specific models by partial name match
MODELS="opus,sonnet" pnpm eval

# Run a single specific model
MODELS="gpt-5.2" pnpm eval
```

#### How Pattern Matching Works

- **Case-insensitive**: `MODELS="gpt"` matches "GPT-5.2", "GPT-5.1", etc.
- **Partial matching**: `MODELS="claude"` matches "Claude Haiku 4.5", "Claude Sonnet 4.5", "Claude Opus 4.5"
- **Multiple patterns**: `MODELS="gpt-5,opus"` matches models containing "gpt-5" OR "opus"
- **Comma-separated**: Use commas to specify multiple patterns

#### Examples

```bash
# Run only OpenAI models
MODELS="gpt" pnpm eval:dev

# Run only Anthropic Opus and Sonnet
MODELS="opus,sonnet" pnpm eval

# Run Google Gemini models
MODELS="gemini" pnpm eval

# Run a specific evaluation with specific models
MODELS="claude haiku,grok" pnpm eval evals/theology/core-doctrines.eval.ts

# Run without caching on specific models
MODELS="gpt-5.2" pnpm eval --no-cache
```

#### View Available Models

If you specify a pattern that doesn't match any models, the system will show you all available model names:

```bash
MODELS="invalid" pnpm eval
# Shows warning with list of all available models
```

**Tip:** By default (without `MODELS` set), all 20+ configured models will run. Use `MODELS` to save time and API costs during development!

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

Create a new `.eval.ts` file in the appropriate directory using Evalite's A/B testing feature:

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { selectedModels } from "../lib/models.js";
import { myScorer } from "../lib/scorers.js";

const myData = [
  { input: "question", expected: "answer" },
  // ... more test cases
];

// Use evalite.each() for side-by-side model comparison
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("My Evaluation", {
  data: async () => myData,
  task: async (input, variant) => {
    const result = await generateText({
      model: variant.input.model,
      prompt: `Your prompt here: ${input}`,
    });
    return result.text;
  },
  scorers: [myScorer],
});
```

**Why use `evalite.each()`?**

- **Side-by-side comparison**: All models are compared within a single evaluation run
- **Per-model scores**: Each model's performance is clearly visible and comparable
- **Better UI**: Evalite's interface shows direct model comparisons
- **Easier analysis**: Instantly see which models perform best on each test case

## 📈 Benchmark Results

All evaluations use **Evalite's A/B testing** feature (`evalite.each()`) to enable direct model comparison. This means:

- **Side-by-side comparison**: Models are tested together in a single evaluation run
- **Per-model scores**: Each model gets its own column showing performance across all test cases
- **Direct comparisons**: Instantly see which models excel or struggle on specific questions
- **Detailed metrics** for each scorer, with model-specific breakdowns
- **Metadata** including rationales from LLM-as-judge scorers
- **Traces** of model inputs and outputs for every test case
- **Unified results**: All model results in one view instead of separate evaluations

Results are stored in `node_modules/.evalite` and can be exported as static HTML for CI/CD integration.

### Model Filtering

Use the `MODELS` environment variable to run evaluations on specific models while maintaining the A/B comparison structure:

```bash
# Compare only GPT models against each other
MODELS="gpt" pnpm eval

# Compare Claude Opus vs Sonnet
MODELS="opus,sonnet" pnpm eval
```

The A/B testing structure is preserved regardless of how many models you filter to.

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
- **NIV** (New International Version, 1978/2011) - Widely-used modern translation
- **ESV** (English Standard Version, 2001) - Literal, modern English
- **NASB** (New American Standard Bible, 1971/1995) - Very literal translation

### Evaluation Approach

- **Exact Scripture Matching** (`scripture-matching.eval.ts`): Tests precise recall of verses with exact wording across multiple translations
- Each verse is tested in 2-4 different translations to verify translation-specific accuracy
- Requires perfect matches—since scripture is sacred, no fuzzy matching is used
- Tests both well-known verses (John 3:16, Psalm 23:1) and less common passages (Micah 6:8, Lamentations 3:22-23)

This approach ensures models are evaluated on their ability to recall scripture with precision and distinguish between translation variations accurately.

## 📄 License

MIT License - see LICENSE file for details.

This benchmark is provided for educational and evaluative purposes. It represents an attempt to create rigorous standards for LLM theological knowledge, but does not claim to be the definitive measure of an LLM's theological accuracy.

## 🙏 Acknowledgments

- Built with [Evalite](https://evalite.dev) by the Evalite team
- Powered by [Vercel AI SDK](https://sdk.vercel.ai)
- Inspired by existing LLM benchmarks: MMLU, TruthfulQA, HumanEval, etc.
- Theological input from various Christian traditions and scholars

---

*"Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth." - 2 Timothy 2:15 (NIV)*
