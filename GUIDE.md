# 📖 Leave Alert System - Setup Guide

A simple guide to set up and maintain the automated leave notification system.

---

## 🎯 What This System Does

- ✅ Automatically checks OrangeHRM for employees on leave
- ✅ Sends **daily reminder emails** about who's on leave TODAY
- ✅ Sends **advance notification emails** about who's going on leave TOMORROW
- ✅ Only sends emails to team members (people on leave don't get emails)
- ✅ No duplicate emails even if you're in multiple teams

---

## 🚀 Initial Setup (One-Time)

### Step 1: Create the Google Apps Script Project

1. Go to https://script.google.com
2. Click **New Project**
3. Rename it to "Leave Alert System"

### Step 2: Add the Code Files

You need 3 files:

**File 1: Code.js**
1. Delete the default code
2. Paste your `Code.js` content
3. Save (Ctrl+S or Cmd+S)

**File 2: Config.js**
1. Click **+** button → **Script**
2. Name it `Config`
3. Paste your `Config.js` content
4. Save

**File 3: EmailTemplate.html**
1. Click **+** button → **HTML**
2. Name it `EmailTemplate`
3. Paste your email template HTML
4. Save

### Step 3: Add Your OrangeHRM Login Credentials

1. Click **Project Settings** ⚙️ (gear icon on left sidebar)
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Add these two properties:

| Property | Value |
|----------|-------|
| `HRM_USERNAME` | Your OrangeHRM username |
| `HRM_PASSWORD` | Your OrangeHRM password |

⚠️ **Important:** These credentials are encrypted and secure.

### Step 4: Test the System

Before automating, test manually:

1. In the Apps Script editor, select `testSystem` from the function dropdown
2. Click **Run**
3. First time: Click **Review permissions** → Choose your Google account → Allow
4. Check the **Execution log** at the bottom for results

**Expected output:**
```
✓ HRM_USERNAME: Set
✓ HRM_PASSWORD: Set
✓ Authentication successful
✓ ALL TESTS PASSED
```

### Step 5: Set Up Automated Daily Triggers

**For Daily Reminder (Today's Leaves):**
1. Click **Triggers** ⏰ (clock icon on left sidebar)
2. Click **Add Trigger**
3. Configure:
   - Function: `sendDailyLeaveReminder`
   - Event source: **Time-driven**
   - Type: **Day timer**
   - Time: **8:00 AM to 9:00 AM** (or your preferred time)
4. Click **Save**

**For Daily Notification (Tomorrow's Leaves):**
1. Click **Add Trigger** again
2. Configure:
   - Function: `sendDailyLeaveNotification`
   - Event source: **Time-driven**
   - Type: **Day timer**
   - Time: **10:00 AM to 11:00 AM** (or your preferred time)
3. Click **Save**

✅ **Done!** The system will now run automatically every day.

---

## 👥 Managing Teams & Employees

### Update Config.js File

Open `Config.js` in the Apps Script editor to manage your teams.

### Add a New Employee

Find the `EMPLOYEES` section and add a new line:

```javascript
const EMPLOYEES = {
  '0020': { name: 'Chathuka Upamith', email: 'chathuka@longwapps.com' },
  '0025': { name: 'New Employee Name', email: 'new@longwapps.com' },  // Add this
};
```

**Rules:**
- Employee ID must match OrangeHRM (e.g., `'0001'`, `'0020'`)
- Intern IDs start with `'I'` (e.g., `'I001'`, `'I002'`)
- Both `name` and `email` are required

### Add a New Team

Find the `TEAMS` section and add:

```javascript
const TEAMS = [
  {
    teamName: 'Dev Team',
    members: ['0005', '0007', '0020']
  },
  {
    teamName: 'New Team Name',           // Add this
    members: ['0005', '0020', 'I001']    // team block
  }
];
```

### Add Someone to an Existing Team

Just add their ID to the `members` array:

```javascript
{
  teamName: 'Design Team',
  members: ['0020', '0005', 'I002', '0025']  // Added 0025
}
```

**Note:** People can be in multiple teams - they'll still only get ONE email.

### Add a Manual Leave

For employees not in OrangeHRM (interns, contractors), find the `MANUAL_LEAVES` section and add:

```javascript
const MANUAL_LEAVES = [
  // Full day leave (type is optional - default type to full )
  { 
    employeeId: 'I001', 
    fromDate: '2025-07-26', 
    toDate: '2025-07-26'
  },
  
  // Multiple days
  { 
    employeeId: '0005', 
    fromDate: '2025-07-26', 
    toDate: '2025-07-29'
  },
  
  // Half day morning
  { 
    employeeId: 'I002', 
    fromDate: '2025-07-26', 
    toDate: '2025-07-26',
    type: 'morning'
  },
  
  // Half day afternoon
  { 
    employeeId: '0020', 
    fromDate: '2025-07-26', 
    toDate: '2025-07-26',
    type: 'afternoon'
  },
  
  // Specific time
  { 
    employeeId: 'I003', 
    fromDate: '2025-07-26', 
    toDate: '2025-07-26',
    type: 'time',
    startTime: '13:00',
    endTime: '17:00'
  }
];
```

**Rules:**
- Date format: `'YYYY-MM-DD'` (e.g., `'2025-07-26'`)
- Employee ID must exist in `EMPLOYEES`
- Full day: No `type` needed (it's the default)
- Half day/time: Only for single day (fromDate = toDate)
- Time format: 24-hour (e.g., `'13:00'`, `'16:30'`)

**Note:** Manual leaves are automatically included in daily emails alongside OrangeHRM data.

---

## 🧪 Manual Testing

### Test with Today's Date

1. Select function: `sendDailyLeaveReminder`
2. Click **Run**
3. Check execution log

### Test with a Specific Past Date

1. Open `Config.js`
2. Change `MANUAL_REMINDER_DATE`:
   ```javascript
   const MANUAL_REMINDER_DATE = '2025-07-26';  // Change this date
   ```
3. Save
4. Select function: `sendManualLeaveReminder`
5. Click **Run**

### Test Tomorrow's Notification

1. Open `Config.js`
2. Change `MANUAL_NOTIFICATION_DATE`:
   ```javascript
   const MANUAL_NOTIFICATION_DATE = '2025-07-26';
   ```
3. Save
4. Select function: `sendManualLeaveNotification`
5. Click **Run**

---

## 📧 Email Types

### 1. Daily Reminder (Today's Leaves)
- **Sent:** Every morning
- **Subject:** "Reminder: Team Members on Leave Today – [Date]"
- **Shows:** Who is on leave TODAY
- **Format:** Simple list with duration (Full Day, Half Day, etc.)

### 2. Advance Notification (Tomorrow's Leaves)
- **Sent:** Every afternoon
- **Subject:** "Notification: Upcoming Team Members on Leave"
- **Shows:** Who is going on leave TOMORROW
- **Format:** Table with leave type and full duration

---

## 🔍 How It Works

### Who Gets Emails?

✅ **You WILL receive an email if:**
- You are in the same team as someone on leave
- You are NOT on leave yourself

❌ **You WILL NOT receive an email if:**
- You are on leave (you already know!)
- You are not in any team with the person on leave
- Your email is not configured in `Config.js`

### Interns leave 

Interns are typically not in OrangeHRM. Add their leave information using `MANUAL_LEAVES`, and they will be included in team notifications just like regular employees.

---

## 🐛 Troubleshooting

### No Emails Sent

**Check these:**
1. Run `testSystem` - Are credentials working?
2. Check **Execution log** for errors
3. Verify trigger is active in **Triggers** page
4. Confirm email addresses are correct in `Config.js`

### Someone Didn't Get Email

**Possible reasons:**
1. They are on leave (intentional - they shouldn't receive it)
2. Their email is wrong in `Config.js`
3. They are not in the same team as the person on leave
4. Their ID is not in the `EMPLOYEES` list

### Wrong Names in Email

Update the name in `Config.js`:

```javascript
'0020': { name: 'Correct Name Here', email: 'email@company.com' }
```

### Authentication Failed

1. Check Script Properties for correct username/password
2. Try logging into OrangeHRM manually with same credentials
3. Password might have changed - update Script Properties

---

## 📊 View Execution History

1. Click **Executions** 📜 (in left sidebar)
2. See all past runs with timestamps
3. Click any execution to see detailed logs

**What to look for:**
- ✅ "Authentication successful"
- ✅ "Reminder emails sent to team members"
- ❌ Any red errors

---

## 🔒 Security

- Your OrangeHRM password is **encrypted** by Google
- Only you (the Google account owner) can access the script
- No sensitive data is stored in the code files
- Session cookies are temporary and cleared after each run

---

## ✏️ Quick Reference

### Common Tasks

| Task | Where to Go |
|------|-------------|
| Add new employee | Edit `Config.js` → `EMPLOYEES` |
| Add new team | Edit `Config.js` → `TEAMS` |
| Add manual leave | Edit `Config.js` → `MANUAL_LEAVES` |
| Update email | Edit `Config.js` → `EMPLOYEES` |
| Change trigger time | **Triggers** page → Edit trigger |
| Test system | Run `testSystem` function |
| View logs | Click **Executions** in sidebar |
| Check credentials | **Project Settings** → Script Properties |

### Available Functions

| Function | What It Does |
|----------|--------------|
| `testSystem` | Validates setup and credentials |
| `sendDailyLeaveReminder` | Sends today's leave reminder |
| `sendDailyLeaveNotification` | Sends tomorrow's leave notification |
| `sendManualLeaveReminder` | Test with specific date (reminder) |
| `sendManualLeaveNotification` | Test with specific date (notification) |

---

## 💡 Tips

1. **Always test after making changes** - Run `testSystem` to verify
2. **Keep Config.js updated** - Remove people who leave the company
3. **Use meaningful intern IDs** - e.g., `'I001'` for first intern
4. **Check execution log regularly** - Catch issues early
5. **Update credentials if password changes** - In Script Properties
6. **Clean up old manual leaves** - Remove past dates periodically
7. **For full day leaves** - No need to add `type` field (it defaults to full)

---

## 📞 Need Help?

1. Check the **Execution log** for error messages
2. Run `testSystem` to diagnose issues
3. Verify `Config.js` has correct data
4. Contact your IT team or system administrator

---

**Created by:** Chathuka Upamith  
📧 [upamithc@gmail.com](mailto:upamithc@gmail.com)

🗓️ Last Updated: December 2025