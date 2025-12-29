/**
 * LONGWApps Leave Alert System using OrangeHRM
 * 
 * Setup:
 * 1. Project Settings → Script Properties:
 *    - HRM_USERNAME: your username
 *    - HRM_PASSWORD: your password
 * 2. Update Config.js with employee and team data
 * 3. Set daily trigger for sendDailyLeaveReminder
 * 4. For manual testing, change MANUAL_REMINDER_DATE in Config.js and run sendManualLeaveReminder
 */

const BASE_URL = 'https://www.longwapps.com/hrm/web';

/**
 * Manual Leave Reminder - Run this manually
 * Uses date from MANUAL_REMINDER_DATE in Config.js
 */
function sendManualLeaveReminder() {
  if (typeof MANUAL_REMINDER_DATE === 'undefined' || !MANUAL_REMINDER_DATE) {
    Logger.log('Please set MANUAL_REMINDER_DATE in Config.js (format: yyyy-MM-dd)');
    return;
  }
  Logger.log('Manual Leave Reminder trigger: ' + MANUAL_REMINDER_DATE);
  sendLeaveReminder(MANUAL_REMINDER_DATE);
}

/**
 * Manual Leave Notification - Run this manually
 * Uses date from MANUAL_NOTIFICATION_DATE in Config.js
 */
function sendManualLeaveNotification() {
  if (typeof MANUAL_NOTIFICATION_DATE === 'undefined' || !MANUAL_NOTIFICATION_DATE) {
    Logger.log('Please set MANUAL_NOTIFICATION_DATE in Config.js (format: yyyy-MM-dd)');
    return;
  }
  Logger.log('Manual Leave Notification trigger: ' + MANUAL_NOTIFICATION_DATE);
  sendLeaveNotification(MANUAL_NOTIFICATION_DATE, [2, 3]);
}

/**
 * System Test - validates configuration, credentials, and authentication
 */
function testSystem() {
  Logger.log('===== LEAVE ALERT SYSTEM TEST =====');
  Logger.log('');
  
  let allTestsPassed = true;
  
  // Test 1: Script Properties (Credentials)
  Logger.log('TEST 1: Script Properties');
  const username = PropertiesService.getScriptProperties().getProperty('HRM_USERNAME');
  const password = PropertiesService.getScriptProperties().getProperty('HRM_PASSWORD');
  
  if (username && password) {
    Logger.log('✓ HRM_USERNAME: Set');
    Logger.log('✓ HRM_PASSWORD: Set');
  } else {
    Logger.log('✗ FAILED: Missing credentials in Script Properties');
    if (!username) Logger.log('  - HRM_USERNAME not set');
    if (!password) Logger.log('  - HRM_PASSWORD not set');
    allTestsPassed = false;
  }
  Logger.log('');
  
  // Test 2: Configuration Data
  Logger.log('TEST 2: Configuration Data');
  Logger.log('Total Employees: ' + Object.keys(EMPLOYEES).length);
  Logger.log('Total Teams: ' + TEAMS.length);
  
  TEAMS.forEach(function(team) {
    Logger.log('  Team: ' + team.teamName + ' (' + team.members.length + ' members)');
  });
  Logger.log('');
  
  // Test 3: Configuration Validation
  Logger.log('TEST 3: Configuration Validation');
  let configErrors = false;
  
  TEAMS.forEach(function(team) {
    team.members.forEach(function(personId) {
      if (!EMPLOYEES[personId]) {
        Logger.log('✗ ERROR: Employee ID "' + personId + '" in team "' + team.teamName + '" not found in EMPLOYEES');
        configErrors = true;
      }
    });
  });
  
  if (!configErrors) {
    Logger.log('✓ All team members exist in EMPLOYEES');
  } else {
    allTestsPassed = false;
  }
  Logger.log('');
  
  // Test 4: Authentication
  if (username && password) {
    Logger.log('TEST 4: Authentication');
    const sessionCookie = authenticateUser(username, password);
    
    if (sessionCookie) {
      Logger.log('✓ Authentication successful');
    } else {
      Logger.log('✗ FAILED: Authentication failed');
      allTestsPassed = false;
    }
    Logger.log('');
  }
  
  // Final Result
  if (allTestsPassed) {
    Logger.log('==== ✓ ALL TESTS PASSED ====');
  } else {
    Logger.log('===== ✗ SOME TESTS FAILED =====');
  }
}

