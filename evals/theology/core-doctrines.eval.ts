/**
 * Core Christian Doctrines Evaluation
 *
 * Tests LLMs' understanding of fundamental Christian theological concepts
 * including the Trinity, incarnation, salvation, and more.
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { selectedModels } from "../lib/models.js";
import { theologicalAccuracyJudge, heresyDetectionJudge } from "../lib/scorers.js";
import { extractKeyTerms } from "../lib/utils.js";

const coreDoctrinesData = [
  {
    input: "Explain the doctrine of the Trinity. How can God be one yet three persons?",
    expected: "The Trinity is the Christian doctrine that God exists as three distinct persons (Father, Son, and Holy Spirit) who are coequal and coeternal, yet remain one God in essence and substance. This is a mystery that transcends human comprehension - not three gods (tritheism) nor one person in three modes (modalism), but one God in three persons who are distinct yet inseparable in their divine nature and work.",
    theologicalImportance: "foundational"
  },
  {
    input: "What is the hypostatic union in relation to Jesus Christ?",
    expected: "The hypostatic union is the doctrine that Jesus Christ is one person with two complete and distinct natures: fully God and fully human. These two natures are united without mixture, confusion, separation, or division. Jesus is not partly God and partly human, but wholly God and wholly human simultaneously.",
    theologicalImportance: "foundational"
  },
  {
    input: "Explain justification by faith. How does someone become righteous before God?",
    expected: "Justification by faith is the doctrine that sinners are declared righteous before God solely through faith in Jesus Christ, not by their own works or merit. It is a legal declaration by God where the righteousness of Christ is imputed to believers, and their sins are forgiven. This justification is received through faith alone (sola fide), by grace alone (sola gratia), based on Christ's finished work alone (solus Christus).",
    theologicalImportance: "foundational"
  },
  {
    input: "What is the doctrine of original sin?",
    expected: "Original sin is the doctrine that all humanity inherited a sinful nature from Adam's fall. As a result, all people are born with a inclination toward sin and are spiritually separated from God. This doesn't mean infants are guilty of actual sins, but that human nature is corrupted and inclined toward evil apart from God's grace.",
    theologicalImportance: "core"
  },
  {
    input: "Explain the relationship between divine sovereignty and human responsibility.",
    expected: "Divine sovereignty and human responsibility are both biblical truths held in tension. God is completely sovereign over all things, yet humans are genuine moral agents responsible for their choices. Scripture teaches both that God ordains all things and that humans make real choices for which they are accountable. Different theological traditions emphasize these aspects differently (Calvinism vs. Arminianism), but orthodox Christianity affirms both truths without fully resolving the mystery of how they relate.",
    theologicalImportance: "nuanced"
  },
  {
    input: "What does it mean that humans are made in the image of God (imago Dei)?",
    expected: "Being made in the image of God means humans uniquely reflect God's nature and character among creation. This includes rational thinking, moral awareness, creativity, relational capacity, and spiritual nature. While sin has marred this image, it hasn't been completely destroyed. The imago Dei gives humans inherent dignity and worth, distinguishes them from animals, and establishes the basis for human morality and purpose.",
    theologicalImportance: "core"
  },
  {
    input: "What is the gospel?",
    expected: "The gospel is the good news that Jesus Christ, the eternal Son of God, became human, lived a perfect life, died on the cross as a substitute for sinners, rose from the dead, and now offers salvation and reconciliation with God to all who repent and believe in him. It proclaims that salvation is a free gift of God's grace, not earned by human effort, received through faith in Christ alone.",
    theologicalImportance: "foundational"
  },
  {
    input: "Explain the doctrine of the resurrection of the body.",
    expected: "The resurrection of the body is the Christian belief that at Christ's return, the dead will be raised with transformed, imperishable bodies. This will be a physical resurrection, not merely spiritual immortality. Believers will receive glorified bodies like Christ's resurrection body - real and physical yet freed from decay, death, and limitations of our current bodies. This demonstrates that God's redemption extends to the whole person, not just the soul.",
    theologicalImportance: "core"
  }
];

// Run the evaluation for each model
for (const { name, model } of selectedModels) {
  evalite(`Core Doctrines - ${name}`, {
    data: coreDoctrinesData,
    task: async (input) => {
      const result = await generateText({
        model,
        prompt: `You are a systematic theologian with deep knowledge of Christian doctrine. Provide a clear, accurate, and biblically grounded explanation of the following theological concept.\n\n${input}`,
      });
      return result.text;
    },
    scorers: [
      theologicalAccuracyJudge,
      heresyDetectionJudge,
      {
        name: "Doctrinal Completeness",
        description: "Evaluates how completely the response covers essential aspects of the doctrine",
        scorer: async ({ output, expected }) => {
          const expectedTerms = extractKeyTerms(expected);
          const outputTerms = extractKeyTerms(output);

          const coveredTerms = expectedTerms.filter((term) =>
            outputTerms.includes(term)
          );

          const completeness =
            expectedTerms.length > 0
              ? coveredTerms.length / expectedTerms.length
              : 0;

          return {
            score: completeness,
            metadata: {
              expectedTerms: expectedTerms.slice(0, 10), // First 10 for brevity
              coveredCount: coveredTerms.length,
              totalExpected: expectedTerms.length,
              completeness,
            },
          };
        },
      }
    ],
  });
}
