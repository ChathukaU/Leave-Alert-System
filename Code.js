/**
 * OrangeHRM Daily Leave Report
 * 
 * Setup:
 * 1. Project Settings → Script Properties:
 *    - HRM_USERNAME: your username
 *    - HRM_PASSWORD: your password
 * 2. Update Teams.gs with employee and team data
 * 3. Set daily trigger for sendDailyLeaveReport
 */

const BASE_URL = 'https://www.longwapps.com/hrm/web';

/**
 * Main function - Send today's leave report
 * Set this as daily trigger
 */
function sendDailyLeaveReport() {
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  sendLeaveReportForDate(today);
}

/**
 * Send leave report for a specific date
 * Use this to manually check any date - testSpecificDate funtion
 */
function sendLeaveReportForDate(dateString='2025-12-12') {
  try {
    Logger.log('Starting leave report for: ' + dateString);
    
    const username = PropertiesService.getScriptProperties().getProperty('HRM_USERNAME');
    const password = PropertiesService.getScriptProperties().getProperty('HRM_PASSWORD');
    
    if (!username || !password) {
      Logger.log('ERROR: Username or password not found in Script Properties');
      return;
    }
    
    const token = getLoginToken();
    if (!token) {
      Logger.log('ERROR: Failed to get login token');
      return;
    }
    
    const leaveData = loginAndFetchData(username, password, token, dateString);
    if (!leaveData) {
      Logger.log('ERROR: Failed to fetch leave data');
      return;
    }
    
    if (leaveData.data.length === 0) {
      Logger.log('No employees on leave on ' + dateString);
      return;
    }
    
    processAndSendEmails(leaveData, dateString);
    Logger.log('Success! Emails sent for ' + leaveData.meta.total + ' employees on leave');
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
  }
}

/**
 * Get login token and initial cookie
 */
function getLoginToken() {
  try {
    const response = UrlFetchApp.fetch(BASE_URL + '/auth/login', {
      method: 'get',
      followRedirects: false,
      muteHttpExceptions: true
    });
    
    const html = response.getContentText();
    const headers = response.getAllHeaders();
    
    if (headers['Set-Cookie'] || headers['set-cookie']) {
      const setCookie = headers['Set-Cookie'] || headers['set-cookie'];
      const cookieMatch = setCookie.match(/orangehrm=([^;]+)/);
      
      if (cookieMatch && cookieMatch[1]) {
        PropertiesService.getScriptProperties().setProperty('INITIAL_COOKIE', cookieMatch[1]);
      }
    }
    
    const tokenMatch = html.match(/:token="&quot;([^"]+)&quot;"/);
    return tokenMatch ? tokenMatch[1] : null;
    
  } catch (error) {
    Logger.log('Error getting login token: ' + error.toString());
    return null;
  }
}

/**
 * Login and fetch data for specific date
 */
