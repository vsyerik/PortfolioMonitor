import { loadPortfolioConfig } from './config.js';

/**
 * Check if the total value is within, above, or below the threshold.
 * @param {number} totalValue - The total portfolio value
 * @param {object} config - The portfolio configuration
 * @returns {'above' | 'below' | 'ok'} The threshold status
 */
export function checkThreshold(totalValue, config) {
  const { min, max } = config.threshold;

  if (totalValue >= max) {
    return 'above';
  } else if (totalValue <= min) {
    return 'below';
  } else {
    return 'ok';
  }
}