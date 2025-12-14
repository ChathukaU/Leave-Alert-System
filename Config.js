/**
 * Team Data Configuration
 * 
 * HOW TO UPDATE:
 * 1. Add/update people in EMPLOYEES
 * 2. Add/update teams in TEAMS
 * 3. Save
 * 
 * Employee IDs from OrangeHRM: '0005', '0007', etc.
 * Intern IDs start with 'I': 'I001', 'I002', etc.
 */

// All employees and interns
const EMPLOYEES = {
  // 'XXXX': { name: 'Upul Dissanayake', email: 'upul@longwapps.com' },
  // 'XXXX': { name: 'Usira Kodithuwakku', email: 'usira@longwapps.com' },
  // '0005': { name: 'Pathum Jayathissa', email: 'pathum@longwapps.com' },
  // '0007': { name: 'Chamath Lakmuthu', email: 'chamath@longwapps.com' },
  // '0010': { name: 'Nimesh Madhuwantha', email: 'nimesh@longwapps.com' },
  // '0017': { name: 'Charani Nimesha', email: 'charani@longwapps.com' },
  '0020': { name: 'Chathuka Upamith', email: 'chathuka@longwapps.com' },

  // 'XXXX': { name: 'Dilini Nimeshika', email: 'dilini@longwapps.com' },
  // 'XXXX': { name: 'Nilki Upathissa', email: 'nilki@longwapps.com' },
  // 'XXXX': { name: 'Kavinda Sandalanka', email: 'kavinda@longwapps.com' },
  // 'XXXX': { name: 'Sevindu Nimrod', email: 'sevindu@longwapps.com' },
  // 'XXXX': { name: 'Roshel Rao', email: 'roshel@longwapps.com' },
  // 'XXXX': { name: 'Kavindu Deemantha', email: 'kavindu@longwapps.com' },
  // 'XXXX': { name: 'Pradeep Senevirathne', email: 'pradeep@longwapps.com' },
  // 'XXXX': { name: 'Chandimal Fernando', email: 'chandimal@longwapps.com' },
  // 'XXXX': { name: 'Namidu Harshana', email: 'namidu@longwapps.com' },
  // 'XXXX': { name: 'Madhumini Kodithuwakku', email: 'madhumini@longwapps.com' },
  // 'XXXX': { name: 'Nethmina Bandara', email: 'nethmina@longwapps.com' },
  
  // Interns
  // 'I001': { name: 'Sanduni Hewagama', email: 'hewagamasanduni2@gmail.com' },
  // 'I002': { name: 'Dinesh Priyantha', email: 'dineshpriyantha705@gmail.com' },
  // 'I003': { name: 'Sandaru Nihara', email: 'sandarunihara56@gmail.com' },
  // 'I004': { name: 'Ashan Kavinda', email: 'ashankavindahk@gmail.com' },
  // 'I005': { name: 'Vidumali Dahanayake', email: 'vidumalid@gmail.com' },
  // 'I006': { name: 'Vanuka Daksitha', email: 'vanukad@gmail.com' }
};

// Team configuration
const TEAMS = [
  {
    teamName: 'Galuma Team',
    members: ['0005', '0007', '0020', '0010','0017']
  },
  {
    teamName: 'Design Team',
    members: ['0020', '0005','I002']
  },
  {
    teamName: 'Management Team',
    members: ['0020']
  }
];