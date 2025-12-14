# OrangeHRM Daily Leave Notification System

Automated email notification system that sends daily leave reports to team members based on OrangeHRM data.

## 📋 Overview


# Push local changes to Google
clasp push

# Pull Google changes to local
clasp pull

# Open script in browser
clasp open-script

# View logs
clasp logs

# Run a function
clasp run functionName

# Auto-push on save
clasp push --watch



This Google Apps Script project automatically:
- Logs into your OrangeHRM system
- Fetches daily leave data
- Sends email notifications to relevant team members
- Ensures people on leave don't receive notifications
- Prevents duplicate emails for people in multiple teams

## 🗂️ Project Structure

### Two Files

1. **Teams.gs** - Data Configuration (Non-technical staff can maintain)
2. **Code.gs** - Processing Logic (Developers only)

### Why Separate Files?

- HR staff can update team members without touching code
- Clear separation between data and logic
- Easier maintenance and troubleshooting

## 📁 Teams.gs - Data Configuration

### EMPLOYEES Object

Maps employee/intern IDs to their information:

```javascript
const EMPLOYEES = {
  // Regular employees (IDs from OrangeHRM)
  '0005': { name: 'Pathum Jayathissa', email: 'pathum@longwapps.com' },
  '0007': { name: 'Chamath Lakmuthu', email: 'chamath@longwapps.com' },
  
  // Interns (custom IDs starting with 'I')
  'I001': { name: 'Intern One', email: 'intern1@longwapps.com' }
};
```

**Rules:**
- Employee IDs must match OrangeHRM exactly (e.g., '0005', '0007')
- Intern IDs must start with 'I' (e.g., 'I001', 'I002')
- Each person needs both `name` and `email`

### TEAMS Array

Defines team structure:

```javascript
const TEAMS = [
  {
    teamName: 'Development Team',
    members: ['0005', '0007', 'I001']  // Mix of employees and interns
  },
  {
    teamName: 'Design Team',
    members: ['0007', '0008', 'I002']
  }
];
```

**Features:**
- Members can be in multiple teams
- Interns and employees in same array
- Simple to add/remove members

## 💻 Code.gs - Processing Logic

### Main Functions

#### `sendDailyLeaveReport()`
Sends leave report for today's date. Use this for daily triggers.

```javascript
// Runs automatically via trigger
sendDailyLeaveReport()
```

#### `sendLeaveReportForDate(dateString)`
Sends leave report for any specific date.

```javascript
// Check specific date
sendLeaveReportForDate('2025-11-25')

// Check yesterday
sendLeaveReportForDate('2025-12-13')
```

#### `testSpecificDate()`
Helper function for testing. Edit the date in the function and run.

```javascript
function testSpecificDate() {
  sendLeaveReportForDate('2025-11-25');  // Change date here
}
```

### Test Functions

#### `testScriptProperties()`
Verifies credentials are set correctly.

```javascript
testScriptProperties()
// Output: Username is set: Yes, Password is set: Yes
```

#### `testTeamConfiguration()`
Validates team configuration.

```javascript
testTeamConfiguration()
// Output: Shows all teams, members, and validates IDs
```

## ⚙️ Setup Instructions

### Step 1: Create Project

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Rename to "OrangeHRM Leave Notifier"

### Step 2: Add Files

1. Replace default `Code.gs` with your main code
2. Click **+** → **Script** → Name it `Teams`
3. Paste Teams.gs code

### Step 3: Configure Credentials

1. Click **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Click **Add script property**
4. Add two properties:
   - Property: `HRM_USERNAME` | Value: your username
   - Property: `HRM_PASSWORD` | Value: your password

### Step 4: Update Teams.gs

1. Open `Teams.gs`
2. Update `EMPLOYEES` with your company's people
3. Update `TEAMS` with your team structure
4. Save

### Step 5: Test

1. Run `testScriptProperties()` to verify credentials
2. Run `testTeamConfiguration()` to verify teams
3. Run `testSpecificDate()` to test with a known date

### Step 6: Set Up Daily Trigger

1. Click **Triggers** (clock icon in left sidebar)
2. Click **Add Trigger**
3. Configure:
   - Function: `sendDailyLeaveReport`
   - Event source: **Time-driven**
   - Type: **Day timer**
   - Time of day: Choose preferred time (e.g., 8am-9am)
4. Click **Save**

## 🔧 How It Works

### Authentication Flow

1. Fetch login page → Extract CSRF token and initial cookie
2. Submit login with credentials → Get session cookie
3. Access dashboard → Validate session
4. Call API with session cookie → Fetch leave data

### Email Distribution Logic

