# ⚡ Quick Start Guide - Skill Central

## 🚀 Getting Started (2 Minutes)

### 1. **Open the App**
- Open `index.html` in your browser (or serve with `python -m http.server`)
- You'll see the beautiful homepage with a "Get Started" button

### 2. **Sign Up**
- Click **"Sign Up"** button
- Enter email, password, and confirm password
- Click **"Sign Up"**
- ✅ You're now logged in and redirected to the dashboard!

### 3. **Explore Dashboard**
- **Topics**: Browse/create learning topics (empty by default)
- **Files**: Upload and download files
- **Account**: See your progress and stats
- **Settings**: Customize theme, font, accent color

---

## 👨‍💼 Admin Setup (For Content Creation)

### Log In as Admin
```
Email:    ben.steels@outlook.com
Password: fhwe87syu
```

### Create Your First Topic
1. Click **"Admin Panel"** (top right)
2. Scroll to **"Add Topic"**
3. Enter:
   - **Topic Name**: e.g., "Personal Finance"
   - **Description**: e.g., "Money management basics"
   - **Image URL** (optional): Link to topic image
4. Click **"Add Topic"**
5. ✅ Topic appears in topics list!

### Add a Lesson to Topic
1. Click the topic in the topics browser
2. Click a subject (or create one by editing topic)
3. Click **"Add Lesson"** in admin section
4. Enter:
   - **Lesson Title**: e.g., "Creating a Budget"
   - **Content**: Lesson description
   - **Type**: lesson / quiz / flashcard (choose one)
   - **Image URL** (optional): Lesson image
5. Click **"Add Lesson"**
6. ✅ Lesson saved and appears immediately!

---

## ☁️ Cloud Backup with GitHub Gist

### Step 1: Generate GitHub Token
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"**
3. Select scope: **`gist`** ✓
4. Click **"Generate"** and **copy the token**

### Step 2: Save to Admin Panel
1. In dashboard, click **"Admin Panel"**
2. Scroll to **"Gist Backup & Sync"**
3. Paste token into **"GitHub Token"** field
4. Click **"Save Token"**

### Step 3: Backup Topics to Cloud
- Click **"Create Gist from Topics"**
- Copy the **Gist ID** that appears
- ✅ Your topics are now backed up on GitHub!

### Step 4: Restore on Another Device
- On new device, go to admin panel
- Paste Gist ID into **"Load from Gist"** field
- Click **"Load from Gist"**
- ✅ Topics synced from cloud!

---

## 🎨 Customize Appearance

### Change Theme
1. Click **"Settings"** in dashboard
2. Select **Theme**: Auto / Dark / Light
3. Select **Accent Color**: Blue / Green / Purple / Red
4. Select **Font**: Verdana / Arial / Georgia
5. Adjust **Font Size**: 12–24px
6. ✅ Changes apply immediately!

---

## 📊 Track Student Progress

### View Your Progress
1. Click **"Account"** in dashboard
2. See:
   - **Overall Progress**: X of Y lessons completed
   - **Per-Topic Progress**: Breakdown by topic
   - **Per-Subject Progress**: Breakdown by subject
3. Lessons show % complete and individual subject stats

### Mark Lesson Complete
1. Open a lesson
2. Click **"Mark Complete"** button
3. ✅ Lesson marked as done, progress updates automatically!

---

## 📁 File Management

### Upload Files
1. Click **"Files"** in dashboard
2. Click **"Choose File"** and select a file
3. Click **"Upload"**
4. ✅ File appears in your file list

### Download Files
1. In Files section, click **"Download"** on any file
2. ✅ File downloads to your computer

### Delete Files
1. In Files section, click **"Delete"** on any file
2. ✅ File removed instantly

---

## 🔐 Security & Data

### Your Data
- ✅ **All data stored locally** in your browser (localStorage)
- ✅ **No server**: Completely private and offline-capable
- ✅ **No account fees**: Everything is free
- ✅ **Passwords hashed**: Using SHA-256 encryption

### Export/Backup
- Admin can download topics as JSON via **"Gist Backup"** → **"Download as JSON"**
- Import manually by copying JSON into homepage config

### Data Reset
- **Clear all topics**: Admin panel → **"Clear All Topics"** (confirm!)
- **Reset progress**: Account page → **"Reset Progress"** (confirm!)
- Clear browser localStorage manually: DevTools → Application/Storage → Local Storage

---

## 🆘 Troubleshooting

### "Invalid credentials" on login
- Check email spelling
- For admin, use: `ben.steels@outlook.com` / `fhwe87syu`
- Check DevTools Console (F12) for errors

### Topics not showing
- Admin needs to add them first
- Check **"Admin Panel"** → **"Add Topic"**
- Refresh browser (F5)

### Files not uploading
- Check file size (localStorage has ~5-10MB limit)
- Try smaller file or clear old files
- Check browser console for errors

### Gist sync not working
- Verify GitHub PAT is valid and has `gist` scope
- Paste correct Gist ID
- Check internet connection
- Ensure GitHub is not down

### Theme not changing
- Settings saved automatically in localStorage
- Clear cache and reload (Ctrl+Shift+Delete)
- Check DevTools → Application/Storage → Local Storage

---

## 📖 Full Documentation

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** — Complete project overview
- **[AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md)** — Authentication details
- **[SITE_README.md](SITE_README.md)** — Feature summary

---

## ✨ Tips & Tricks

1. **Use Markdown in lesson content** for better formatting
2. **Link images directly** from URLs (no file upload for images yet)
3. **Organize topics by category** (Finance, Cooking, Health, etc.)
4. **Share Gist ID** with other admins for easy sync
5. **Theme is per-browser** — each browser has its own settings
6. **Progress syncs per email** — different emails = different progress

---

## 🎓 Example Workflow

1. **Admin creates "Personal Finance" topic**
   - Adds 3 subjects: Budgeting, Taxes, Credit
   - Adds 5 lessons to Budgeting subject
   - Backs up to GitHub Gist

2. **Users sign up and learn**
   - Browse Personal Finance topic
   - Read lessons and mark complete
   - See progress update in real-time

3. **Admin updates content**
   - Edits lesson content
   - Adds new lessons
   - Re-syncs to Gist

4. **Users check progress**
   - See % complete for Finance topic
   - Track lessons completed
   - Download progress reports (manual export)

---

## 🚀 Ready to Go!

Your Skill Central instance is **fully functional and ready to use**!

- ✅ Secure authentication
- ✅ Admin content management
- ✅ Student progress tracking
- ✅ Cloud backup/sync
- ✅ Beautiful UI with dark/light themes
- ✅ Completely free and self-hosted

**Start creating content and learning now!** 🎉

