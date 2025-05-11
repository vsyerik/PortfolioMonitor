# 📈 Portfolio Monitor
> 🛡️ This repo includes sample config and setup scripts. Do not commit personal portfolio data.

A lightweight tool to monitor your investment portfolio and alert you when its total value crosses defined thresholds.

Built with [Bun](https://bun.sh), uses [`yahoo-finance2`](https://github.com/gadicc/node-yahoo-finance2) for market data, and stores historical logs in a local SQLite database.

---

## 🚀 Features

- Monitors portfolio from a simple JSON config
- Fetches last market close prices (stocks, bonds, cash)
- Computes total portfolio value
- Logs value daily to SQLite
- Alerts when total is below or above defined thresholds
- Runs automatically (via `cron`) on selected weekdays

---

## 📁 Project Structure

```
portfolio-monitor/
├── data/                   # Portfolio config (JSON)
├── db/                     # SQLite DB file
├── logs/                   # Output logs
├── scripts/                # Setup and deployment scripts
├── src/                    # App logic
│   ├── config.js
│   ├── quotes.js
│   ├── valueCalculator.js
│   ├── thresholdChecker.js
│   ├── dbLogger.js
│   ├── notifier.js
│   └── index.js
├── bunfig.toml
├── package.json
└── README.md
```

---

## 📄 Config: `data/portfolio.json`

```json
{
  "threshold": {
    "min": 1000000,
    "max": 1500000
  },
  "assets": [
    {
      "ticker": "QQQ",
      "type": "stock",
      "account": "Fidelity V",
      "qty": 100
    },
    {
      "ticker": "Cash",
      "type": "cash",
      "account": "HSA",
      "qty": 20000
    }
  ]
}
```

Supported asset types: `"stock"`, `"bond"`, `"cash"`  
The ticker `"Cash"` is treated as $1.00 per unit.

### Personal Deployment Notes

To keep your personal config private:

- Copy `data/portfolio.json` to `portfolio.local.json` and use that in production
- Use `scripts/first-deploy.sh` for real paths/user, but commit only `first-deploy.example.sh`
---

## 🛠️ First-Time Deployment

> These steps should be run on the target machine (e.g. a Raspberry Pi).

### 1. Copy the project to the machine

```bash
scp -r portfolio-monitor user@hostname:~/Apps/PortfolioMonitor
```

### 2. SSH into the machine

```bash
ssh user@hostname
```

### 3. Run the first-deploy script

```bash
cd ~/Apps/PortfolioMonitor/scripts
chmod +x first-deploy.sh
./first-deploy.sh
```

This will:
- Install [Bun](https://bun.sh)
- Install dependencies
- Set the timezone to CT
- Run the monitor once
- Set up a `cron` job to run:
  ```
  Tue–Sat @ 6:00 AM Central Time
  ```

### 4. Manual cron setup

Make sure to execute in the deployed directory:
```bush
chmod +x run.sh
```

Set your Raspberry Pi timezone to CT (if not already)
```bush
sudo timedatectl set-timezone America/Chicago 
```

Edit your crontab
```bush
crontab -e
```

Add this line at the bottom:
```bash
0 6 * * 2-6 /home/{user}/Apps/PortfolioMonitor/run.sh
```
Explanation:

•	0 6 → 6:00 AM

•	* * → every month/day

•	2-6 → Tuesday (2) to Saturday (6)

•	run.sh → already handles logging and execution


---

## 🧪 Manual Run

```bash
bun run src/index.js
```

Use this for debugging or dry-runs before the scheduled job runs.

---

## 🧱 Database Structure: `portfolio_value_log`

| Column           | Type     | Description                     |
|------------------|----------|---------------------------------|
| `date`           | INTEGER  | Trading date                    |
| `day`            | TEXT     | Trading date (YYYY-MM-DD)       |
| `datePeriod`     | TEXT     | Period flag (e.g. `'D'`)        |
| `portfolioValue` | INTEGER  | Rounded USD value               |
| `threshold`      | TEXT     | `'ok'`, `'below'`, or `'above'` |
| `notes`          | TEXT     | Optional comment                |

---

## 📬 Alerts

Alerts are now implemented in `src/notifier.js` using `nodemailer`. When the portfolio value crosses the defined thresholds, an email notification is sent.

### Email Configuration

The email settings are defined in `config/email.local.json`. Ensure the following fields are correctly set:

```json
{
  "host": "smtp.gmail.com",
  "port": 465,
  "secure": true,
  "auth": {
    "user": "your-email@gmail.com",
    "pass": "your-email-password"
  },
  "to": "recipient-email@example.com"
}
```

### How It Works

- The `notifier.js` module sends an email with the portfolio value, threshold status, and date.

- Ensure the email.local.json file is correctly configured and deployed to the target machine.

### Testing Alerts

To test the alert system, manually run the script:

```bash
bun run ./__tests__/notifier.test.js
```

Check the logs and verify that an email is sent when thresholds are crossed.

---

## 🧩 Extending It

- Add per-asset thresholds
- Weekly/Monthly summaries
- Charts or CSV exports
- Web interface for browsing logs

---

## 🙏 Acknowledgments

This project was made possible with the quiet support of my small, focused team:

•	Mira – my engineering partner and co-pilot (ChatGPT) who helped me think clearly and code calmly.

•	Leo – my code executor (GitHub Copilot + JetBrains Junie) who turned plans into working code at lightning speed.

Thanks to both for making it a joy to build something intentional, clean, and useful. 🙂

## 📖 License

This is a personal-use tool. MIT or private license, depending on use.
