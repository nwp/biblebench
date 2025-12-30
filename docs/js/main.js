/**
 * BibleBench Dashboard - Main Entry Point
 * Initializes the application
 */

import { loadDashboardData } from './data-loader.js';
import { ChartManager } from './chart-manager.js';
import { FilterManager } from './filter-manager.js';
import { EvaluationCards } from './evaluation-cards.js';

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Show loading state
    console.log('Loading BibleBench dashboard...');

    // Load data
    const data = await loadDashboardData();
    console.log('Data loaded successfully:', data.metadata);

    // Populate stats bar
    populateStats(data.metadata);

    // Initialize components
    const chartManager = new ChartManager(data);
    const evaluationCards = new EvaluationCards(data);
    const filterManager = new FilterManager(data, chartManager);

    // Connect managers for cross-communication
    chartManager.setFilterManager(filterManager);

    // Render initial state (all models selected)
    const allModelIds = data.models.map(m => m.id);
    chartManager.renderAll(allModelIds);
    evaluationCards.renderAll();

    console.log('Dashboard initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize dashboard:', error);
    showError(error.message);
  }
});

/**
 * Populate stats bar with metadata
 */
function populateStats(metadata) {
  const statModels = document.getElementById('stat-models');
  const statEvaluations = document.getElementById('stat-evaluations');
  const statTestCases = document.getElementById('stat-test-cases');
  const statOverallScore = document.getElementById('stat-overall-score');

  if (statModels) {
    statModels.textContent = metadata.totalModels;
  }

  if (statEvaluations) {
    statEvaluations.textContent = metadata.totalEvaluations;
  }

  if (statTestCases) {
    statTestCases.textContent = metadata.totalTestCases;
  }

  if (statOverallScore) {
    const percentage = (metadata.overallBenchmarkScore * 100).toFixed(1);
    statOverallScore.textContent = `${percentage}%`;
  }
}

/**
 * Show error message to user
 */
function showError(message) {
  const mainContent = document.querySelector('.main-content');

  if (mainContent) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'chart-error';
    errorDiv.style.minHeight = '400px';
    errorDiv.style.display = 'flex';
    errorDiv.style.flexDirection = 'column';
    errorDiv.style.alignItems = 'center';
    errorDiv.style.justifyContent = 'center';

    const errorIcon = document.createElement('div');
    errorIcon.className = 'chart-error-icon';
    errorIcon.textContent = '⚠️';

    const errorMessage = document.createElement('div');
    errorMessage.className = 'chart-error-message';
    errorMessage.textContent = message;

    errorDiv.appendChild(errorIcon);
    errorDiv.appendChild(errorMessage);

    mainContent.textContent = '';
    mainContent.appendChild(errorDiv);
  }
}
