import fs from 'fs/promises'
import path from 'path'
import nodemailer from 'nodemailer'

/**
 * Send an email alert if the threshold is breached
 * @param {'below' | 'above' | 'ok'} thresholdStatus
 * @param {number} portfolioValue
 * @param {string} date - e.g. '2025-05-10'
 */
export async function notify (thresholdStatus, portfolioValue, date) {
  // Only send notifications for threshold breaches
  if (thresholdStatus === 'ok') return Promise.resolve()

  // Format portfolio value as currency with no decimals and thousand separators
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(portfolioValue)

  // Load email config
  const configPath = path.resolve('config', 'email.json')
  let emailConfig

  try {
    const raw = await fs.readFile(configPath, 'utf-8')
    emailConfig = JSON.parse(raw)
  } catch (err) {
    console.warn('📭 Email config not found — using console alert only.')
    console.log(`[ALERT] Portfolio ${thresholdStatus} threshold on ${date}: $${portfolioValue}`)
    return
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.auth.user,
      pass: emailConfig.auth.pass
    }
  })

  const mailOptions = {
    from: `"Portfolio Monitor" <${emailConfig.auth.user}>`,
    to: emailConfig.to,
    subject: `🚨 Portfolio ${thresholdStatus.toUpperCase()} Threshold Alert`,
    text: `As of ${date}, your portfolio value is $${portfolioValue} — which is ${thresholdStatus} your defined threshold.`
  }

  try {
    // Skip sending email if the recipient is your.email@gmail.com
    if (emailConfig.to === 'your.email@gmail.com') {
      console.log(`⏭️ Skipping email alert to test address (your.email@gmail.com)`)
      return Promise.resolve()
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Email alert sent for ${thresholdStatus} threshold.`)
  } catch (err) {
    console.error('❌ Failed to send email:', err.message)
  }
}