/**
 * Daily Leave Reminder - Sends reminder for today's leaves
 */
function sendDailyLeaveReminder() {
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  sendLeaveReminder(today);
}

/**
 * Daily Leave Notification - Sends notification for leaves starting tomorrow
 */
function sendDailyLeaveNotification() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = Utilities.formatDate(tomorrow, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  sendLeaveNotification(tomorrowDate, [2]);
}

/**
 * Authenticate user and return session cookie
 * Handles complete authentication flow: token fetch, login, and session validation
 */
function authenticateUser(username, password) {
  try {
    // Helper function to extract cookie from response headers
    function extractCookie(headers) {
      if (headers['Set-Cookie'] || headers['set-cookie']) {
        const setCookie = headers['Set-Cookie'] || headers['set-cookie'];
        const cookieMatch = setCookie.match(/orangehrm=([^;]+)/);
        if (cookieMatch && cookieMatch[1]) {
          return cookieMatch[1];
        }
      }
      return null;
    }
    
    // Get login token and initial cookie
    const loginPageResponse = UrlFetchApp.fetch(BASE_URL + '/auth/login', {
      method: 'get',
      followRedirects: false,
      muteHttpExceptions: true
    });
    
    const html = loginPageResponse.getContentText();
    const initialCookie = extractCookie(loginPageResponse.getAllHeaders());
    
    const tokenMatch = html.match(/:token="&quot;([^"]+)&quot;"/);
    const token = tokenMatch ? tokenMatch[1] : null;
    
    if (!token) {
      Logger.log('Failed to get login token');
      return null;
    }
    
    // Login and validate credentials
    const loginOptions = {
      method: 'post',
      payload: {
        '_token': token,
        'username': username,
        'password': password
      },
      followRedirects: false,
      muteHttpExceptions: true
    };
    
    if (initialCookie) {
      loginOptions.headers = { 'Cookie': 'orangehrm=' + initialCookie };
    }
    
    const loginResponse = UrlFetchApp.fetch(BASE_URL + '/auth/validate', loginOptions);
    
    if (loginResponse.getResponseCode() !== 302) {
      Logger.log('Login validation failed');
      return null;
    }
    
    // Extract session cookie from login response
    let sessionCookie = extractCookie(loginResponse.getAllHeaders());
    if (!sessionCookie) {
      Logger.log('Failed to get session cookie from login');
      return null;
    }
    
    // Access dashboard to finalize session
    const dashboardResponse = UrlFetchApp.fetch(BASE_URL + '/dashboard/index', {
      method: 'get',
      headers: {
        'Cookie': 'orangehrm=' + sessionCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      followRedirects: true,
      muteHttpExceptions: true
    });
    
    if (dashboardResponse.getResponseCode() !== 200) {
      Logger.log('Dashboard access failed');
      return null;
    }
    
    // Update session cookie if refreshed
    const updatedCookie = extractCookie(dashboardResponse.getAllHeaders());
    if (updatedCookie) {
      sessionCookie = updatedCookie;
    }
    
    Logger.log('Authentication successful');
    return sessionCookie;
    
  } catch (error) {
    Logger.log('Error in authentication: ' + error.toString());
    return null;
  }
}

/**
 * Core reminder function - Send leave reminder for a specific date
 */
