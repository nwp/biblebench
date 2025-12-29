/**
 * Chart Manager Module
 * Handles all Chart.js rendering and updates
 */

export class ChartManager {
  constructor(data) {
    this.data = data;
    this.charts = {};
    this.maxModelsDefault = 15; // Show top 15 by default
    this.showingAllModels = false;
  }

  renderAll(selectedModelIds) {
    this.renderOverallLeaderboard(selectedModelIds);
    this.renderEvaluationCharts(selectedModelIds);
  }

  updateAllCharts(selectedModelIds) {
    // Reset "show all" state when model selection changes
    this.showingAllModels = false;
    this.updateOverallLeaderboard(selectedModelIds);
    this.updateEvaluationCharts(selectedModelIds);
  }

  // ===================================================================
  // Overall Leaderboard
  // ===================================================================

  renderOverallLeaderboard(selectedModelIds) {
    const canvas = document.getElementById('chart-overall-leaderboard');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Get selected models with their overall scores
    const models = this.data.models
      .filter(m => selectedModelIds.includes(m.id))
      .map(m => ({
        id: m.id,
        name: m.displayName,
        score: m.overallScore,
        provider: m.provider
      }))
      .sort((a, b) => b.score - a.score); // Sort by score descending

    // Limit to top N models initially
    const displayModels = this.showingAllModels ? models : models.slice(0, this.maxModelsDefault);

    // Show/hide "Show All" button
    const showAllButton = document.getElementById('show-all-models');
    const leaderboardNote = document.getElementById('leaderboard-note');

    // Only show button if we have more models than the default limit AND we're not showing all yet
    if (models.length > this.maxModelsDefault) {
      if (!this.showingAllModels) {
        // Not showing all - display button
        showAllButton.hidden = false;
        leaderboardNote.textContent = `Showing top ${this.maxModelsDefault} of ${models.length} models`;

        showAllButton.onclick = () => {
          this.showingAllModels = true;
          this.updateOverallLeaderboard(selectedModelIds);
        };
      } else {
        // Showing all - hide button
        showAllButton.hidden = true;
        leaderboardNote.textContent = `Showing all ${models.length} models`;
      }
    } else {
      // Not enough models to need the button - always hide it
      showAllButton.hidden = true;
      leaderboardNote.textContent = '';
    }

    const chartData = {
      labels: displayModels.map(m => m.name),
      datasets: [{
        label: 'Overall Score',
        data: displayModels.map(m => m.score),
        backgroundColor: displayModels.map(m => this.getScoreColor(m.score)),
        borderColor: displayModels.map(m => this.getScoreColor(m.score, 0.8)),
        borderWidth: 1
      }]
    };

    const config = {
      type: 'bar',
      data: chartData,
      options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const model = displayModels[context.dataIndex];
                return [
                  `Score: ${(model.score * 100).toFixed(1)}%`,
                  `Provider: ${model.provider}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            min: 0,
            max: 1,
            ticks: {
              callback: (value) => `${(value * 100).toFixed(0)}%`
            },
            title: {
              display: true,
              text: 'Overall Benchmark Score'
            }
          },
          y: {
            ticks: {
              autoSkip: false
            }
          }
        }
      }
    };

    this.charts['overall-leaderboard'] = new Chart(ctx, config);
  }

  updateOverallLeaderboard(selectedModelIds) {
    if (this.charts['overall-leaderboard']) {
      this.charts['overall-leaderboard'].destroy();
    }
    this.renderOverallLeaderboard(selectedModelIds);
  }

  // ===================================================================
  // Evaluation Charts
  // ===================================================================

  renderEvaluationCharts(selectedModelIds) {
    for (const evaluation of this.data.evaluations) {
      this.renderEvaluationChart(evaluation, selectedModelIds);
    }
  }

  updateEvaluationCharts(selectedModelIds) {
    for (const evaluation of this.data.evaluations) {
      this.updateEvaluationChart(evaluation, selectedModelIds);
    }
  }

  renderEvaluationChart(evaluation, selectedModelIds) {
    const canvas = document.getElementById(`chart-${evaluation.id}`);
    if (!canvas) {
      console.warn(`Canvas not found for evaluation: ${evaluation.id}`);
      return;
    }

    const ctx = canvas.getContext('2d');

    // Get selected models with scores for this evaluation
    const modelsWithScores = this.data.models
      .filter(m => selectedModelIds.includes(m.id))
      .filter(m => evaluation.modelScores[m.id] !== undefined)
      .map(m => ({
        id: m.id,
        name: m.displayName,
        score: evaluation.modelScores[m.id],
        provider: m.provider
      }))
      .sort((a, b) => b.score - a.score); // Sort by score descending

    const chartData = {
      labels: modelsWithScores.map(m => m.name),
      datasets: [{
        label: evaluation.name,
        data: modelsWithScores.map(m => m.score),
        backgroundColor: modelsWithScores.map(m => this.getScoreColor(m.score)),
        borderColor: modelsWithScores.map(m => this.getScoreColor(m.score, 0.8)),
        borderWidth: 1
      }]
    };

    const config = {
      type: 'bar',
      data: chartData,
      options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const model = modelsWithScores[context.dataIndex];
                return [
                  `Score: ${(model.score * 100).toFixed(1)}%`,
                  `Provider: ${model.provider}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            min: 0,
            max: 1,
            ticks: {
              callback: (value) => `${(value * 100).toFixed(0)}%`
            }
          },
          y: {
            ticks: {
              autoSkip: false
            }
          }
        }
      }
    };

    this.charts[evaluation.id] = new Chart(ctx, config);
  }

  updateEvaluationChart(evaluation, selectedModelIds) {
    if (this.charts[evaluation.id]) {
      this.charts[evaluation.id].destroy();
    }
    this.renderEvaluationChart(evaluation, selectedModelIds);
  }

  // ===================================================================
  // Utility Functions
  // ===================================================================

  getScoreColor(score, opacity = 0.7) {
    // Generate color based on score using HSL
    // Green (120) for high scores, Red (0) for low scores
    const hue = score * 120; // 0-120 (red to green)
    const saturation = 70;
    const lightness = 50;

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  }

  getProviderColor(provider) {
    const colors = {
      'OpenAI': '#10a37f',
      'Anthropic': '#d97757',
      'Google': '#4285f4',
      'X.AI': '#1da1f2',
      'Meta': '#0668e1',
      'Mistral': '#f2a359',
      'DeepSeek': '#6366f1',
      'OpenRouter': '#64748b'
    };

    return colors[provider] || '#64748b';
  }
}
