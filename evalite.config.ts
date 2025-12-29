// Evalite configuration
// Caching is enabled by default for faster development
// Use --no-cache flag to disable caching for production runs

export default {
  // Increase timeout for rate-limited free tier models
  // With 3.5s delays between requests + API latency + retries,
  // tests need more than the default 30s timeout
  testTimeout: 600000, // 10 minutes
};