function sendLeaveReminder(dateString) {
  try {
    Logger.log('Starting leave reminder for: ' + dateString);
    
    const username = PropertiesService.getScriptProperties().getProperty('HRM_USERNAME');
    const password = PropertiesService.getScriptProperties().getProperty('HRM_PASSWORD');
    
    if (!username || !password) {
      Logger.log('ERROR: Username or password not found in Script Properties');
      return;
    }
    
    // Authenticate and get session cookie
    const sessionCookie = authenticateUser(username, password);
    if (!sessionCookie) {
      Logger.log('ERROR: Authentication failed');
      return;
    }
    
    // Fetch leave data for the specific date
    const leaveData = fetchLeaveRequests(sessionCookie, {
      fromDate: dateString,
      toDate: dateString,
      statuses: [2, 3]  // 2 = Scheduled, 3 = Taken
    });
    
    if (!leaveData || !leaveData.data) {
      Logger.log('ERROR: Failed to fetch leave data');
      return;
    }
    
    // Filter leaves that actually fall on the target date
    const leavesForDate = leaveData.data.filter(function(leave) {
      const fromDate = leave.dates.fromDate;
      const toDate = leave.dates.toDate || fromDate;
      return dateString >= fromDate && dateString <= toDate;
    });
    
    if (leavesForDate.length === 0) {
      Logger.log('No employees on leave on ' + dateString);
      return;
    }
    
    dispatchLeaveEmails(leavesForDate, dateString, 'reminder');
    Logger.log('Success! Reminder emails sent to team members about ' + leavesForDate.length + ' employee(s) on leave');
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
  }
}

/**
 * Core notification function - Send leave notification for leaves starting on a specific date
 */
function sendLeaveNotification(startDate, statuses) {
  try {
    statuses = statuses || [2];
    Logger.log('Starting Leave Notification for leaves starting on: ' + startDate);
    
    const username = PropertiesService.getScriptProperties().getProperty('HRM_USERNAME');
    const password = PropertiesService.getScriptProperties().getProperty('HRM_PASSWORD');
    
    if (!username || !password) {
      Logger.log('ERROR: Username or password not found in Script Properties');
      return;
    }
    
    // Authenticate and get session cookie
    const sessionCookie = authenticateUser(username, password);
    if (!sessionCookie) {
      Logger.log('ERROR: Authentication failed');
      return;
    }
    
    // Fetch all approved leaves starting from the specified date
    const leaveData = fetchLeaveRequests(sessionCookie, {
      fromDate: startDate,
      toDate: startDate,
      statuses: statuses
    });
    
    if (!leaveData || !leaveData.data) {
      Logger.log('ERROR: Failed to fetch leave data');
      return;
    }
    
    // Filter to only include leaves that START on the target date (avoid redundant notifications)
    const leavesStartingOnDate = leaveData.data.filter(function(leave) {
      return leave.dates.fromDate === startDate;
    });
    
    if (leavesStartingOnDate.length === 0) {
      Logger.log('No approved leaves starting on ' + startDate);
      return;
    }
    
    dispatchLeaveEmails(leavesStartingOnDate, startDate, 'notification');
    Logger.log('Success! Notification emails sent to team members about ' + leavesStartingOnDate.length + ' upcoming leave(s)');
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
  }
}

/**
 * Fetch leave requests from full API
 * @param {string} sessionCookie - Authenticated session cookie
 * @param {Object} options - Filter options
 * @param {string} options.fromDate - Start date (yyyy-MM-dd)
 * @param {string} options.toDate - End date (yyyy-MM-dd)
 * @param {Array<number>} options.statuses - Leave statuses [2=Scheduled, 3=Taken]
 * @param {number} options.leaveTypeId - Optional: 1=Annual, 2=Casual, 3=Maternity (omit to get all types)
 * @param {number} options.limit - Optional: Default 50
 * @param {number} options.offset - Optional: Default 0
 */
