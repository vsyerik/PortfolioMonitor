/**
 * Value Calculator Module
 *
 * Responsible for computing the total portfolio value based on current prices.
 */

/**
 * Calculates the current value of the portfolio
 * @param {Array<Object>} assets - Array of assets from the configuration
 * @param {Object} prices - Object mapping ticker symbols to their current prices
 * @returns {Object} Portfolio value information including total value, individual asset values, and performance metrics
 */
export function calculatePortfolioValue(assets, prices) {
  // Initialize result object
  const result = {
    timestamp: new Date().toISOString(),
    total: 0,
    assets: [],
    performance: {
      totalGainLoss: 0,
      totalGainLossPercentage: 0
    }
  };

  let totalCost = 0;

  // Calculate value for each asset
  assets.forEach(asset => {
    const { ticker, shares, purchasePrice, name } = asset;
    const currentPrice = prices[ticker];

    // Skip assets with missing prices
    if (currentPrice === null || currentPrice === undefined) {
      result.assets.push({
        ticker,
        name: name || ticker,
        shares,
        purchasePrice,
        currentPrice: null,
        currentValue: null,
        gainLoss: null,
        gainLossPercentage: null,
        error: 'Price data unavailable'
      });
      return;
    }

    // Calculate values
    const cost = shares * purchasePrice;
    const currentValue = shares * currentPrice;
    const gainLoss = currentValue - cost;
    const gainLossPercentage = (gainLoss / cost) * 100;

    // Add to total
    result.total += currentValue;
    totalCost += cost;

    // Add asset details to result
    result.assets.push({
      ticker,
      name: name || ticker,
      shares,
      purchasePrice,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercentage
    });
  });

  // Calculate overall performance
  result.performance.totalGainLoss = result.total - totalCost;
  result.performance.totalGainLossPercentage = totalCost > 0
    ? (result.performance.totalGainLoss / totalCost) * 100
    : 0;

  return result;
}

/**
 * Calculates the daily change in portfolio value
 * @param {Object} currentValue - Current portfolio value information
 * @param {Object} previousValue - Previous portfolio value information
 * @returns {Object} Daily change information
 */
export function calculateDailyChange(currentValue, previousValue) {
  if (!previousValue || !previousValue.total) {
    return {
      change: 0,
      changePercentage: 0,
      noDataAvailable: true
    };
  }

  const change = currentValue.total - previousValue.total;
  const changePercentage = (change / previousValue.total) * 100;

  return {
    change,
    changePercentage,
    noDataAvailable: false
  };
}
