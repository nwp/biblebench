/**
 * Models Page Manager
 * Renders model specifications and usage data
 */

// Evaluation sort value to dashboard evaluation name mapping
const EVAL_SORT_MAP = {
  'eval-context-understanding': 'Context Understanding',
  'eval-core-doctrines': 'Core Doctrines',
  'eval-denominational-nuance': 'Denominational Nuance',
  'eval-exact-scripture-matching': 'Exact Scripture Matching',
  'eval-heresy-detection': 'Heresy Detection',
  'eval-pastoral-application': 'Pastoral Application',
  'eval-reference-knowledge': 'Reference Knowledge',
  'eval-sect-theology': 'Sect Theology',
  'eval-steering-compliance-conservative': 'Steering Compliance - Conservative',
  'eval-steering-compliance-progressive': 'Steering Compliance - Progressive'
};

class ModelsPageManager {
  constructor() {
    this.metadata = null;
    this.usage = null;
    this.dashboard = null;
    this.sortOption = 'score-high';
  }

  async init() {
    try {
      await this.loadData();
      this.updateTotalCost();
      this.setupSortControl();
      this.renderModels();
      this.setupScrollBehavior();
    } catch (error) {
      console.error('Failed to initialize models page:', error);
      this.showError(error.message);
    }
  }

  updateTotalCost() {
    const totalCost = Object.values(this.usage).reduce((sum, model) => {
      return sum + (model.totalCost || 0);
    }, 0);

    const leadParagraph = document.querySelector('.intro-section .lead');
    if (leadParagraph) {
      const costText = document.createTextNode(` Total evaluation cost across all models: `);
      const costSpan = document.createElement('strong');
      costSpan.style.color = 'var(--accent-primary)';
      costSpan.textContent = `$${totalCost.toFixed(2)}`;

      leadParagraph.appendChild(costText);
      leadParagraph.appendChild(costSpan);
      leadParagraph.appendChild(document.createTextNode('.'));
    }
  }

  async loadData() {
    try {
      const [metadataResponse, usageResponse, dashboardResponse] = await Promise.all([
        fetch('./data/models-metadata.json'),
        fetch('./data/models-usage.json'),
        fetch('./data/dashboard.json')
      ]);

      if (!metadataResponse.ok || !usageResponse.ok || !dashboardResponse.ok) {
        throw new Error('Failed to load model data');
      }

      this.metadata = await metadataResponse.json();
      this.usage = await usageResponse.json();
      this.dashboard = await dashboardResponse.json();
    } catch (error) {
      console.error('Error loading data:', error);
      throw new Error('Could not load model data. Please try refreshing the page.');
    }
  }

