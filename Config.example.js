/**
 * ============================================
 * Leave Alert System - Configuration Example
 * ============================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file and rename it to: Config.js
 * 2. Update EMPLOYEES with your team members
 * 3. Update TEAMS with your team structure
 * 4. Add MANUAL_LEAVES as needed
 * 5. Do NOT commit Config.js to GitHub (it's in .gitignore)
 */

// ============================================
// MANUAL ALERT TRIGGERS (For Testing)
// ============================================
// Change these dates to test with specific dates ('yyyy-MM-dd')

// REMINDER: Change this date and run sendManualLeaveReminder()
const MANUAL_REMINDER_DATE = '2025-07-26';

// NOTIFICATION: Change this date and run sendManualLeaveNotification()
const MANUAL_NOTIFICATION_DATE = '2025-07-26';

// ============================================
// EMPLOYEES & INTERNS
// ============================================
// Employee IDs must match OrangeHRM (e.g., '0005')
// Intern IDs start with 'I' (e.g., 'I001')

const EMPLOYEES = {
  // Example Employees
  '0001': { name: 'John Doe', email: 'john.doe@company.com' },
  '0002': { name: 'Jane Smith', email: 'jane.smith@company.com' },
  '0003': { name: 'Bob Wilson', email: 'bob.wilson@company.com' },
  
  // Example Interns
  'I001': { name: 'Intern One', email: 'intern1@company.com' },
  'I002': { name: 'Intern Two', email: 'intern2@company.com' }
};

// ============================================
// TEAMS
// ============================================

const TEAMS = [
  {
    teamName: 'Development Team',
    members: ['0001', '0002', 'I001', 'I002']
  },
  {
    teamName: 'Design Team',
    members: ['0002', '0003', 'I002']
  },
  {
    teamName: 'Management Team',
    members: ['0001', '0002', '0003']
  }
];

// ============================================
// MANUAL LEAVES
// ============================================
// For employees/interns not in OrangeHRM or special cases (automatically included in daily emails)
// Types: full (No 'type' needed [default]) | 'morning' | 'afternoon' | 'time' (with startTime/endTime)
// Date: 'yyyy-MM-dd' | Time: 24-hour ('13:00') | Half day/time: single day only

const MANUAL_LEAVES = [
  // Examples (uncomment and modify as needed):
  // { employeeId: 'I001', fromDate: '2025-07-26', toDate: '2025-07-26' },  // Full day
  // { employeeId: 'I002', fromDate: '2025-07-26', toDate: '2025-07-29' },  // Multiple days
  // { employeeId: '0001', fromDate: '2025-07-26', toDate: '2025-07-26', type: 'morning' },  // Half day morning
  // { employeeId: '0002', fromDate: '2025-07-26', toDate: '2025-07-26', type: 'afternoon' },  // Half day afternoon
  // { employeeId: 'I001', fromDate: '2025-07-26', toDate: '2025-07-26', type: 'time', startTime: '13:00', endTime: '17:00' }  // Specific time
];