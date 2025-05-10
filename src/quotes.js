// @ts-check
import yahooFinance from 'yahoo-finance2';

/**
 * @typedef {Object} PricesWithDate
 * @property {Record<string, number>} prices - Map of ticker → closing price
 * @property {string | null} date - Date of the last quote
 */

/**
 * Get unique closing prices for the given assets
 * @param {Array<{ ticker: string, type: string }>} assets
 * @param {string} date - Target date in 'YYYY-MM-DD' format
 * @returns {Promise<PricesWithDate>} Object containing prices and date
 */
export async function getClosingPrices(assets, date) {
  const targetDate = new Date(date);

  // Build list of unique tickers excluding "Cash"
  const symbols = [...new Set(
    assets
    .filter(a => a.ticker !== 'Cash')
    .map(a => a.ticker)
  )];

  const startDate = new Date(targetDate);
  startDate.setDate(targetDate.getDate() - 5); // Fetch data for the previous 4 days

  const endDate = new Date(targetDate);
  endDate.setDate(targetDate.getDate() + 1);

  const formattedTargetDate = targetDate.toISOString().split('T')[0];
  const queryOptions = {
    period1: startDate.toISOString().split('T')[0],
    period2: endDate.toISOString().split('T')[0],
    interval: '1d', // Corrected to match the expected literal type
  };

  const pricesWithDate = { prices: {}, date: null };

  try {
    const results = await Promise.all(
      symbols.map(sym => yahooFinance.chart(sym, queryOptions))
    );

    symbols.forEach((symbol, i) => {
      const quotes = results[i]?.quotes;

      if (quotes && quotes.length > 0) {
        const lastQuote = quotes[quotes.length - 1]; // Use the last element of the quotes array

        if (lastQuote && lastQuote.close !== undefined) {
          pricesWithDate.prices[symbol] = lastQuote.close;
          if (!pricesWithDate.date) {
            pricesWithDate.date = lastQuote.date; // Extract date from one symbol
          }
        } else {
          console.warn(`No close price found in the last quote for ${symbol}`);
        }
      } else {
        console.warn(`No quotes found for ${symbol} on ${formattedTargetDate}`);
      }
    });

    // Add 'Cash' at fixed price $1
    if (assets.some(a => a.ticker === 'Cash')) {
      pricesWithDate.prices['Cash'] = 1;
    }

    return pricesWithDate;
  } catch (err) {
    console.error('Error fetching prices:', err);
    throw err;
  }
}
