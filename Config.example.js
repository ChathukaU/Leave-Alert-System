/**
 * Data Configuration Template
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file and rename it to "Config.js"
 * 2. Replace the example data below with your real employee and team data
 * 3. Never commit Config.js to Git (it's in .gitignore for security)
 * 
 * HOW TO UPDATE:
 * 1. Add/update people in EMPLOYEES
 * 2. Add/update teams in TEAMS
 * 3. For manual Alerts, change the MANUAL_REMINDER_DATE or MANUAL_NOTIFICATION_DATE
 * 4. Save
 * 
 * Employee IDs from OrangeHRM: '0005', '0007', etc.
 * Intern IDs start with 'I': 'I001', 'I002', etc.
 */


// MANUAL Alert Triggers
// Format: 'yyyy-MM-dd' (example: '2025-07-26')

// REMINDER: Change this date and run sendManualLeaveReminder() to send Manual leave Reminder for any date
const MANUAL_REMINDER_DATE = '2025-12-14';

// NOTIFICATION: Change this date and run sendManualLeaveNotification() to send Manual leave Notification for any leaves starting on that day
const MANUAL_NOTIFICATION_DATE = '2025-12-15';

// ============================================
// EMPLOYEES
// ============================================
// All employees and interns
const EMPLOYEES = {
  // Example employees - replace with your real data
  '0001': { name: 'John Doe', email: 'john.doe@company.com' },
  '0002': { name: 'Jane Smith', email: 'jane.smith@company.com' },
  '0003': { name: 'Bob Wilson', email: 'bob.wilson@company.com' },
  '0004': { name: 'Alice Brown', email: 'alice.brown@company.com' },
  
  // Example interns
  'I001': { name: 'Tom Junior', email: 'tom.junior@company.com' },
  'I002': { name: 'Sara Lee', email: 'sara.lee@company.com' }
};

// ============================================
// TEAMS
// ============================================
// Team configuration
const TEAMS = [
  {
    teamName: 'Development Team',
    members: ['0001', '0002', '0003', 'I001']
  },
  {
    teamName: 'Design Team',
    members: ['0002', '0004', 'I002']
  },
  {
    teamName: 'Management Team',
    members: ['0001', '0004']
  }
];
