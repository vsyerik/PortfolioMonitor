import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./db/portfolio.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS portfolio_value_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  day TEXT NOT NULL,
  datePeriod TEXT NOT NULL,
  portfolioValue INTEGER NOT NULL,
  threshold TEXT NOT NULL,
  notes TEXT
);`);

/**
 * Logs the portfolio value and threshold status to the database.
 * If an entry for the same day already exists, it will be updated instead of creating a new one.
 * @param {string} date - The date of the log entry.
 * @param {number} portfolioValue - The total portfolio value.
 * @param {'above' | 'below' | 'within'} threshold - The threshold status.
 * @param {string} [notes] - Optional notes to include in the log.
 */
export function logPortfolioValue(date, portfolioValue, threshold, notes = '') {
  const datePeriod = 'd';
  const day = new Date(date).toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD' format

  // First check if an entry with the same day already exists
  const checkQuery = `SELECT id FROM portfolio_value_log WHERE day = ?`;

  db.get(checkQuery, [day], (err, row) => {
    if (err) {
      console.error('Error checking for existing entry:', err);
      return;
    }

    if (row) {
      // Entry exists, update it
      const updateQuery = `UPDATE portfolio_value_log 
                          SET date = ?, datePeriod = ?, portfolioValue = ?, threshold = ?, notes = ? 
                          WHERE day = ?`;

      db.run(updateQuery, [date, datePeriod, portfolioValue, threshold, notes, day], function(err) {
        if (err) {
          console.error('Error updating portfolio value:', err);
        } else {
          console.log('Portfolio value updated for day:', day);
        }
      });
    } else {
      // Entry doesn't exist, insert a new one
      const insertQuery = `INSERT INTO portfolio_value_log (date, day, datePeriod, portfolioValue, threshold, notes) 
                          VALUES (?, ?, ?, ?, ?, ?)`;

      db.run(insertQuery, [date, day, datePeriod, portfolioValue, threshold, notes], function(err) {
        if (err) {
          console.error('Error logging portfolio value:', err);
        } else {
          console.log('Portfolio value logged with ID:', this.lastID);
        }
      });
    }
  });
}