function fetchLeaveRequests(sessionCookie, options) {
  try {
    options = options || {};
    const fromDate = options.fromDate || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const toDate = options.toDate || fromDate;
    const statuses = options.statuses || [2, 3];
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;
    
    Logger.log('Fetching leave requests from ' + fromDate + ' to ' + toDate);

    let apiUrl = BASE_URL + '/api/v2/leave/employees/leave-requests'
      + '?limit=' + limit
      + '&offset=' + offset
      + '&fromDate=' + fromDate
      + '&toDate=' + toDate
      + '&includeEmployees=onlyCurrent';
    
    statuses.forEach(s => apiUrl += '&statuses[]=' + s);

    if (options.leaveTypeId != null) {
      apiUrl += '&leaveTypeId=' + options.leaveTypeId;
    }
    
    Logger.log('API URL: ' + apiUrl);
    
    const apiResponse = UrlFetchApp.fetch(apiUrl, {
      method: 'get',
      headers: {
        'Cookie': 'orangehrm=' + sessionCookie,
        'Accept': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Referer': BASE_URL + '/leave/viewLeaveList',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      muteHttpExceptions: true
    });
    
    if (apiResponse.getResponseCode() !== 200) {
      Logger.log('API call failed: ' + apiResponse.getContentText());
      return null;
    }
    
    Logger.log('Leave requests fetched successfully');
    return JSON.parse(apiResponse.getContentText());
    
  } catch (error) {
    Logger.log('Error fetching leave requests: ' + error.toString());
    return null;
  }
}

/**
 * Process leave data and send emails to relevant team members
 * @param {Array} leaves - Leave data
 * @param {string} dateString - Reference date
 * @param {string} mode - 'reminder' or 'notification'
 */
function dispatchLeaveEmails(leaves, dateString, mode) {
  const emailsToSend = {};
  const isReminder = mode === 'reminder';
  
  // Get list of people on leave
  const employeesOnLeave = leaves.map(function(leave) {
    return leave.employee.employeeId;
  });
  
  Logger.log(isReminder ? 'Employees on leave: ' + employeesOnLeave.join(', ') : 'Employees with upcoming leave: ' + employeesOnLeave.join(', '));
  
  // Process each employee
  leaves.forEach(function(leave) {
    const employeeId = leave.employee.employeeId;
    const employeeName = EMPLOYEES[employeeId] ? EMPLOYEES[employeeId].name : employeeId;
    
    // Find teams this employee belongs to
    const employeeTeams = [];
    TEAMS.forEach(function(team) {
      if (team.members.indexOf(employeeId) !== -1) {
        employeeTeams.push(team.teamName);
        
        // Notify team members based on mode
        team.members.forEach(function(memberId) {
          // Reminder: exclude ALL people on leave | Notification: exclude only THIS person
          const shouldExclude = isReminder 
            ? employeesOnLeave.indexOf(memberId) !== -1 
            : memberId === employeeId;
          
          if (!shouldExclude) {
            const memberInfo = EMPLOYEES[memberId];
            if (memberInfo && memberInfo.email) {
              if (!emailsToSend[memberInfo.email]) {
                emailsToSend[memberInfo.email] = [];
              }
              const alreadyAdded = emailsToSend[memberInfo.email].some(function(item) {
                return item.employee.employeeId === employeeId;
              });
              if (!alreadyAdded) {
                emailsToSend[memberInfo.email].push(leave);
              }
            }
          }
        });
      }
    });
    
    if (employeeTeams.length > 0) {
      Logger.log('Processing: ' + employeeName + ' [' + employeeId + '] (Teams: ' + employeeTeams.join(', ') + ')');
    }
  });
  
  // Send emails
  let emailCount = 0;
  for (let email in emailsToSend) {
    sendLeaveEmail(email, emailsToSend[email], dateString, mode);
    emailCount++;
    Logger.log('Sent to: ' + email + ' (' + emailsToSend[email].length + (isReminder ? ' on leave' : ' upcoming leave(s)') + ')');
  }
  
  Logger.log('Total ' + mode + ' emails sent: ' + emailCount);
}

/**
 * Build and send leave email with both HTML and plain text versions
 * @param {string} toEmail - Recipient email
 * @param {Array} leaves - Array of leave objects
 * @param {string} dateString - Reference date
 * @param {string} mode - 'reminder' for today's leaves, 'notification' for upcoming leaves
 */
function sendLeaveEmail(toEmail, leaves, dateString, mode) {
  mode = mode || 'reminder';
  const isNotification = mode === 'notification';

  // Format date
  const dateObj = new Date(dateString + 'T00:00:00');
  const formattedDate = Utilities.formatDate(
    dateObj,
    Session.getScriptTimeZone(),
    'EEEE, MMMM dd, yyyy'
  );

  // Subject
  const subject = isNotification
    ? 'Notification: Upcoming Team Members on Leave'
    : 'Reminder: Team Members on Leave Today – ' + formattedDate;

  // Prepare leave data
  const formattedLeaves = leaves.map(function (leave) {
    const employeeId = leave.employee.employeeId;

    const name =
      (EMPLOYEES[employeeId] && EMPLOYEES[employeeId].name) ||
      leave.employee.firstName + ' ' +
      (leave.employee.middleName ? leave.employee.middleName + ' ' : '') +
      leave.employee.lastName;

    let duration = null;
    const from = leave.dates.fromDate;
    const to = leave.dates.toDate;
    const type = leave.dates.durationType && leave.dates.durationType.type;

    if (isNotification) {
      if (to && from !== to) {
        const fromDateObj = new Date(from + 'T00:00:00');
        const toDateObj = new Date(to + 'T00:00:00');
        const formattedFrom = Utilities.formatDate(fromDateObj, Session.getScriptTimeZone(), 'MMM dd');
        const formattedTo = Utilities.formatDate(toDateObj, Session.getScriptTimeZone(), 'MMM dd');
        duration = leave.noOfDays + ' day(s): ' + formattedFrom + ' - ' + formattedTo;
      } else if (type === 'half_day_morning') {
        duration = 'Half Day (Morning)';
      } else if (type === 'half_day_afternoon') {
        duration = 'Half Day (Afternoon)';
      } else if (type === 'specify_time') {
        duration = leave.dates.startTime + ' - ' + leave.dates.endTime;
      } else {
        duration = 'Full Day';
      }
    } else {
      if (type === 'half_day_morning') {
        duration = 'Half Day (Morning)';
      } else if (type === 'half_day_afternoon') {
        duration = 'Half Day (Afternoon)';
      } else if (type === 'specify_time') {
        duration = leave.dates.startTime + ' - ' + leave.dates.endTime;
      }
    }

    return {
      name: name,
      type: leave.leaveType && leave.leaveType.name ? leave.leaveType.name : 'Leave',
      duration: duration
    };
  });

  // Build template
  const template = HtmlService.createTemplateFromFile('EmailTemplate');
  template.isNotification = isNotification;
  template.formattedDate = formattedDate;
  template.leaves = formattedLeaves;

  const htmlBody = template.evaluate().getContent();

  // Plain text fallback
  let plainBody =
    (isNotification ? 'Upcoming Team Member Leaves' : "Today’s Team Member Leaves") + '\n' +
    template.title + '\n' +
    formattedDate + '\n\n' +
    (isNotification
      ? 'The following team members will be on leave starting tomorrow:'
      : 'The following team members are on leave today:') + '\n\n';

  formattedLeaves.forEach(function (l) {
    plainBody += '- ' + l.name +
      (isNotification
        ? ' (' + l.type + ' - ' + l.duration + ')'
        : l.duration ? ' - ' + l.duration : '') +
      '\n';
  });

  plainBody +=
    '\n---\nThis is an automated ' +
    (isNotification ? 'notification' : 'reminder') +
    ' email from the Leave Alert System.';

  // Send email
  try {
    MailApp.sendEmail({
      to: toEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody
    });
  } catch (error) {
    Logger.log('Error sending email to ' + toEmail + ': ' + error.toString());
  }
}