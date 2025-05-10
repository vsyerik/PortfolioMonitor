import { getClosingPrices } from './quotes';

/**
 * @param {Array<{ ticker: string, type: string, account: string, qty: number }>} assets
 * @param {Record<string, number>} prices  // map of ticker → price (e.g. from getClosingPrices)
 * @returns {number}  // total value, rounded to nearest dollar
 */
function calculateTotalValue(assets, prices) {
  let totalValue = 0;

  for (const asset of assets) {
    const { ticker, qty } = asset;

    if (prices[ticker] !== undefined) {
      totalValue += qty * prices[ticker];
    } else {
      console.warn(`Price for ticker "${ticker}" is missing. Skipping asset.`);
    }
    // console.log(ticker, qty, prices[ticker], totalValue)
  }

  return Math.round(totalValue);
}

/**
 * Calculate the total portfolio value by fetching the latest prices.
 * @param {Array<{ ticker: string, type: string, account: string, qty: number }>} assets
 * @param {Record<string, number>} prices  // map of ticker → price (e.g. from getClosingPrices)
 * @returns {Promise<number>} Total portfolio value
 */
export async function calculatePortfolioValue(assets, prices) {
  return calculateTotalValue(assets, prices);
}

export { calculateTotalValue };
