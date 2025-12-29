/**
 * Filter Manager Module
 * Manages model selection state and UI
 */

export class FilterManager {
  constructor(data, chartManager) {
    this.data = data;
    this.chartManager = chartManager;
    this.allModels = data.models.map(m => m.id);
    this.selectedModels = new Set(this.allModels);

    this.initializeUI();
    this.attachEventListeners();
  }

  initializeUI() {
    // Group models by provider
    const modelsByProvider = this.groupModelsByProvider();

    // Populate filter panel
    const container = document.getElementById('model-groups');
    container.textContent = ''; // Clear existing content

    for (const [provider, models] of Object.entries(modelsByProvider)) {
      const details = document.createElement('details');
      details.open = true;

      const summary = document.createElement('summary');
      summary.textContent = `${provider} (${models.length} ${models.length === 1 ? 'model' : 'models'})`;
      details.appendChild(summary);

      for (const model of models) {
        const label = document.createElement('label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.dataset.modelId = model.id;
        checkbox.classList.add('model-checkbox');

        const text = document.createTextNode(` ${model.displayName}`);

        label.appendChild(checkbox);
        label.appendChild(text);
        details.appendChild(label);
      }

      container.appendChild(details);
    }

    // Update badge
    this.updateBadge();
  }

  groupModelsByProvider() {
    const groups = {};

    for (const model of this.data.models) {
      const provider = model.provider || 'Other';

      if (!groups[provider]) {
        groups[provider] = [];
      }

      groups[provider].push(model);
    }

    return groups;
  }

  attachEventListeners() {
    // Filter trigger button
    const trigger = document.getElementById('filter-trigger');
    const panel = document.getElementById('filter-panel');

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !isOpen);
      panel.hidden = isOpen;
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.model-filter')) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      }
    });

    // Select All button
    document.getElementById('select-all').addEventListener('click', () => {
      this.selectAll();
    });

    // Deselect All button
    document.getElementById('deselect-all').addEventListener('click', () => {
      this.deselectAll();
    });

    // Individual checkboxes
    document.querySelectorAll('.model-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.toggleModel(e.target.dataset.modelId, e.target.checked);
      });
    });

    // Search input
    const searchInput = document.getElementById('filter-search');
    searchInput.addEventListener('input', (e) => {
      this.filterBySearch(e.target.value);
    });
  }

  selectAll() {
    this.selectedModels = new Set(this.allModels);
    this.syncCheckboxes();
    this.updateBadge();
    this.updateCharts();
  }

  deselectAll() {
    this.selectedModels.clear();
    this.syncCheckboxes();
    this.updateBadge();
    this.updateCharts();
  }

  toggleModel(modelId, isSelected) {
    if (isSelected) {
      this.selectedModels.add(modelId);
    } else {
      this.selectedModels.delete(modelId);
    }

    this.updateBadge();
    this.updateCharts();
  }

  syncCheckboxes() {
    document.querySelectorAll('.model-checkbox').forEach(checkbox => {
      checkbox.checked = this.selectedModels.has(checkbox.dataset.modelId);
    });
  }

  filterBySearch(query) {
    const lowerQuery = query.toLowerCase();

    document.querySelectorAll('.model-checkbox').forEach(checkbox => {
      const modelName = checkbox.dataset.modelId.toLowerCase();
      const label = checkbox.parentElement;
      const shouldShow = modelName.includes(lowerQuery);

      label.hidden = !shouldShow;
    });
  }

  updateBadge() {
    const badge = document.getElementById('filter-badge');
    badge.textContent = `${this.selectedModels.size} of ${this.allModels.length}`;
  }

  updateCharts() {
    const selectedModelIds = Array.from(this.selectedModels);
    this.chartManager.updateAllCharts(selectedModelIds);
  }

  getSelectedModels() {
    return Array.from(this.selectedModels);
  }
}
