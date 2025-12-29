/**
 * Data Loader Module
 * Fetches and caches dashboard data
 */

let cachedData = null;

export async function loadDashboardData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('./data/dashboard.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    cachedData = data;
    return data;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    throw new Error('Could not load benchmark data. Please try refreshing the page.');
  }
}

export function clearCache() {
  cachedData = null;
}
