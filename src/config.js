import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Load and validate the portfolio config JSON
 * @returns {Promise<{ threshold: { min: number, max: number }, assets: Array<{ ticker: string, type: string, account: string, qty: number }> }>}
 */
export async function loadPortfolioConfig() {
  const configPath = path.resolve('data', 'portfolio.json');

  let raw;
  try {
    raw = await readFile(configPath, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read portfolio config: ${err.message}`);
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in portfolio file: ${err.message}`);
  }

  if (!config.threshold || typeof config.threshold.min !== 'number' || typeof config.threshold.max !== 'number') {
    throw new Error('Invalid or missing threshold configuration.');
  }

  if (!Array.isArray(config.assets)) {
    throw new Error('Assets must be an array.');
  }

  for (const asset of config.assets) {
    if (
      typeof asset.ticker !== 'string' ||
      typeof asset.type !== 'string' ||
      typeof asset.account !== 'string' ||
      typeof asset.qty !== 'number'
    ) {
      throw new Error(`Invalid asset entry: ${JSON.stringify(asset)}`);
    }
  }

  return config;
}
