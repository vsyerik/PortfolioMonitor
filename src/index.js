import { loadPortfolioConfig } from './config.js'
import { getClosingPrices } from './quotes.js'
import { calculatePortfolioValue } from './valueCalculator.js'
import { checkThreshold } from './thresholdChecker.js'
import { logPortfolioValue } from './dbLogger.js'
import { notify } from './notifier.js'

const today = new Date()  // or derive previous trading day
const formatted = today.toISOString().split('T')[0]
// const formatted = '2025-05-08';

const config = await loadPortfolioConfig()
const { prices, date } = await getClosingPrices(config.assets, formatted)

console.log('Prices:', prices)

const totalValue = await calculatePortfolioValue(config.assets, prices)
console.log('Date:', date)
console.log('Total Portfolio Value:', totalValue)

const thresholdStatus = checkThreshold(totalValue, config)
console.log('Threshold Status:', thresholdStatus)

logPortfolioValue(date, totalValue, thresholdStatus)

await notify(thresholdStatus, totalValue, date)
