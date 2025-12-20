# Sign Up & Sign In Setup Guide

## How Sign Up/Sign In Works

The authentication system uses **Web Crypto API (SHA-256 hashing)** and **localStorage** for user account persistence. This is a client-side only implementation.

### Code Locations

#### 1. **Form Elements** (`index.html`, lines 70-92)
- **Login Form**: `id="login-form"` with inputs `id="email"` and `id="password"`
- **Sign Up Form**: `id="signup-form"` with inputs `id="signup-email"`, `id="signup-password"`, `id="confirm-password"`

#### 2. **Form Submission Handlers** (`assets/script.js`, lines 561-587)

**Login Handler** (line 561):
```javascript
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const pwd = document.getElementById('password').value;
  if (await login(email, pwd)) {
    // Success - redirects to dashboard
  } else {
    alert('Invalid credentials');
  }
});
```

**Sign Up Handler** (line 572):
```javascript
signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const pwd = document.getElementById('signup-password').value;
  const confirmPwd = document.getElementById('confirm-password').value;
  if (pwd !== confirmPwd) {
    alert('Passwords do not match');
    return;
  }
  if (await signup(email, pwd)) {
    // Success - redirects to dashboard
  } else {
    alert('User already exists');
  }
});
```

#### 3. **Authentication Functions** (`assets/script.js`, lines 80-140)

**Login Function** (line 80):
- Checks for hardcoded admin account: `ben.steels@outlook.com` / `fhwe87syu`
- For regular users, hashes password with SHA-256 and compares against localStorage
- On success: saves `currentUser` and `isAdmin` to localStorage, redirects to `dashboard.html`
- On failure: returns false, shows "Invalid credentials" alert

**Sign Up Function** (line 110):
- Hashes password with SHA-256
- Checks if user email already exists
- If new: saves to localStorage `users` object, sets `currentUser`, redirects to `dashboard.html`
- If exists: returns false, shows "User already exists" alert

**Password Hashing** (line 74):
```javascript
async function hashPassword(pwd) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Data Storage (localStorage)

After sign up or login, data is stored as:
```javascript
localStorage.setItem('currentUser', email);
localStorage.setItem('isAdmin', 'true' or 'false');
// User credentials stored as:
localStorage.setItem('users', JSON.stringify({
  'user@example.com': 'sha256hashofpassword',
  'another@user.com': 'sha256hashofpassword'
}));
```

### Troubleshooting Sign Up/Sign In Not Working

**Issue 1**: Form submission not triggering
- Check browser console (F12 → Console tab) for JavaScript errors
- Verify form IDs match: `login-form`, `signup-form`, `signup-email`, `signup-password`, `email`, `password`, `confirm-password`

**Issue 2**: Credentials not saved after sign up
- Check localStorage: open DevTools → Application/Storage → Local Storage → look for keys `users`, `currentUser`, `isAdmin`

**Issue 3**: Login works but doesn't redirect
- The `login()` function at line 80 should redirect. Check:
  - Line 92: `window.location.href = 'dashboard.html'` for regular users
  - Line 86: `window.location.href = 'dashboard.html'` for admin

### Testing Sign Up/Sign In

1. **Open** `index.html` in browser
2. **Click** "Sign Up" button → fills signup form
3. **Enter** email and password
4. **Click** "Sign Up" button
5. **Expected**: Redirects to `dashboard.html`

**For Admin Test**:
- Email: `ben.steels@outlook.com`
- Password: `fhwe87syu`

### ⚠️ Security Warning

- **Admin credentials are hardcoded** in `assets/script.js` (line 84-88) — **do not use in production**
- **All authentication is client-side** — no server validation, passwords stored in localStorage
- **For production**: Move auth to a backend server with secure password hashing (bcrypt, Argon2, etc.)

### How to Add/Test New Users

In browser console:
```javascript
const users = JSON.parse(localStorage.getItem('users') || '{}');
users['test@example.com'] = ''; // Will be overwritten on signup
localStorage.setItem('users', JSON.stringify(users));
```

Or simply sign up a new account through the UI.

---

**Summary**: 
- Sign up creates new user account and hashes password to localStorage
- Sign in compares entered password hash against stored hash
- On success, user is logged in and localStorage contains `currentUser` + `isAdmin`
- Redirect to `dashboard.html` happens via `window.location.href`
