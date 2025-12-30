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
        backgroundColor: displayModels.map((m, index) => this.getJewelToneColor(index)),
        borderColor: displayModels.map((m, index) => this.getJewelToneColor(index, 0.9)),
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

    // Special handling for theological orientation diverging bar chart
    if (evaluation.id === 'theological-orientation') {
      this.renderTheologicalOrientationChart(evaluation, selectedModelIds, canvas, ctx);
      return;
    }

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

  renderTheologicalOrientationChart(evaluation, selectedModelIds, canvas, ctx) {
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

    // Transform scores into progressive/conservative percentages
    const progressiveData = modelsWithScores.map(m => (1 - m.score) * 100);
    const conservativeData = modelsWithScores.map(m => m.score * 100);

    const chartData = {
      labels: modelsWithScores.map(m => m.name),
      datasets: [
        {
          label: 'Progressive',
          data: progressiveData,
          backgroundColor: '#6b8caf',
          borderWidth: 0
        },
        {
          label: 'Conservative',
          data: conservativeData,
          backgroundColor: '#a04848',
          borderWidth: 0
        }
      ]
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
            display: true,
            position: 'top',
            labels: {
              boxWidth: 20,
              padding: 15,
              font: {
                size: 12,
                weight: '600'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const model = modelsWithScores[context.dataIndex];
                const progressive = progressiveData[context.dataIndex].toFixed(1);
                const conservative = conservativeData[context.dataIndex].toFixed(1);
                return [
                  `Progressive: ${progressive}%`,
                  `Conservative: ${conservative}%`,
                  `Provider: ${model.provider}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            min: 0,
            max: 100,
            ticks: {
              display: false
            },
            title: {
              display: true,
              text: 'Theological Orientation (Progressive ← → Conservative)'
            }
          },
          y: {
            stacked: true,
            ticks: {
              autoSkip: false
            }
          }
        }
      }
    };

    this.charts[evaluation.id] = new Chart(ctx, config);
  }

  // ===================================================================
  // Utility Functions
  // ===================================================================

  getJewelToneColor(index, opacity = 0.75) {
    const jewelTones = [
      '#8b5a8b',  // Amethyst
      '#0f4c81',  // Sapphire
      '#2d6a4f',  // Emerald
      '#b85450',  // Ruby
      '#c08552',  // Topaz
      '#4a5899',  // Tanzanite
      '#6b8e23',  // Peridot
      '#8b4789',  // Garnet
      '#2c5f6f',  // Aquamarine
      '#b8860b',  // Citrine
      '#4a4e69',  // Iolite
      '#704214',  // Tiger's Eye
      '#5c4742',  // Smoky Quartz
      '#6a5acd',  // Alexandrite
      '#c17817',  // Amber
      '#8fbc8f',  // Jade
      '#483d8b',  // Lapis Lazuli
      '#d2691e',  // Carnelian
      '#556b2f',  // Tourmaline
      '#a0522d'   // Jasper
    ];

    const color = jewelTones[index % jewelTones.length];

    if (opacity === 1) return color;

    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

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