function loginAndFetchData(username, password, token, dateString) {
  try {
    const initialCookie = PropertiesService.getScriptProperties().getProperty('INITIAL_COOKIE');
    
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
    const loginHeaders = loginResponse.getAllHeaders();
    
    if (loginResponse.getResponseCode() !== 302) {
      Logger.log('Login failed');
      return null;
    }
    
    let sessionCookie = null;
    if (loginHeaders['Set-Cookie'] || loginHeaders['set-cookie']) {
      const setCookie = loginHeaders['Set-Cookie'] || loginHeaders['set-cookie'];
      const cookieMatch = setCookie.match(/orangehrm=([^;]+)/);
      if (cookieMatch && cookieMatch[1]) {
        sessionCookie = cookieMatch[1];
      }
    }
    
    if (!sessionCookie) {
      Logger.log('Failed to get session cookie');
      return null;
    }
    
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
    
    const dashHeaders = dashboardResponse.getAllHeaders();
    if (dashHeaders['Set-Cookie'] || dashHeaders['set-cookie']) {
      const setCookie = dashHeaders['Set-Cookie'] || dashHeaders['set-cookie'];
      const cookieMatch = setCookie.match(/orangehrm=([^;]+)/);
      if (cookieMatch && cookieMatch[1]) {
        sessionCookie = cookieMatch[1];
      }
    }
    
    const apiUrl = BASE_URL + '/api/v2/dashboard/employees/leaves?date=' + dateString;
    
    const apiResponse = UrlFetchApp.fetch(apiUrl, {
      method: 'get',
      headers: {
        'Cookie': 'orangehrm=' + sessionCookie,
        'Accept': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Referer': BASE_URL + '/dashboard/index',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      muteHttpExceptions: true
    });
    
    if (apiResponse.getResponseCode() !== 200) {
      Logger.log('API call failed: ' + apiResponse.getContentText());
      return null;
    }
    
    PropertiesService.getScriptProperties().deleteProperty('INITIAL_COOKIE');
    
    return JSON.parse(apiResponse.getContentText());
    
  } catch (error) {
    Logger.log('Error in login/fetch: ' + error.toString());
    return null;
  }
}

/**
 * Process leave data and send emails to relevant teams
 */
function processAndSendEmails(leaveData, dateString) {
  const emailsToSend = {};
  
  // Get list of people on leave (they won't receive emails)
  const employeesOnLeave = leaveData.data.map(function(leave) {
    return leave.employee.employeeId;
  });
  
  Logger.log('Employees on leave: ' + employeesOnLeave.join(', '));
  
  // Process each employee on leave
  leaveData.data.forEach(function(leave) {
    const employeeId = leave.employee.employeeId;
    const employeeName = leave.employee.firstName + ' ' + 
                        (leave.employee.middleName ? leave.employee.middleName + ' ' : '') + 
                        leave.employee.lastName;
    
    Logger.log('Processing: ' + employeeName + ' (ID: ' + employeeId + ')');
    
    // Find teams this employee belongs to
    TEAMS.forEach(function(team) {
      if (team.members.indexOf(employeeId) !== -1) {
        Logger.log('  Team: ' + team.teamName);
        
        // Notify all team members except those on leave
        team.members.forEach(function(memberId) {
          if (employeesOnLeave.indexOf(memberId) === -1) {
            const email = EMPLOYEES[memberId] ? EMPLOYEES[memberId].email : null;
            if (email) {
              if (!emailsToSend[email]) {
                emailsToSend[email] = [];
              }
              const alreadyAdded = emailsToSend[email].some(function(item) {
                return item.employee.employeeId === employeeId;
              });
              if (!alreadyAdded) {
                emailsToSend[email].push(leave);
              }
            }
          }
        });
      }
    });
  });
  
  // Send emails
  let emailCount = 0;
  for (let email in emailsToSend) {
    sendLeaveNotificationEmail(email, emailsToSend[email], dateString);
    emailCount++;
    Logger.log('Sent to: ' + email + ' (' + emailsToSend[email].length + ' on leave)');
  }
  
  Logger.log('Total emails sent: ' + emailCount);
}

/**
 * Send leave notification email
 */
function sendLeaveNotificationEmail(toEmail, leaves, dateString) {
  const dateObj = new Date(dateString + 'T00:00:00');
  const formattedDate = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'EEEE, MMMM dd, yyyy');
  const subject = 'Notification of Team Member\'s Leave - ' + formattedDate;
  
  let htmlBody = '<html><body style="font-family: Arial, sans-serif;">';
  htmlBody += '<h2 style="color: #FF7B1D;">Team Member Leave Notification</h2>';
  htmlBody += '<p><strong>Date:</strong> ' + formattedDate + '</p>';
  htmlBody += '<p>The following team members are on leave:</p>';
  
  htmlBody += '<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 500px; margin-top: 15px;">';
  htmlBody += '<thead style="background-color: #FF7B1D; color: white;">';
  htmlBody += '<tr><th style="text-align: left;">Name</th><th style="text-align: left;">Duration</th></tr>';
  htmlBody += '</thead><tbody>';
  
  leaves.forEach(function(leave) {
    const employeeId = leave.employee.employeeId;
    // Use name from EMPLOYEES if available, otherwise use system name
    const fullName = EMPLOYEES[employeeId] && EMPLOYEES[employeeId].name ? 
                     EMPLOYEES[employeeId].name :
                     leave.employee.firstName + ' ' + 
                     (leave.employee.middleName ? leave.employee.middleName + ' ' : '') + 
                     leave.employee.lastName;
    
    const duration = leave.duration === 'full_day' ? 'Full Day' : 
                    leave.duration === 'half_day_morning' ? 'Half Day (Morning)' :
                    leave.duration === 'half_day_afternoon' ? 'Half Day (Afternoon)' :
                    leave.duration.replace(/_/g, ' ');
    
    htmlBody += '<tr>';
    htmlBody += '<td>' + fullName + '</td>';
    htmlBody += '<td>' + duration + '</td>';
    htmlBody += '</tr>';
  });
  
  htmlBody += '</tbody></table>';
  htmlBody += '<br><p style="color: #666; font-size: 12px;">Automated notification from OrangeHRM</p>';
  htmlBody += '</body></html>';
  
  let plainBody = 'Team Member Leave Notification - ' + formattedDate + '\n\n';
  plainBody += 'The following team members are on leave:\n\n';
  
  leaves.forEach(function(leave) {
    const employeeId = leave.employee.employeeId;
    // Use name from EMPLOYEES if available, otherwise use system name
    const fullName = EMPLOYEES[employeeId] && EMPLOYEES[employeeId].name ? 
                     EMPLOYEES[employeeId].name :
                     leave.employee.firstName + ' ' + 
                     (leave.employee.middleName ? leave.employee.middleName + ' ' : '') + 
                     leave.employee.lastName;
    
    const duration = leave.duration === 'full_day' ? 'Full Day' : leave.duration.replace(/_/g, ' ');
    plainBody += '- ' + fullName + ' (' + duration + ')\n';
  });
  
  plainBody += '\n---\nAutomated notification from OrangeHRM';
  
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

/**
 * Test configuration
 */
function testTeamConfiguration() {
  Logger.log('=== CONFIGURATION TEST ===');
  Logger.log('Total People: ' + Object.keys(EMPLOYEES).length);
  Logger.log('Total Teams: ' + TEAMS.length);
  Logger.log('');
  
  TEAMS.forEach(function(team) {
    Logger.log('Team: ' + team.teamName);
    Logger.log('  Members: ' + team.members.join(', '));
  });
  Logger.log('');
  
  // Validation
  let hasErrors = false;
  TEAMS.forEach(function(team) {
    team.members.forEach(function(personId) {
      if (!EMPLOYEES[personId]) {
        Logger.log('ERROR: ID "' + personId + '" not found in EMPLOYEES');
        hasErrors = true;
      }
    });
  });
  
  if (!hasErrors) {
    Logger.log('✓ Configuration is valid!');
  }
}

/**
 * Test specific date - modify date here and run this function
 */
function testSpecificDate() {
  sendLeaveReportForDate('2025-12-12');  // Change date here
}

/**
 * Test credentials
 */
function testScriptProperties() {
  const username = PropertiesService.getScriptProperties().getProperty('HRM_USERNAME');
  const password = PropertiesService.getScriptProperties().getProperty('HRM_PASSWORD');
  
  Logger.log('Username is set: ' + (username ? 'Yes' : 'No'));
  Logger.log('Password is set: ' + (password ? 'Yes' : 'No'));
  
  if (username && password) {
    Logger.log('✓ Credentials configured!');
  } else {
    Logger.log('ERROR: Set HRM_USERNAME and HRM_PASSWORD in Script Properties');
  }
}