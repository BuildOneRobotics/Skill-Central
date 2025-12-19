# Skill Central — Site README

This folder contains a static website for the Skill Central project, teaching life skills with topics like finance, cooking, household skills, and more.

## Features

- **Minimalist macOS-inspired UI**: Clean design with rounded corners, subtle shadows, and light colors.
- **Secure Accounts**: Client-side authentication using localStorage with SHA-256 hashing (demo only; not production-secure).
- **Private File System**: Upload and manage personal files securely in browser storage.
- **No Data Exposure**: User data, passwords, and progress are not displayed or shared.

## Quick Start

1. Open `index.html` in your browser (double-click or use a local server like `python -m http.server`).
2. Sign up or sign in with an email and password.
3. Browse topics and subjects.
4. Switch to "Files" to upload and manage your personal files.

## Files

- `index.html` — Main site with auth and content.
- `assets/styles.css` — macOS-style CSS.
- `assets/script.js` — Client-side logic for auth, topics, and files.
- `assets/topics.json` — Topic and subject data.

## Security

Uses localStorage with SHA-256 password hashing. Data persists in browser but is not secure for production—consider a backend for real security.

## Next Steps

- Add course progress tracking.
- Integrate with a backend for real security.
- Expand topics with detailed lessons.