1. **Fetch leave data** from API for specified date
2. **Identify employees on leave** from API response
3. **For each employee on leave:**
   - Find which teams they belong to
   - Get all team members
   - Exclude the person on leave from recipients
   - Add to email queue (avoiding duplicates)
4. **Send consolidated emails** to each recipient

### Why Interns Always Get Emails

Interns are not in the OrangeHRM system, so they never appear in the leave API response. The logic simply excludes people who ARE on leave, which means interns automatically always receive notifications.

### Duplicate Prevention

If someone is in multiple teams and multiple team members are on leave, they receive ONE email listing all relevant team members on leave.

## 📧 Email Format

### Subject
```
Notification of Team Member's Leave - Thursday, November 21, 2024
```

### Body
```
Team Member Leave Notification

Date: Thursday, November 21, 2024

The following team members are on leave:

┌─────────────────────┬──────────────┐
│ Name                │ Duration     │
├─────────────────────┼──────────────┤
│ Pathum Jayathissa   │ Full Day     │
│ Chamath Lakmuthu    │ Half Day     │
└─────────────────────┴──────────────┘

Automated notification from OrangeHRM
```

## 🎯 Key Features

### ✅ Smart Notifications
- People on leave don't receive emails
- No duplicate emails
- Team-based distribution

### ✅ Flexible Date Handling
- Automated daily reports
- Manual date checking
- Historical data retrieval

### ✅ Easy Maintenance
- Non-technical staff can update teams
- Clear separation of concerns
- Built-in validation

### ✅ Name Customization
- Uses names from Teams.gs instead of system names
- Falls back to system names if not configured
- Consistent naming across emails

## 🔍 Troubleshooting

### No emails received

**Check:**
1. Run `testScriptProperties()` - Are credentials set?
2. Run `testTeamConfiguration()` - Any validation errors?
3. Check Execution Log - Any error messages?
4. Verify team members have correct email addresses

### Person didn't receive email

**Possible reasons:**
1. They are on leave (intentional - they shouldn't receive it)
2. Their ID is not in any team's members array
3. Their email in EMPLOYEES is incorrect
4. They are not in the same team as person on leave

### Duplicate emails

This shouldn't happen. If it does:
1. Check execution log for errors
2. Verify EMPLOYEES IDs are unique
3. Contact developer

### Login fails

**Check:**
1. Credentials in Script Properties are correct
2. OrangeHRM URL is accessible
3. No recent password changes
4. Check execution log for specific error

## 📝 Common Tasks

### Add New Employee

1. Open `Teams.gs`
2. Add to EMPLOYEES:
```javascript
'0025': { name: 'New Employee', email: 'new@longwapps.com' }
```
3. Add to relevant team(s):
```javascript
members: ['0005', '0007', '0025']
```
4. Save

### Add New Intern

1. Open `Teams.gs`
2. Choose next intern ID (e.g., 'I003')
3. Add to EMPLOYEES:
```javascript
'I003': { name: 'New Intern', email: 'intern3@longwapps.com' }
```
4. Add to team:
```javascript
members: ['0005', '0007', 'I003']
```
5. Save

### Add New Team

1. Open `Teams.gs`
2. Add to TEAMS array:
```javascript
{
  teamName: 'New Team',
  members: ['0005', '0007', 'I001']
}
```
3. Save

### Update Email Address

1. Open `Teams.gs`
2. Find person in EMPLOYEES
3. Update email field
4. Save

### Check Specific Past Date

1. Open `Code.gs`
2. Find `testSpecificDate()` function
3. Change date:
```javascript
sendLeaveReportForDate('2025-11-15');
```
4. Run `testSpecificDate`

## 🛡️ Security Notes

- Passwords stored in Script Properties (encrypted by Google)
- Session cookies are temporary and cleared after use
- No sensitive data in code files
- Only authorized Google account can access script

## 📊 Execution Log

View logs: **Executions** in left sidebar

**Log entries show:**
- Start time
- Employees on leave
- Teams processing
- Emails sent
- Any errors

## 🔄 Update History

### Version 1.0
- Initial release
- Basic leave notification
- Team-based distribution
- Intern support

## 💡 Tips

1. **Test before deploying** - Use `testSpecificDate()` with known data
2. **Keep Teams.gs updated** - Remove employees who leave company
3. **Monitor execution log** - Check daily for any issues
4. **Validate configuration** - Run `testTeamConfiguration()` after updates
5. **Use meaningful intern IDs** - e.g., 'I001_John' for easier identification

## 📞 Support

For issues or questions:
1. Check execution log for error messages
2. Run test functions to diagnose
3. Verify Teams.gs configuration
4. Contact your development team

## 📄 License

Internal company use only.

---

**Last Updated:** December 2024  
**Maintained By:** Development Team  
**Contact:** dev-team@longwapps.com