  setupSortControl() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
      this.sortOption = e.target.value;
      this.updateValueExplanationVisibility();
      this.renderModels();
    });

    // Initialize explanation visibility on page load
    this.updateValueExplanationVisibility();
  }

  updateValueExplanationVisibility() {
    const explanation = document.getElementById('value-explanation');
    if (!explanation) return;

    const isValueSort = this.sortOption === 'value-high' || this.sortOption === 'value-low';
    explanation.style.display = isValueSort ? 'flex' : 'none';
  }

  renderModels() {
    const container = document.getElementById('models-grid');
    container.textContent = '';

    if (this.sortOption === 'provider') {
      const grouped = this.groupByProvider(this.metadata);
      for (const [provider, models] of Object.entries(grouped)) {
        const section = this.createProviderSection(provider, models);
        container.appendChild(section);
      }
    } else {
      const sortedModels = this.getSortedModels();
      const section = this.createFlatSection(sortedModels);
      container.appendChild(section);
    }
  }

  getSortedModels() {
    const modelsArray = Object.values(this.metadata);

    // Check if this is an evaluation sort
    if (this.sortOption.startsWith('eval-')) {
      const evaluationName = EVAL_SORT_MAP[this.sortOption];
      if (evaluationName) {
        return modelsArray.sort((a, b) => {
          const scoreA = this.getModelEvaluationScore(a.id, evaluationName);
          const scoreB = this.getModelEvaluationScore(b.id, evaluationName);
          return scoreB - scoreA; // High to low
        });
      }
    }

    switch (this.sortOption) {
      case 'value-high':
        return modelsArray.sort((a, b) => {
          const valueA = this.getModelValueScore(a.id);
          const valueB = this.getModelValueScore(b.id);
          return valueB - valueA;
        });

      case 'value-low':
        return modelsArray.sort((a, b) => {
          const valueA = this.getModelValueScore(a.id);
          const valueB = this.getModelValueScore(b.id);
          return valueA - valueB;
        });

      case 'score-high':
        return modelsArray.sort((a, b) => {
          const scoreA = this.getModelScore(a.id);
          const scoreB = this.getModelScore(b.id);
          return scoreB - scoreA;
        });

      case 'score-low':
        return modelsArray.sort((a, b) => {
          const scoreA = this.getModelScore(a.id);
          const scoreB = this.getModelScore(b.id);
          return scoreA - scoreB;
        });

      case 'cost-high':
        return modelsArray.sort((a, b) => {
          const costA = this.usage[a.id]?.totalCost || 0;
          const costB = this.usage[b.id]?.totalCost || 0;
          return costB - costA;
        });

      case 'cost-low':
        return modelsArray.sort((a, b) => {
          const costA = this.usage[a.id]?.totalCost || 0;
          const costB = this.usage[b.id]?.totalCost || 0;
          return costA - costB;
        });

      case 'name':
        return modelsArray.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );

      default:
        return modelsArray;
    }
  }

  getModelScore(modelId) {
    const dashboardModel = this.dashboard.models.find(m => m.id === modelId);
    return dashboardModel?.overallScore || 0;
  }

  getModelValueScore(modelId) {
    const score = this.getModelScore(modelId);
    const cost = this.usage[modelId]?.totalCost || 0;

    // If cost is 0 or model has no usage, return 0 to prevent division by zero
    if (cost === 0 || score === 0) return 0;

    // Value = Score per dollar (higher is better)
    return score / cost;
  }

  getModelEvaluationScore(modelId, evaluationName) {
    const dashboardModel = this.dashboard.models.find(m => m.id === modelId);
    return dashboardModel?.evaluationScores?.[evaluationName] || 0;
  }

  getModelCategoryScore(modelId, category) {
    const dashboardModel = this.dashboard.models.find(m => m.id === modelId);
    return dashboardModel?.categoryScores?.[category] || 0;
  }

  formatTheologicalOrientation(score) {
    if (score < 0.33) {
      return 'More Progressive';
    } else if (score < 0.67) {
      return 'Moderate';
    } else {
      return 'More Conservative';
    }
  }

  createEvaluationCategory(modelId, categoryName, categoryKey, evaluations) {
    const details = document.createElement('details');
    details.className = 'eval-category';

    const summary = document.createElement('summary');
    const score = this.getModelCategoryScore(modelId, categoryKey);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'category-name';
    nameSpan.textContent = categoryName;
    summary.appendChild(nameSpan);

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'category-score';
    scoreSpan.textContent = `${(score * 100).toFixed(1)}%`;
    summary.appendChild(scoreSpan);

    details.appendChild(summary);

    const evalsList = document.createElement('div');
    evalsList.className = 'evals-list';

    for (const evalName of evaluations) {
      const evalScore = this.getModelEvaluationScore(modelId, evalName);
      const evalItem = this.createEvalItem(evalName, evalScore);
      evalsList.appendChild(evalItem);
    }

    details.appendChild(evalsList);
    return details;
  }

  createEvalItem(name, score) {
    const item = document.createElement('div');
    item.className = 'eval-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'eval-name';
    nameSpan.textContent = name;

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'eval-score';

    // Format Theological Orientation as categorical instead of percentage
    if (name === 'Theological Orientation') {
      scoreSpan.textContent = this.formatTheologicalOrientation(score);
    } else {
      scoreSpan.textContent = `${(score * 100).toFixed(1)}%`;
    }

    item.appendChild(nameSpan);
    item.appendChild(scoreSpan);

    return item;
  }

  createFlatSection(models) {
    const section = document.createElement('div');
    section.className = 'provider-section';

    const modelsContainer = document.createElement('div');
    modelsContainer.className = 'provider-models';

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const modelUsage = this.usage[model.id] || null;

      let rank = null;
      if (this.sortOption === 'score-high') {
        rank = i + 1;
      } else if (this.sortOption === 'score-low') {
        rank = models.length - i;
      }

      const card = this.createModelCard(model, modelUsage, rank);
      modelsContainer.appendChild(card);
    }

    section.appendChild(modelsContainer);
    return section;
  }

  groupByProvider(metadata) {
    const groups = {};

    for (const modelId in metadata) {
      const model = metadata[modelId];
      const provider = model.provider || 'Unknown';

      if (!groups[provider]) {
        groups[provider] = [];
      }

      groups[provider].push(model);
    }

    const providerNames = Object.keys(groups).sort((a, b) => a.localeCompare(b));

    const sortedGroups = {};
    for (const provider of providerNames) {
      groups[provider].sort((a, b) => a.displayName.localeCompare(b.displayName));
      sortedGroups[provider] = groups[provider];
    }

    return sortedGroups;
  }

  createProviderSection(provider, models) {
    const section = document.createElement('div');
    section.className = 'provider-section';

    const heading = document.createElement('h3');
    heading.className = 'provider-heading';
    heading.textContent = provider;
    section.appendChild(heading);

    const modelsContainer = document.createElement('div');
    modelsContainer.className = 'provider-models';

    for (const model of models) {
      const modelUsage = this.usage[model.id] || null;
      const card = this.createModelCard(model, modelUsage, null);
      modelsContainer.appendChild(card);
    }

    section.appendChild(modelsContainer);
    return section;
  }

  createModelCard(model, usage, rank = null) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.id = model.id;

    const header = this.createModelHeader(model, rank);
    card.appendChild(header);

    const description = document.createElement('p');
    description.className = 'model-description';
    description.textContent = model.description;
    card.appendChild(description);

    const evalPerformance = this.createEvaluationPerformance(model);
    card.appendChild(evalPerformance);

    const usageSection = this.createUsageSection(usage, model);
    card.appendChild(usageSection);

    const specsAndCaps = this.createSpecsAndCapabilities(model);
    card.appendChild(specsAndCaps);

    return card;
  }

  createModelHeader(model, rank = null) {
    const header = document.createElement('div');
    header.className = 'model-header';

    const badge = document.createElement('span');
    badge.className = 'provider-badge';
    badge.textContent = model.provider;
    header.appendChild(badge);

    const name = document.createElement('h4');
    name.className = 'model-name';
    name.textContent = model.displayName;
    header.appendChild(name);

    if (rank !== null) {
      const rankBadge = document.createElement('span');
      rankBadge.className = 'rank-badge';

      if (rank === 1) rankBadge.classList.add('rank-1');
      else if (rank === 2) rankBadge.classList.add('rank-2');
      else if (rank === 3) rankBadge.classList.add('rank-3');

      rankBadge.textContent = `#${rank}`;
      header.appendChild(rankBadge);
    }

    return header;
  }

  createEvaluationPerformance(model) {
    const section = document.createElement('div');
    section.className = 'evaluation-performance';

    const heading = document.createElement('h5');
    heading.className = 'section-heading';
    heading.textContent = 'Evaluation Performance';
    section.appendChild(heading);

    // Determine which metric to display prominently based on sort option
    let prominentLabel = 'Overall Score';
    let prominentScore = this.getModelScore(model.id);

    // If sorting by a specific evaluation, show that evaluation instead
    if (this.sortOption.startsWith('eval-')) {
      const evaluationName = EVAL_SORT_MAP[this.sortOption];
      if (evaluationName) {
        prominentLabel = evaluationName;
        prominentScore = this.getModelEvaluationScore(model.id, evaluationName);
      }
    }

    // Create prominent score display with dynamic label
    const overallDiv = document.createElement('div');
    overallDiv.className = 'overall-score-display';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'label';
    labelSpan.textContent = prominentLabel;
    overallDiv.appendChild(labelSpan);

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'score highlight';

    // Format Theological Orientation as categorical instead of percentage
    if (prominentLabel === 'Theological Orientation') {
      scoreSpan.textContent = this.formatTheologicalOrientation(prominentScore);
    } else {
      scoreSpan.textContent = `${(prominentScore * 100).toFixed(1)}%`;
    }

    overallDiv.appendChild(scoreSpan);

    section.appendChild(overallDiv);

    // Category sections (expandable)
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'eval-categories';

    // Scripture Accuracy
    const scriptureEvals = [
      'Context Understanding',
      'Exact Scripture Matching',
      'Reference Knowledge'
    ];
    const scriptureCategory = this.createEvaluationCategory(
      model.id,
      'Scripture Accuracy',
      'scripture',
      scriptureEvals
    );
    categoriesContainer.appendChild(scriptureCategory);

    // Theological Understanding
    const theologyEvals = [
      'Core Doctrines',
      'Denominational Nuance',
      'Heresy Detection',
      'Pastoral Application',
      'Sect Theology',
      'Steering Compliance - Conservative',
      'Steering Compliance - Progressive',
      'Theological Orientation'
    ];
    const theologyCategory = this.createEvaluationCategory(
      model.id,
      'Theological Understanding',
      'theology',
      theologyEvals
    );
    categoriesContainer.appendChild(theologyCategory);

    section.appendChild(categoriesContainer);
    return section;
  }

  createSpec(label, value) {
    const spec = document.createElement('div');
    spec.className = 'spec';

    const labelEl = document.createElement('span');
    labelEl.className = 'label';
    labelEl.textContent = label;
    spec.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.className = 'value';
    valueEl.textContent = value;
    spec.appendChild(valueEl);

    return spec;
  }

  createUsageSection(usage, model) {
    const container = document.createElement('div');
    container.className = 'usage-stats';

    const heading = document.createElement('h5');
    heading.className = 'usage-heading';
    heading.textContent = 'Evaluation Usage';
    container.appendChild(heading);

    if (!usage || usage.totalTokens === 0) {
      container.classList.add('no-data');
      const message = document.createElement('p');
      message.className = 'no-data-message';
      message.textContent = 'No usage data available for this model';
      container.appendChild(message);
      return container;
    }

    const grid = document.createElement('div');
    grid.className = 'usage-grid';

    const inputStat = this.createStat('Input Tokens', this.formatNumber(usage.inputTokens));
    grid.appendChild(inputStat);

    const outputStat = this.createStat('Output Tokens', this.formatNumber(usage.outputTokens));
    grid.appendChild(outputStat);

    const costStat = this.createStat('Total Cost', `$${this.formatCost(usage.totalCost)}`, true);
    grid.appendChild(costStat);

    // Replace Test Cases with Value Score
    const valueScore = this.getModelValueScore(model.id);
    if (valueScore > 0) {
      const valueStat = this.createStat('Value Score', `${(valueScore * 100).toFixed(1)} pts/$`);
      valueStat.classList.add('spec-value');
      grid.appendChild(valueStat);
    } else {
      // Fallback to test cases if no value score available
      const testsStat = this.createStat('Test Cases', this.formatNumber(usage.evaluationsCount));
      grid.appendChild(testsStat);
    }

    container.appendChild(grid);
    return container;
  }

  createStat(label, value, isCostHighlight = false) {
    const stat = document.createElement('div');
    stat.className = 'stat';

    const labelEl = document.createElement('span');
    labelEl.className = 'label';
    labelEl.textContent = label;
    stat.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.className = isCostHighlight ? 'value cost-highlight' : 'value';
    valueEl.textContent = value;
    stat.appendChild(valueEl);

    return stat;
  }

  createSpecsAndCapabilities(model) {
    const details = document.createElement('details');
    details.className = 'capabilities';

    const summary = document.createElement('summary');
    summary.textContent = 'Specifications & Capabilities';
    details.appendChild(summary);

    const content = document.createElement('div');
    content.className = 'capabilities-content';

    // Add model specifications first
    const specsHeading = document.createElement('p');
    const specsStrong = document.createElement('strong');
    specsStrong.textContent = 'Model Specifications';
    specsHeading.appendChild(specsStrong);
    content.appendChild(specsHeading);

    const specsList = document.createElement('ul');

    const contextItem = document.createElement('li');
    contextItem.textContent = `Context Length: ${this.formatNumber(model.contextLength)} tokens`;
    specsList.appendChild(contextItem);

    const promptItem = document.createElement('li');
    promptItem.textContent = `Prompt Cost: $${this.formatCostPerMillion(model.cost.prompt)}/M tokens`;
    specsList.appendChild(promptItem);

    const completionItem = document.createElement('li');
    completionItem.textContent = `Completion Cost: $${this.formatCostPerMillion(model.cost.completion)}/M tokens`;
    specsList.appendChild(completionItem);

    content.appendChild(specsList);

    // Modalities
    if (model.modalities) {
      const modalitiesPara = document.createElement('p');
      modalitiesPara.className = 'modalities';
      const modalitiesStrong = document.createElement('strong');
      modalitiesStrong.textContent = 'Modalities: ';
      modalitiesPara.appendChild(modalitiesStrong);
      modalitiesPara.appendChild(document.createTextNode(this.formatModalities(model.modalities)));
      content.appendChild(modalitiesPara);
    }

    // Capabilities list
    if (model.capabilities && model.capabilities.length > 0) {
      const capabilitiesStrong = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = 'Features:';
      capabilitiesStrong.appendChild(strong);
      content.appendChild(capabilitiesStrong);

      const list = document.createElement('ul');
      for (const capability of model.capabilities) {
        const item = document.createElement('li');
        item.textContent = capability;
        list.appendChild(item);
      }
      content.appendChild(list);
    }

    if (model.architecture && model.architecture !== 'Unknown') {
      const archPara = document.createElement('p');
      archPara.className = 'architecture';
      const archStrong = document.createElement('strong');
      archStrong.textContent = 'Architecture: ';
      archPara.appendChild(archStrong);
      archPara.appendChild(document.createTextNode(model.architecture));
      content.appendChild(archPara);
    }

    if (model.released) {
      const releasedPara = document.createElement('p');
      releasedPara.className = 'released';
      const releasedStrong = document.createElement('strong');
      releasedStrong.textContent = 'Released: ';
      releasedPara.appendChild(releasedStrong);
      releasedPara.appendChild(document.createTextNode(model.released));
      content.appendChild(releasedPara);
    }

    details.appendChild(content);
    return details;
  }

  setupScrollBehavior() {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => this.scrollToModel(id), 100);
    }

    window.addEventListener('hashchange', () => {
      const id = window.location.hash.slice(1);
      this.scrollToModel(id);
    });
  }

  scrollToModel(id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('highlighted');
      setTimeout(() => element.classList.remove('highlighted'), 2000);
    }
  }

  formatNumber(num) {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString('en-US');
  }

  formatCost(cost) {
    if (cost === null || cost === undefined) return '0.00';
    return cost.toFixed(2);
  }

  formatCostPerMillion(costPerToken) {
    if (costPerToken === null || costPerToken === undefined) return '0.00';
    const perMillion = costPerToken * 1000000;
    return perMillion.toFixed(2);
  }

  formatModalities(modalities) {
    if (!modalities) return 'N/A';

    const input = Array.isArray(modalities.input) ? modalities.input.join(', ') : 'text';
    const output = Array.isArray(modalities.output) ? modalities.output.join(', ') : 'text';

    if (input === output) {
      return input.charAt(0).toUpperCase() + input.slice(1);
    }

    return `${input.charAt(0).toUpperCase() + input.slice(1)} → ${output.charAt(0).toUpperCase() + output.slice(1)}`;
  }

  showError(message) {
    const container = document.getElementById('models-grid');
    container.textContent = '';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-state';

    const errorPara = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Error: ';
    errorPara.appendChild(strong);
    errorPara.appendChild(document.createTextNode(message));

    errorDiv.appendChild(errorPara);
    container.appendChild(errorDiv);
  }
}

const manager = new ModelsPageManager();
manager.init();
