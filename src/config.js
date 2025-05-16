import { readFile } from 'fs/promises'
import path from 'path'

/**
 * @typedef {Object} Asset
 * @property {string} ticker - The ticker symbol for the asset.
 * @property {string} type - The type/category of the asset (e.g., stock, bond).
 * @property {string} account - The account associated with the asset.
 * @property {number} qty - The quantity of the asset.
 * @property {string|null} [msSymbol] - The Microsoft Finance symbol for the asset (optional).
 */

/**
 * @typedef {Object} Config
 * @property {{min: number, max: number}} threshold - The threshold configuration with minimum and maximum values.
 * @property {Asset[]} assets - An array of assets in the portfolio.
 */

/**
 * Load and validate the portfolio config JSON
 * @returns {Promise<Config>}
 */
export async function loadPortfolioConfig () {
  const configPath = path.resolve('data', 'portfolio.json')

  let raw
  try {
    raw = await readFile(configPath, 'utf-8')
  } catch (err) {
    throw new Error(`Failed to read portfolio config: ${err.message}`)
  }

  let config
  try {
    config = JSON.parse(raw)
  } catch (err) {
    throw new Error(`Invalid JSON in portfolio file: ${err.message}`)
  }

  if (!config.threshold || typeof config.threshold.min !== 'number' || typeof config.threshold.max !== 'number') {
    throw new Error('Invalid or missing threshold configuration.')
  }

  if (!Array.isArray(config.assets)) {
    throw new Error('Assets must be an array.')
  }

  for (const asset of config.assets) {
    if (
      typeof asset.ticker !== 'string' ||
      typeof asset.type !== 'string' ||
      typeof asset.account !== 'string' ||
      typeof asset.qty !== 'number' ||
      (asset.msSymbol !== undefined && asset.msSymbol !== null && typeof asset.msSymbol !== 'string')
    ) {
      throw new Error(`Invalid asset entry: ${JSON.stringify(asset)}`)
    }
  }

  return config
}
