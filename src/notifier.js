/**
 * Notifier Module
 *
 * Responsible for handling alerts and sending notifications.
 * This is a stub implementation that logs alerts but could be extended
 * to send emails, SMS, or other notifications.
 */

import { AlertLevel } from './thresholdChecker.js';

/**
 * Sends notifications for alerts
 * @param {Array<Object>} alerts - Array of alerts from thresholdChecker
 * @param {Object} notificationSettings - Notification settings from configuration
 * @returns {Promise<void>}
 */
export async function sendNotifications(alerts, notificationSettings) {
  if (!alerts || alerts.length === 0) {
    return;
  }

  // Filter alerts based on notification settings
  const filteredAlerts = alerts.filter(alert => {
    if (alert.level === AlertLevel.WARNING && !notificationSettings.enableWarnings) {
      return false;
    }
    if (alert.level === AlertLevel.CRITICAL && !notificationSettings.enableCritical) {
      return false;
    }
    return true;
  });

  if (filteredAlerts.length === 0) {
    console.log('Alerts were triggered but notifications are disabled for these alert levels');
    return;
  }

  // Log alerts to console
  console.log('=== PORTFOLIO ALERTS ===');
  filteredAlerts.forEach(alert => {
    console.log(`[${alert.level.toUpperCase()}] ${alert.message}`);
  });

  // In a real implementation, this would send emails, SMS, etc.
  await mockSendEmail(notificationSettings.email, filteredAlerts);
}

/**
 * Mock function to simulate sending an email
 * @param {string} email - Email address to send to
 * @param {Array<Object>} alerts - Array of alerts
 * @returns {Promise<void>}
 */
async function mockSendEmail(email, alerts) {
  if (!email) {
    console.log('No email address configured for notifications');
    return;
  }

  console.log(`Would send email to: ${email}`);
  console.log('Email subject: Portfolio Monitor Alerts');
  console.log('Email body:');
  console.log('---');
  console.log('The following alerts have been triggered for your portfolio:');
  console.log('');

  alerts.forEach(alert => {
    console.log(`- ${alert.message}`);
  });

  console.log('');
  console.log('Please check your portfolio for more details.');
  console.log('---');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('Email notification simulated successfully');
}

/**
 * Formats alerts for different notification channels
 * @param {Array<Object>} alerts - Array of alerts
 * @returns {Object} Formatted alert messages for different channels
 */
export function formatAlerts(alerts) {
  if (!alerts || alerts.length === 0) {
    return {
      subject: 'Portfolio Status: No Alerts',
      plainText: 'Your portfolio is currently not triggering any alerts.',
      html: '<p>Your portfolio is currently not triggering any alerts.</p>'
    };
  }

  // Count alerts by level
  const criticalCount = alerts.filter(a => a.level === AlertLevel.CRITICAL).length;
  const warningCount = alerts.filter(a => a.level === AlertLevel.WARNING).length;

  // Create subject line
  let subject = 'Portfolio Alert: ';
  if (criticalCount > 0) {
    subject += `${criticalCount} Critical, `;
  }
  if (warningCount > 0) {
    subject += `${warningCount} Warning, `;
  }
  subject = subject.slice(0, -2); // Remove trailing comma and space

  // Create plain text message
  let plainText = 'The following alerts have been triggered for your portfolio:\n\n';
  alerts.forEach(alert => {
    plainText += `- [${alert.level.toUpperCase()}] ${alert.message}\n`;
  });
  plainText += '\nPlease check your portfolio for more details.';

  // Create HTML message
  let html = '<h2>Portfolio Alerts</h2>';
  html += '<p>The following alerts have been triggered for your portfolio:</p>';
  html += '<ul>';
  alerts.forEach(alert => {
    const color = alert.level === AlertLevel.CRITICAL ? 'red' : 'orange';
    html += `<li style="color: ${color}"><strong>${alert.level.toUpperCase()}:</strong> ${alert.message}</li>`;
  });
  html += '</ul>';
  html += '<p>Please check your portfolio for more details.</p>';

  return {
    subject,
    plainText,
    html
  };
}
