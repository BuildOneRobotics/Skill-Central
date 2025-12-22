# Skill Central - Project Structure

## Overview
**Skill Central** is a comprehensive life skills educational platform with secure user accounts, admin content management, progress tracking, and GitHub Gist backup/sync capabilities.

---

## 📁 Directory Structure

```
Skill-Central/
├── index.html                    # Public homepage (login/signup page)
├── dashboard.html               # Authenticated app (dashboard + admin panel)
├── AUTH_SETUP_GUIDE.md          # Authentication setup documentation
├── SITE_README.md               # Project information
├── README.md                    # Repository overview
├── LICENSE                      # MIT License
├── assets/
│   ├── script.js               # Main JavaScript logic (~1013 lines)
│   ├── styles.css              # Global CSS with theming (~183 lines)
│   └── topics.json             # Topics data (empty by default, admin-populated)
└── .git/                        # Git repository
```

---

## 🎯 File Descriptions

### **index.html** (Public Homepage)
- **Purpose**: Landing page with signup/login forms
- **Key Sections**:
  - Hero section with CTA "Get Started"
  - Feature cards (3 cards)
  - Auth modals (login + signup forms)
  - Footer with quick links
- **Forms**:
  - `id="login-form"`: Email + Password
  - `id="signup-form"`: Email + Password + Confirm Password
- **Behavior**: Shows public homepage by default; displays auth modal on button click
- **Redirects**: On successful login/signup → `dashboard.html`

### **dashboard.html** (Authenticated App)
- **Purpose**: Main app interface for logged-in users and admins
- **Key Sections**:
  - Header with navigation (Topics, Files, Account, Settings, Admin Panel)
  - Topics browser (left sidebar or grid)
  - Lessons viewer (displays lesson content + completion buttons)
  - Files section (upload/download user files)
  - Account section (progress tracking dashboard)
  - Settings page (theme, font, accent color)
  - Admin panel (only for admins):
    - Add/edit topics
    - Add/edit lessons
    - Homepage JSON editor
    - Gist backup/sync
- **Access**: Requires `currentUser` in localStorage; redirects to `index.html` if not logged in

### **assets/script.js** (Main Logic)
- **Lines**: ~1013
- **Key Functions**:
  - **Auth**: `hashPassword()`, `login()`, `signup()`, `logout()`
  - **UI Routing**: `showHome()`, `showAuth()`, `showApp()`, `showTopics()`, `showFiles()`, `showAccount()`, `showSettings()`
  - **Admin**: `addTopicForm` handler, `addLessonForm` handler, `populateLessonSelects()`
  - **Homepage Config**: `getHomepageConfig()`, `saveHomepageConfig()`, `renderHomepage()`
  - **Gist API**: `createGistFromTopics()`, `loadTopicsFromGist()`
  - **Progress Tracking**: `getProgressState()`, `saveProgressState()`, `markLessonComplete()`, `renderAccount()`
- **Data Storage**: All data stored in localStorage with keys:
  - `users`: Object of email → hashed password
  - `currentUser`: Currently logged-in email
  - `isAdmin`: Boolean (true/false)
  - `topics`: Array of topic objects
  - `homepage`: Homepage config JSON
  - `files_<email>`: User's uploaded files
  - `progress_<email>`: User's lesson completion state
  - `theme`, `accent`, `font`, `fontSize`: User settings

### **assets/styles.css** (Styling)
- **Lines**: ~183
- **CSS Variables** (Dark Theme):
  - `--bg`: #0d1117 (background)
  - `--card`: rgba(255,255,255,0.08) (card background)
  - `--accent`: #4f9ef5 (primary accent color)
  - `--text`: #e6edf3 (text color)
  - `--shadow`: Multi-layer shadow for depth
  - `--radius`: 16px (border radius)
  - `--transition`: Smooth cubic-bezier easing
- **Features**:
  - Dark/light theme toggle
  - Glassmorphism effects (backdrop-filter: blur)
  - Responsive grid layouts
  - Smooth transitions and hover effects
  - Premium Figma-like aesthetic

### **assets/topics.json** (Data)
- **Format**: JSON array of topic objects
- **Structure**:
  ```json
  [
    {
      "name": "Topic Name",
      "description": "Topic description",
      "subjects": [
        {
          "name": "Subject Name",
          "lessons": [
            {
              "title": "Lesson Title",
              "content": "Lesson content",
              "type": "lesson",
              "image": "https://image-url.com/image.jpg"
            }
          ]
        }
      ]
    }
  ]
  ```
