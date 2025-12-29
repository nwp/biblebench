/**
 * Evaluation Cards Module
 * Populates expandable description sections for each evaluation
 */

export class EvaluationCards {
  constructor(data) {
    this.data = data;
  }

  renderAll() {
    for (const evaluation of this.data.evaluations) {
      this.renderCard(evaluation);
    }
  }

  renderCard(evaluation) {
    const containerId = `info-${evaluation.id}`;
    const container = document.getElementById(containerId);

    if (!container) {
      console.warn(`Container not found for evaluation: ${evaluation.id}`);
      return;
    }

    // Clear existing content
    container.textContent = '';

    // Description section
    this.addSection(container, 'Description', evaluation.description || 'No description available.');

    // Methodology section
    if (evaluation.methodology) {
      this.addSection(container, 'Methodology', evaluation.methodology);
    }

    // Test Cases section
    if (evaluation.testCases) {
      this.addSection(container, 'Test Cases', `${evaluation.testCases} test cases`);
    }

    // Interpretation section
    if (evaluation.interpretation) {
      this.addSection(container, 'How to Interpret', evaluation.interpretation);
    }
  }

  addSection(container, title, content) {
    const heading = document.createElement('h3');
    heading.textContent = title;
    container.appendChild(heading);

    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    container.appendChild(paragraph);
  }
}
