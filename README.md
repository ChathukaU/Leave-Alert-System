# 📧 Automated Leave Alert System (Google Apps Script + OrangeHRM)

This system connects to an **OrangeHRM HR Manager account**, fetches employee leave data, and automatically sends daily formatted email alerts to team members. It eliminates manual checking, improves visibility, and keeps everyone informed about current and upcoming employee absences.

Powered by **Google Apps Script**, developed in **VS Code**, and version-controlled using **GitHub + clasp**, this project provides a clean and automated workflow for organizations using OrangeHRM.

---

## 👨‍💻 Author
Created by **Chathuka Upamith**

📧 Email: [upamithc@gmail.com](mailto:upamithc@gmail.com)  
💼 LinkedIn: [chathuka-upamith](https://www.linkedin.com/in/chathuka-upamith/)  
🐙 GitHub: [ChathukaU](https://github.com/ChathukaU)



---

## 📋 What This Does

- 🔄 **Fetches leave data** from OrangeHRM API daily
- 📧 **Sends email alerts** to configured recipients
- 👥 **Customizable team configurations** per department/team
- ⏰ **Automated scheduling** via Google Apps Script triggers
- 🎨 **HTML email templates** for professional notifications

---

## 🚀 Quick Start (VS Code + GitHub)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-org/leave-alert-system.git
cd leave-alert-system
````

### 2️⃣ Open the project

```bash
code .
```

### 3️⃣ Install clasp (if not installed)

```bash
npm install -g @google/clasp
```

### 4️⃣ Enable Apps Script API (**REQUIRED**)
1. Go to: https://script.google.com/home/usersettings
2. Enable **Google Apps Script API**

⚠️ **Without this step, clasp will NOT work!**

### 5️⃣ Authenticate

```bash
clasp login
```

### 6️⃣ Link to a Google Apps Script project

**Create new**

```bash
clasp create --type standalone --title "Leave-Alert-System"
```

**Or connect to an existing**

```bash
clasp clone <SCRIPT_ID>
```
*Find your Script ID in the Apps Script editor: Project Settings → Script ID*

### 7️⃣ Configure your settings
```bash
cp Config.example.js Config.js
```
Edit `Config.js` with your credentials and team details.

### 8️⃣ Push code to Google Apps Script
```bash
clasp push
```

### 9️⃣ Open & run the script in browser

**Open the script in your browser:**
```bash
clasp open-script
```

**In the Apps Script web editor:**
1. Select the `sendLeaveAlert` function from the dropdown
2. Click **Run** to test manually
3. Authorize permissions when prompted
4. Set up a **daily trigger**:
   - Click **Triggers** (clock icon in sidebar)
   - **Add Trigger** → Run `sendLeaveAlert`
   - Choose **Time-driven** → **Day timer** → Select time (e.g., 8:00-9:00 AM)

---

## 🛠 Common clasp Commands

| Command                | Purpose                   |
| ---------------------- | ------------------------- |
| `clasp push`           | Push local code → Google  |
| `clasp pull`           | Pull latest code ← Google |
| `clasp open-script`           | Open Apps Script editor   |
| `clasp logs`           | Check execution logs      |
| `clasp run <function>` | Run a function manually   |
| `clasp status`         | Show pending changes      |

---

## 📁 Project Structure

```
├── Code.js                 # Main script logic and leave fetching
├── Config.js               # OrangeHRM credentials & team config (⚠️ SECRET)
├── Config.example.js       # Example configuration template
├── EmailTemplate.html      # HTML email template
├── appsscript.json         # Apps Script project manifest
├── .clasp.json             # Clasp project configuration (⚠️ SECRET)
├── .gitignore              # Excludes sensitive files from Github
├── .claspignore            # Excludes sensitive files from Apps Script
├── README.md               # This file
└── GUIDE.md                # Detailed setup and troubleshooting
```

---

## 🔒 Security

The following files are **excluded from GitHub** to protect sensitive data:

```gitignore
.clasp.json
Config.js
```

**Always use `Config.example.js` as a template** and create your own `Config.js` locally.

---

## ⚙️ Configuration Overview

Edit `Config.js` to set up:
- **OrangeHRM API credentials** (base URL, API token)
- **Email recipients** for alerts
- **Team/employee mappings**
- **Email subject and sender name**

See [GUIDE.md](GUIDE.md) for detailed configuration instructions.

---

## 📧 Email Alerts

The system sends formatted HTML emails with:
- Employees currently on leave
- Leave dates and types
- Upcoming leave notifications
- Custom branding and styling

Customize the template in `EmailTemplate.html`.

---

## 🐛 Troubleshooting

### clasp commands not working?
- Ensure Apps Script API is enabled: https://script.google.com/home/usersettings
- Run `clasp login` to re-authenticate

### Push conflicts?
```bash
clasp pull    # Get latest from Google
# Resolve conflicts manually
clasp push    # Push your changes
```

### Script not running automatically?
- Check **Triggers** in the Apps Script editor
- Review execution logs: `clasp logs` or in the web editor

### Email not sending?
- Verify email addresses in `Config.js`
- Check Gmail sending limits (500 emails/day for standard accounts)
- Review execution logs for errors

For more troubleshooting tips, see [GUIDE.md](GUIDE.md).

---

## 📚 Documentation

- [GUIDE.md](GUIDE.md) – Complete setup, configuration, and troubleshooting
- [Config.example.js](Config.example.js) – Configuration template
- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [clasp Documentation](https://github.com/google/clasp)

---

## 🤝 Contributing

This is an internal tool, but improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

**Internal Company Use Only – Not for Public Distribution**

---

🗓️ **Last Updated:** December 2025  
⭐ **Star this repo** if you find it useful!