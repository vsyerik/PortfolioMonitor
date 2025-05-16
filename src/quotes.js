import yahooFinance from 'yahoo-finance2';

/**
 * @typedef {Object} Asset
 * @property {string} ticker
 * @property {string} type
 * @property {string|null} [msSymbol]
 */

/**
 * @typedef {Object} PricesWithDate
 * @property {Record<string, number>} prices
 * @property {string|null} date
 */

const formatDate = (date) => date.toISOString().split('T')[0];

/**
 * Collect all unique tickers and msSymbols from assets
 * @param {Asset[]} assets
 * @returns {{tickers: string[], msSymbols: string[]}}
 */
function getAllUniqueSymbols(assets) {
  const tickers = new Set();
  const msSymbols = new Set();
  for (const asset of assets) {
    if (asset.ticker !== 'Cash') tickers.add(asset.ticker);
    if (asset.msSymbol) msSymbols.add(asset.msSymbol);
  }
  return { tickers: Array.from(tickers), msSymbols: Array.from(msSymbols) };
}

/**
 * Fetch all quotes from Yahoo and Morningstar, merge by ticker
 * @param {Asset[]} assets
 * @param {string} date
 * @returns {Promise<PricesWithDate>}
 */
async function getAllQuotes(assets, date) {
  const { tickers, msSymbols } = getAllUniqueSymbols(assets);
  const prices = {};
  let resultDate = null;

  // Map msSymbol to ticker for merging
  const msSymbolToTicker = Object.fromEntries(
    assets.filter(a => a.msSymbol).map(a => [a.msSymbol, a.ticker])
  );

  // Fetch in parallel
  const [yfResults, msResults] = await Promise.all([
    getYahooFinancePrices(tickers.filter(t => !Object.values(msSymbolToTicker).includes(t)), date),
    getMorningstarPrices(msSymbols, msSymbolToTicker)
  ]);

  Object.assign(prices, yfResults.prices, msResults.prices);
  resultDate = msResults.date || yfResults.date;

  return { prices, date: resultDate };
}

/**
 * Main entry: get closing prices for all assets
 * @param {Asset[]} assets
 * @param {string} date
 * @returns {Promise<PricesWithDate>}
 */
export async function getClosingPrices(assets, date) {
  const { prices, date: resultDate } = await getAllQuotes(assets, date);
  if (assets.some(a => a.ticker === 'Cash')) prices['Cash'] = 1;
  return { prices, date: resultDate };
}

/**
 * Get closing prices from Morningstar API for msSymbols
 * @param {string[]} msSymbols
 * @param {Object} msSymbolToTicker
 * @returns {Promise<PricesWithDate>}
 */
async function getMorningstarPrices(msSymbols, msSymbolToTicker) {
  const prices = {};
  let resultDate = null;
  if (msSymbols.length === 0) return { prices, date: null };

  try {
    const securities = msSymbols.join(',');
    const result = await fetch(`https://www.morningstar.com/api/v2/stores/realtime/quotes?securities=${securities}`, {
      headers: { accept: 'application/json, text/plain, */*' },
      method: 'GET'
    });
    const data = await result.json();
    for (const msSymbol of msSymbols) {
      const ticker = msSymbolToTicker[msSymbol];
      const priceObj = data[msSymbol]?.lastPrice;
      if (priceObj && priceObj.value !== undefined) {
        prices[ticker] = priceObj.value;
        if (!resultDate) resultDate = formatDate(new Date());
      }
    }
  } catch (err) {
    console.error('Error fetching prices from Morningstar:', err);
  }
  return { prices, date: resultDate };
}

/**
 * Get closing prices from Yahoo Finance for tickers
 * @param {string[]} tickers
 * @param {string} date
 * @returns {Promise<PricesWithDate>}
 */
async function getYahooFinancePrices(tickers, date) {
  const targetDate = new Date(date);
  const startDate = new Date(targetDate);
  startDate.setDate(targetDate.getDate() - 5);
  const endDate = new Date(targetDate);
  endDate.setDate(targetDate.getDate() + 1);

  const queryOptions = {
    period1: formatDate(startDate),
    period2: formatDate(endDate),
    interval: '1d',
  };

  const prices = {};
  let resultDate = null;

  try {
    const results = await Promise.all(
      tickers.map(sym => yahooFinance.chart(sym, queryOptions))
    );
    for (let i = 0; i < tickers.length; i++) {
      const symbol = tickers[i];
      const quotes = results[i]?.quotes;
      if (quotes && quotes.length > 0) {
        const lastQuote = quotes[quotes.length - 1];
        if (lastQuote && lastQuote.close !== undefined) {
          prices[symbol] = lastQuote.close;
          if (!resultDate) resultDate = lastQuote.date;
        }
      }
    }
  } catch (err) {
    console.error('Error fetching prices from Yahoo Finance:', err);
  }
  return { prices, date: resultDate };
}
