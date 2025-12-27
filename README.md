# BibleBench 📖

**An industry-standard LLM benchmark for Christian scripture accuracy and theological understanding**

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

```
biblebench/
├── evals/
│   ├── scripture/              # Scripture accuracy evaluations
│   │   ├── verse-recall.eval.ts
│   │   ├── reference-knowledge.eval.ts
│   │   └── context-understanding.eval.ts
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

### LLM-as-Judge Scorers
- **Theological Accuracy Judge**: Evaluates doctrinal soundness, biblical grounding, and nuance
- **Heresy Detection Judge**: Identifies heterodox teaching with severity ratings
- **Denominational Bias Detector**: Measures ecumenical balance
- **Pastoral Wisdom Judge**: Multi-dimensional evaluation of pastoral responses

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

Create a `.env` file with your API keys:

```env
# OpenAI (for GPT models)
OPENAI_API_KEY=your_openai_key

# Anthropic (for Claude models)
ANTHROPIC_API_KEY=your_anthropic_key

# X.AI (for Grok models - optional)
XAI_API_KEY=your_xai_key

# Other providers as needed
```

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

## 🔧 Customization

### Adding New Models

Edit `evals/lib/models.ts`:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { wrapAISDKModel } from "evalite/ai-sdk";

const customProvider = createOpenAI({
  baseURL: "https://api.custom.ai/v1",
  apiKey: process.env.CUSTOM_API_KEY,
});

export const customModel = wrapAISDKModel(customProvider("model-name"));

// Add to benchmarkModels array
export const benchmarkModels = [
  // ... existing models
  { name: "Custom Model", model: customModel },
];
```

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

Default test cases use the **New International Version (NIV)**, but scorers are designed to accept minor translation variations. We may expand to test multiple translations in the future.

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