- **Default**: Empty array `[]` (admins populate via UI)
- **Persistence**: Loaded from localStorage on first visit; can be synced to GitHub Gist

---

## 🔐 Authentication Flow

### Sign Up
1. User clicks "Sign Up" on `index.html`
2. Enters email, password, confirm password
3. **JavaScript** (line 572):
   - Validates password confirmation
   - Hashes password with SHA-256 using Web Crypto API
   - Stores in localStorage under `users` object
   - Sets `currentUser` and `isAdmin` in localStorage
4. Redirects to `dashboard.html`

### Sign In
1. User clicks "Sign In" (or is prompted on first visit)
2. Enters email and password
3. **JavaScript** (line 561):
  - Admin accounts are configured via the `admins` list (localStorage or imported from a Gist)
   - If not, hashes password and compares against localStorage
   - On match: sets `currentUser` and `isAdmin`, redirects to `dashboard.html`
   - On mismatch: shows alert "Invalid credentials"

### Admin Access
- **Hardcoded admin credential** (line 84-88):
  - Admin credentials are not stored in this repository. Use the admin import feature or the admin UI to configure admin users.
- Admin panel button only appears if `isAdmin === true`

---

## 🛠️ Admin Features

### Add Topics
1. Click **"Admin Panel"** in header
2. Fill **"Add Topic"** form:
   - Topic Name
   - Description
   - Topic Image URL (optional)
3. Click **"Add Topic"** → saves to localStorage
4. Topics appear in topics browser immediately

### Add Lessons
1. Select topic from topics browser
2. Select subject
3. Click **"Add Lesson"** in admin section
4. Fill form:
   - Lesson Title
   - Lesson Content
   - Lesson Type (lesson/quiz/flashcard/etc.)
   - Lesson Image URL (optional)
5. Click **"Add Lesson"** → saves to localStorage

### Edit Homepage
1. In **Admin Panel**, scroll to **"Homepage Editor"**
2. Paste/edit JSON with structure:
   ```json
   {
     "hero": { "title": "...", "subtitle": "..." },
     "features": [{ "title": "...", "desc": "..." }],
     "testimonials": [{ "text": "...", "author": "..." }]
   }
   ```
3. Click **"Save Homepage Config"** → renders on `index.html`

### Gist Backup/Sync
1. Generate **GitHub Personal Access Token** (PAT) at https://github.com/settings/tokens
   - Select scope: `gist`
2. In **Admin Panel** → **"Gist Backup & Sync"**
3. Paste token into **"GitHub Token"** field
4. Click **"Save Token"** → stored in localStorage
5. **Create Gist**: Click **"Create Gist from Topics"**
   - Uploads current `topics` to GitHub Gist
   - Returns Gist ID
6. **Load from Gist**: Paste Gist ID and click **"Load from Gist"**
   - Downloads topics from Gist into localStorage
7. **Download**: Click **"Download as JSON"** to export `topics.json`
8. **Clear**: Click **"Clear All Topics"** to reset (requires confirmation)

---

## 📊 User Features

### Progress Tracking
- **Per-Lesson Completion**: Users can mark lessons complete
- **Per-Topic/Subject Progress**: Dashboard shows % complete for each topic/subject
- **Overall Progress**: Header shows total lessons completed
- **Data Storage**: Stored under `progress_<email>` in localStorage

### File Upload/Download
- Upload files from **"Files"** section
- Files stored locally under `files_<email>`
- Download files individually
- Delete files one at a time

### Account Management
- View logged-in email
- See admin/learner status
- Reset progress (requires confirmation)
- View per-topic and per-subject completion stats

### Settings
- **Theme**: Auto / Dark / Light
- **Accent Color**: Blue / Green / Purple / Red
- **Font Family**: Verdana / Arial / Georgia
- **Font Size**: 12–24px

---

## 🎨 UI/UX Design

### Color Palette (Dark Theme)
- **Background**: #0d1117 (near-black)
- **Cards**: rgba(255,255,255,0.08) (subtle glass)
- **Accent**: #4f9ef5 (professional blue)
- **Text**: #e6edf3 (light gray)
- **Muted**: #8892a6 (secondary text)
- **Borders**: rgba(255,255,255,0.1) (subtle lines)

