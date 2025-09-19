# Uni Chat App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28.svg?logo=firebase)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Live Demo](https://img.shields.io/badge/Demo-Vercel-black.svg?logo=vercel)](https://uni-chat-app-vuuh.vercel.app/)

---


## 🚀 Overview

**Uni Chat App** is a modern, university-focused group chat platform built with React, Firebase, and Tailwind CSS.  
It enables students and faculty to communicate in real time via group chats organized by **major**, **courses**, and **general topics**.

---

## 🖼️ Showcase

![App Showcase](public/Showcase.png)

---

## 🌐 Live Demo

Access the deployed app here:  
👉 [https://uni-chat-app-vuuh.vercel.app/](https://uni-chat-app-vuuh.vercel.app/)

---

## 🆕 Recent Updates

### v2.1 - Progressive Web App (PWA) 
- **📱 PWA Support:** Full Progressive Web App capabilities with installable experience
- **🔄 Offline Mode:** Chat history cached for offline viewing and seamless reconnection
- **🏠 Home Screen Install:** Add to home screen on mobile and desktop for native app feel
- **⚡ Service Worker:** Advanced caching strategies for Firebase and static assets
- **🎯 App Manifest:** Complete PWA manifest with icons and platform optimization

### v2.0 - Enhanced Stability & Notifications
- **🔧 Fixed Chat Flickering:** Completely resolved message rendering issues for smooth real-time chat
- **🔍 Advanced Search:** Intelligent search with abbreviations, scoring, and multi-word support  
- **🔔 Complete Notification System:** Interactive bell dropdown, desktop notifications, and smart unread tracking
- **⚡ Performance Optimizations:** Improved React rendering and reduced unnecessary re-renders
- **🧹 Code Quality:** Production-ready codebase with comprehensive error handling

---

## 🎯 Features

- **Progressive Web App (PWA)**
  - 📱 Installable on mobile and desktop (Add to Home Screen)
  - 🔄 Offline functionality with cached chat history
  - ⚡ Fast loading with service worker caching
  - 🎯 Native app-like experience with standalone display mode
  - 🔧 Auto-updates and background sync capabilities

- **Authentication & Security**
  - Register with email, password, display name, and university major
  - Email verification & password reset flows
  - Secure login/logout (Firebase Auth)
  - Profile management with image cropping & upload

- **Group Chat Rooms**
  - Auto-generated chat rooms for every major, all general topics, and each university course
  - Dynamic member counts for groups
  - Real-time messaging (Firestore listeners)
  - File sharing (images, documents, audio, video, compressed files)
  - Emoji picker & rich emoji support
  - Reply-to messages with preview
  - Message actions: copy, reply, delete (own messages)
  - Scroll-to-bottom and load more messages (pagination)
  - Group info sidebar: guidelines, description, members

- **Search & Navigation**
  - Advanced group search with fuzzy matching and scoring
  - Abbreviation support (e.g., "cs" finds "Computer Science", "is" finds "Islamic Studies")
  - Multi-word search with intelligent matching
  - Subject-based categorization and filtering
  - Autocomplete suggestions with real-time results
  - Collapsible sidebar for groups, courses, and general rooms
  - Responsive design for mobile & desktop
  - Status bar showing current time (local/timezone) & user login

- **Smart Notifications**
  - Real-time unread message tracking across all groups
  - Interactive notification bell with dropdown menu
  - Desktop browser notifications with permission handling
  - Group-specific unread count badges
  - Quick navigation to groups with new messages
  - Auto mark-as-read when entering chat rooms
  - Notification persistence across browser sessions

- **Tech Stack**
  - React 19, React Router v6
  - Firebase Auth, Firestore, Storage
  - Progressive Web App (PWA) with Workbox
  - Vite with PWA plugin for service worker generation
  - Tailwind CSS
  - Vite for fast development
  - Emoji Picker, React Icons, React Image Crop

---

## 📂 Directory Structure

```
uni-chat-app/
├── public/
│   ├── chat-icon.svg        # App icon for favicon and branding
│   ├── pwa-192x192.png      # PWA icons for installation
│   ├── pwa-512x512.png      # PWA icons for installation
│   ├── apple-icon-180.png   # Apple touch icon for iOS
│   ├── Showcase.png         # Screenshot of the app
│   └── ...                  # Other static assets
├── dist/                    # Production build (generated)
│   ├── index.html           # Optimized HTML with PWA features
│   ├── manifest.webmanifest # PWA manifest file
│   ├── sw.js                # Service worker for offline functionality
│   ├── registerSW.js        # Service worker registration
│   ├── workbox-*.js         # Workbox caching library
│   └── assets/              # Minified JS/CSS bundles
├── src/
│   ├── components/          # UI components (Chat, Auth, Groups, Layout, etc.)
│   ├── contexts/            # React context providers (AuthContext)
│   ├── data/                # Static data (majors, courses, etc.)
│   ├── hooks/               # Custom React hooks (useGroups, useDebounce, etc.)
│   ├── pages/               # Page-level views (Home, Profile, GroupChat, etc.)
│   ├── services/            # Firebase logic (storage, notifications, etc.)
│   ├── styles/              # CSS and Tailwind files
│   ├── utils/               # Utility functions (groupId, etc.)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                     # Firebase configuration (not committed)
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## ⚡ Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/AhmedQw1/uni-chat-app.git
cd uni-chat-app
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Copy your Firebase config into a `.env` file (refer to `.env.example`)

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. Start the Development Server

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production & PWA

```sh
npm run build
```

This creates an optimized build in the `dist/` folder with full PWA capabilities.

To preview the production build locally:

```sh
npm run preview
```

---

## 📱 PWA Installation

### Desktop (Chrome, Edge, Safari)
1. Visit the app in your browser
2. Look for the install icon in the address bar or app menu
3. Click "Install" to add it as a desktop app

### Mobile (Android/iOS)
1. Open the app in your mobile browser
2. **Android Chrome:** Tap the menu → "Add to Home screen"
3. **iOS Safari:** Tap the share button → "Add to Home Screen"
4. The app will appear on your home screen like a native app

### Offline Usage
- Chat history is cached for offline viewing
- New messages sync automatically when connection returns
- App updates happen automatically in the background

---

## 🛠️ Customization

- **Edit Majors/Courses:**  
  Change or add majors and courses in `src/data/majors.js`.

- **Branding:**  
  Replace `public/chat-icon.svg` and update favicon as needed.

- **Theme:**  
  Customize colors and style via `src/styles/variables.css` and Tailwind config.

---

## 🏫 Use Case

- For university students and faculty to collaborate, share resources, and chat by major, course, or general interest.
- Can be adapted for other educational institutions or organizations needing structured, authenticated group chat.

---

## 🙏 Credits

- Built with [React](https://react.dev/), [Firebase](https://firebase.google.com/), [Tailwind CSS](https://tailwindcss.com/), [Vite](https://vitejs.dev/)
- Emoji Picker: [emoji-picker-react](https://github.com/ealush/emoji-picker-react)
- Cropper: [react-image-crop](https://github.com/DominicTobias/react-image-crop)
- Icons: [react-icons](https://react-icons.github.io/react-icons/)

---

## 📜 License

MIT

---

## 💬 Feedback & Contributions

- Found a bug or have a feature request?  
  Feel free to open an issue or pull request!
- Contributions are welcome to enhance the university chat experience!
