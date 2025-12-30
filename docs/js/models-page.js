/**
 * Models Page Manager
 * Renders model specifications and usage data
 */

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
      this.renderModels();
    });
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

    switch (this.sortOption) {
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

  createFlatSection(models) {
    const section = document.createElement('div');
    section.className = 'provider-section';

    const modelsContainer = document.createElement('div');
    modelsContainer.className = 'provider-models';

    for (const model of models) {
      const modelUsage = this.usage[model.id] || null;
      const card = this.createModelCard(model, modelUsage);
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
      const card = this.createModelCard(model, modelUsage);
      modelsContainer.appendChild(card);
    }

    section.appendChild(modelsContainer);
    return section;
  }

  createModelCard(model, usage) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.id = model.id;

    const header = this.createModelHeader(model);
    card.appendChild(header);

    const description = document.createElement('p');
    description.className = 'model-description';
    description.textContent = model.description;
    card.appendChild(description);

    const specs = this.createModelSpecs(model);
    card.appendChild(specs);

    const usageSection = this.createUsageSection(usage);
    card.appendChild(usageSection);

    const capabilities = this.createCapabilitiesSection(model);
    card.appendChild(capabilities);

    return card;
  }

  createModelHeader(model) {
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

    return header;
  }

  createModelSpecs(model) {
    const specs = document.createElement('div');
    specs.className = 'model-specs';

    const score = this.getModelScore(model.id);
    const scoreSpec = this.createSpec('Overall Score', `${(score * 100).toFixed(1)}%`);
    scoreSpec.classList.add('spec-highlight');
    specs.appendChild(scoreSpec);

    const contextSpec = this.createSpec('Context Length', `${this.formatNumber(model.contextLength)} tokens`);
    specs.appendChild(contextSpec);

    const promptSpec = this.createSpec('Prompt Cost', `$${this.formatCostPerMillion(model.cost.prompt)}/M tokens`);
    specs.appendChild(promptSpec);

    const completionSpec = this.createSpec('Completion Cost', `$${this.formatCostPerMillion(model.cost.completion)}/M tokens`);
    specs.appendChild(completionSpec);

    return specs;
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

  createUsageSection(usage) {
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

    const testsStat = this.createStat('Test Cases', this.formatNumber(usage.evaluationsCount));
    grid.appendChild(testsStat);

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

  createCapabilitiesSection(model) {
    const details = document.createElement('details');
    details.className = 'capabilities';

    const summary = document.createElement('summary');
    summary.textContent = 'Capabilities';
    details.appendChild(summary);

    const content = document.createElement('div');
    content.className = 'capabilities-content';

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