### Visual Effects
- **Glassmorphism**: `backdrop-filter: blur(15px)` on cards
- **Shadows**: Multi-layer shadows for depth (0 20px 64px + 0 8px 20px)
- **Transitions**: Smooth cubic-bezier easing (0.4, 0, 0.2, 1)
- **Hover Effects**: `translateY(-4px to -8px)` for elevation

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile nav
- Responsive grid (auto-fit, minmax)
- Flexible footer layout

---

## 📦 Data Persistence

All data stored in **browser localStorage** (client-side only):

| Key | Type | Description |
|-----|------|-------------|
| `users` | Object | { email: hashedPassword, ... } |
| `currentUser` | String | Currently logged-in email |
| `isAdmin` | String | "true" or "false" |
| `topics` | JSON String | Array of topic objects |
| `homepage` | JSON String | Homepage config |
| `files_<email>` | JSON String | Array of file objects |
| `progress_<email>` | JSON String | Lesson completion state |
| `theme` | String | "auto" / "dark" / "light" |
| `accent` | String | "blue" / "green" / "purple" / "red" |
| `font` | String | Font family choice |
| `fontSize` | String | Font size (12–24px) |
| `gistToken` | String | GitHub PAT (for Gist sync) |

---

## 🚀 Deployment & Usage

### Local Development
1. Open `index.html` in browser (public homepage)
2. Sign up or log in
3. Redirected to `dashboard.html` (authenticated app)
4. As admin: manage topics, lessons, and homepage

### Live Hosting
- Upload all files to web host (GitHub Pages, Netlify, Vercel, etc.)
- No backend server required (client-side only)
- Works entirely in browser

### Cross-Device Sync
- Use **Gist Backup/Sync**:
  1. Admin creates Gist on Device A
  2. Gets Gist ID
  3. On Device B, paste Gist ID in admin panel
  4. Topics sync instantly

---

## ⚠️ Security Notes

### Production Concerns
1. **Admin credentials hardcoded** in `script.js` (line 84-88)
   - **NOT production-ready**
   - Move to backend with secure authentication (OAuth2, JWT, etc.)

2. **Client-side password hashing only**
   - SHA-256 is NOT secure for passwords
   - Use bcrypt, Argon2, or similar on a backend server

3. **No encryption for localStorage data**
   - All data (passwords, files, progress) visible in browser
   - For sensitive data, use backend + TLS

4. **GitHub PAT exposure**
   - User pastes token in browser (visible in DevTools)
   - Consider server-side proxy for Gist API calls

### Recommendations for Production
- Build backend (Node.js, Python, etc.) with secure auth
- Use database (PostgreSQL, MongoDB) instead of localStorage
- Implement HTTPS + TLS
- Add server-side validation and rate limiting
- Use secure session management (JWT with refresh tokens)
- Sanitize user input to prevent XSS attacks
- Keep admin credentials in environment variables (not source code)

---

## 📝 File Checklist

- ✅ `index.html` — Public homepage with auth forms
- ✅ `dashboard.html` — Authenticated app + admin panel
- ✅ `assets/script.js` — All logic (auth, routing, admin, Gist API)
- ✅ `assets/styles.css` — Theming + component styles
- ✅ `assets/topics.json` — Empty array (ready for admin content)
- ✅ `AUTH_SETUP_GUIDE.md` — Authentication documentation
- ✅ `SITE_README.md` — Project overview
- ✅ `README.md` — Repository info
- ✅ `LICENSE` — MIT License

---

## 🔗 Key Entry Points

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `index.html` | Public landing page |
| Dashboard | `dashboard.html` | Authenticated app |
| Auth Modal | `index.html` + click "Sign Up" | Sign up/login |

---

## 🆘 Troubleshooting

### Sign Up/Login Not Working
- See **[AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md)**
- Check localStorage: DevTools → Application/Storage → Local Storage
- Check browser console for JavaScript errors (F12 → Console)

### Topics Not Showing
- Ensure admin added topics (Admin Panel → Add Topic)
- Check localStorage `topics` key
- Ensure topics.json is valid JSON if importing

### Theme Not Applying
- Check Settings page for theme/accent/font selections
- Clear cache and reload (Ctrl+Shift+Delete)

### Gist Sync Not Working
- Verify GitHub PAT is valid and has `gist` scope
- Check admin panel → "Gist Backup & Sync" section
- Ensure Gist ID is correct when loading

---

## 📞 Contact & Support
Built by **BuildOneRobotics** — Skill Central (2025)

