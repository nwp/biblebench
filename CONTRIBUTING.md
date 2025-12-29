# Contributing to BibleBench

Thank you for your interest in contributing to BibleBench! This document provides guidelines for contributing to the project.

## 🎯 Ways to Contribute

### 1. Adding Test Cases

Expand existing evaluations with more test cases:

- **Scripture Tests**: Add more verses, references, or context questions
- **Theology Tests**: Add doctrinal questions, edge cases, or pastoral scenarios
- **Heresy Detection**: Add examples of historical or contemporary heresies

**Guidelines:**
- Test cases should be theologically sound and well-researched
- Provide expected answers that represent orthodox Christian teaching
- Include diverse difficulty levels (easy, medium, hard)
- Cite sources for historical or doctrinal claims

### 2. Creating New Evaluation Categories

Propose and implement new evaluation categories:

**Potential areas:**
- Church history
- Biblical languages (Hebrew, Greek)
- Apologetics
- Ethics and moral theology
- Worship and liturgy
- Comparative religion
- Biblical interpretation methods

**Requirements:**
- Create a new `.eval.ts` file in the appropriate directory
- Use multiple scorers (both rule-based and LLM-as-judge)
- Document the evaluation's purpose and methodology
- Ensure theological balance and fairness

### 3. Improving Scorers

Enhance existing scorers or create new ones:

- More sophisticated string matching
- Better theological concept detection
- Advanced LLM-as-judge prompts
- Multi-dimensional scoring

**Guidelines:**
- Scorers should return values between 0 and 1
- Include meaningful metadata for debugging
- Document what the scorer measures
- Test on diverse inputs

### 4. Adding Model Support

Add support for new LLM providers:

```typescript
// In evals/lib/models.ts
import { createOpenAI } from "@ai-sdk/openai";
import { wrapAISDKModel } from "evalite/ai-sdk";

const provider = createOpenAI({
  baseURL: "https://api.provider.com/v1",
  apiKey: process.env.PROVIDER_API_KEY,
});

export const newModel = wrapAISDKModel(provider("model-name"));
```

Update `.env.example` with new required keys.

### 5. Documentation

Improve documentation:

- Clarify setup instructions
- Add tutorials or examples
- Expand theological methodology section
- Create video walkthroughs
- Translate to other languages

### 6. Bug Reports

Report issues including:

- Steps to reproduce
- Expected vs. actual behavior
- Environment details (Node version, OS, etc.)
- Relevant error messages or logs

## 📋 Theological Guidelines

### Orthodoxy

All contributions should align with **historic Christian orthodoxy** as expressed in the ancient creeds (Apostles', Nicene, Chalcedonian). Core non-negotiables include:

- Trinity (one God in three persons)
- Deity and humanity of Christ
- Salvation by grace through faith
- Authority of Scripture
- Bodily resurrection

### Denominational Neutrality

Respect legitimate theological diversity:

- **Do**: Present multiple orthodox perspectives fairly
- **Don't**: Favor one denomination over others on disputable matters
- **Do**: Distinguish core doctrines from secondary issues
- **Don't**: Present debatable positions as if they're universally accepted

### Sensitive Topics

Handle controversial topics with care:

- Represent multiple orthodox viewpoints
- Use charitable language
- Avoid inflammatory phrasing
- Focus on biblical and historical grounding

### Sources

Cite theological sources when appropriate:

- Scripture references (always)
- Church fathers and historical theologians
- Confessions and catechisms
- Contemporary scholars (when relevant)

## 🔧 Technical Guidelines

### Code Style

- Use TypeScript with strict typing
- Follow existing code formatting
- Write clear, descriptive variable names
- Add comments for complex logic

### File Organization

```
evals/
├── scripture/        # Scripture knowledge tests
├── theology/         # Theological understanding tests
├── [new-category]/   # New evaluation categories
└── lib/             # Shared utilities
    ├── models.ts    # Model configurations
    └── scorers.ts   # Reusable scorers
```

### Evaluation Structure

Every eval file should:

1. Import necessary utilities
2. Define test data with clear structure
3. Iterate over benchmark models
4. Use multiple complementary scorers
5. Include clear descriptions

Example structure (using A/B testing):

```typescript
import { evalite } from "evalite";
import { generateText } from "ai";
import { selectedModels } from "../lib/models.js";
import { myScorer } from "../lib/scorers.js";

const testData = [
  {
    input: "Question or prompt",
    expected: "Expected answer",
    // Additional metadata
  },
  // More test cases
];

// Run A/B testing across all models
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Category Name", {
  data: async () => testData,
  task: async (input, variant) => {
    const result = await generateText({
      model: variant.input.model,
      prompt: `System prompt\n\n${input}`,
    });
    return result.text;
  },
  scorers: [
    myScorer,
    // Additional scorers
  ],
});
```

**Note:** All evaluations use `evalite.each()` for A/B testing, which enables side-by-side model comparison in the UI. This is the standard pattern for all BibleBench evaluations.

### Testing

Before submitting:

1. Run your evaluation: `pnpm eval:dev`
2. Verify scores make sense
3. Check traces in the UI
4. Test with multiple models (use `MODELS="model1,model2" pnpm eval:dev` to test specific models)
5. Review metadata output

**Tip:** Use the `MODELS` environment variable to test with a subset of models during development:

```bash
# Test with just one or two models to save time/cost
MODELS="gpt-5.2,claude haiku" pnpm eval:dev

# Test your new evaluation file with all models
pnpm eval evals/your-category/your-eval.eval.ts
```

### Commit Messages

Use clear, descriptive commit messages:

- `feat: Add church history evaluation category`
- `fix: Correct Levenshtein scorer calculation`
- `docs: Update installation instructions`
- `test: Add test cases for Trinity doctrine`

## 🚀 Submission Process

1. **Fork** the repository
2. **Create a branch** for your feature: `git checkout -b feature/my-contribution`
3. **Make your changes** following the guidelines above
4. **Test thoroughly** using `pnpm eval:dev`
5. **Commit** with clear messages
6. **Push** to your fork
7. **Open a Pull Request** with:
   - Clear description of changes
   - Motivation for the contribution
   - Any theological sources consulted
   - Screenshots of eval results (if applicable)

## 📖 Review Process

Pull requests will be reviewed for:

1. **Theological accuracy**: Does it align with orthodox Christianity?
2. **Technical quality**: Does it follow code standards?
3. **Fairness**: Does it avoid denominational bias on disputable matters?
4. **Documentation**: Is it well-documented?
5. **Testing**: Has it been tested with multiple models?

Reviewers may request changes or clarifications. This is normal and helps maintain quality!

## ❓ Questions?

- Open a GitHub issue for technical questions
- Start a discussion for theological clarifications
- Email the maintainers for private inquiries

## 🙏 Code of Conduct

- Be respectful and charitable in all interactions
- Assume good faith from contributors
- Focus on ideas, not people
- Welcome diverse perspectives within orthodox Christianity
- Maintain professional and gracious communication

Remember: We're all seeking to create a valuable tool for evaluating LLMs' theological knowledge. Disagreements on secondary matters are expected and welcome, as long as we maintain unity on essentials and charity in all things.

---

*"And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another..." - Hebrews 10:24-25*
