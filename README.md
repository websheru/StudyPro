# 📚 Study Pro

> Enterprise-grade Android study & note-taking app — built with Expo (React Native + TypeScript).

[![Android Build](https://github.com/YOUR_USERNAME/study-pro/actions/workflows/eas-build.yml/badge.svg)](https://github.com/YOUR_USERNAME/study-pro/actions/workflows/eas-build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- 🌙 **Dual Theme** — Dark / Light / System with smooth transitions
- 🎨 **5 Accent Colors** — Cyan, Violet, Emerald, Amber, Rose
- 📝 **Rich Editor** — Markdown preview, autosave, undo/redo, tags
- 📁 **Organized Notes** — Folders, tags, search, filter views
- 🔒 **Biometric Lock** — Fingerprint / Face unlock
- 📤 **Export** — PDF, JSON backup, native share sheet
- 🗑️ **Trash / Recycle Bin** — Soft-delete with 7-day retention
- ⚙️ **God-Level Settings** — Font scale, card density, autosave interval, and more

---

## 🏗 Architecture

```
study-pro/
├── app/                    # expo-router screens
│   ├── (tabs)/             # Tab-based navigation
│   │   ├── index.tsx       # Home — note list
│   │   └── settings.tsx    # Settings control center
│   ├── topic/
│   │   ├── [id].tsx        # Editor / detail view
│   │   └── new.tsx         # Create note (template picker)
│   └── _layout.tsx         # Root layout + providers
├── components/             # Shared UI components
├── constants/theme.ts      # Cosmic design tokens (dark + light)
├── context/ThemeContext.tsx # ThemeProvider
├── store/                  # Zustand stores (settings + topics)
├── lib/repository.ts       # Data access layer (AsyncStorage)
└── types/index.ts          # TypeScript interfaces
```

---

## 🚀 Setup

### Prerequisites
- Node.js 20+
- [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli`
- Expo account: https://expo.dev

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/study-pro.git
cd study-pro
npm install
```

### 2. Initialize EAS
```bash
eas login
eas init --id YOUR_PROJECT_ID
```
Copy the `projectId` into `app.json` → `extra.eas.projectId`.

### 3. Run locally
```bash
# Android (Expo Go)
npm run android

# Web browser
npm run web
```

---

## 🤖 CI/CD — GitHub Actions

### Required GitHub Secrets

Go to **Settings → Secrets → Actions** and add:

| Secret | Where to get it |
|--------|----------------|
| `EXPO_TOKEN` | expo.dev → Account Settings → Access Tokens → **Create Token** |
| `GOOGLE_SERVICE_ACCOUNT_KEY` *(optional, for auto-submit)* | Google Play Console → Setup → API access → Create service account |

### How it works

| Trigger | Action |
|---------|--------|
| Push to `main` | Full lint + typecheck + tests → **EAS Production build (AAB)** |
| Push to `develop` | Full lint + typecheck + tests → **EAS Preview build (APK)** + OTA update |
| Manual trigger | Choose profile (development / preview / production) |

### Download your APK / AAB
1. Go to [expo.dev](https://expo.dev) → Your project → Builds
2. Download the artifact when the build completes (~5-15 min)

---

## 📱 Build Profiles

| Profile | Output | Use for |
|---------|--------|---------|
| `development` | Debug APK | Dev client testing |
| `preview` | Release APK | Internal QA / sideloading |
| `production` | AAB | Play Store submission |

### Manual build
```bash
# Preview APK (sideload on device)
eas build --platform android --profile preview

# Production AAB (Play Store)
eas build --platform android --profile production
```

---

## ✅ QA Checklist (before Play Store submission)

- [ ] Test on API 30 (Android 11) — minimum supported
- [ ] Test on API 34 (Android 14) — latest
- [ ] Test on small screen (360×640 dp, Moto E)
- [ ] Test on large screen (412×915 dp, Pixel 7)
- [ ] Test foldable layout (Galaxy Z Fold)
- [ ] Verify dark mode + all 5 accent colors
- [ ] Verify biometric lock (enroll fingerprint first)
- [ ] Create, edit, delete, archive, restore notes
- [ ] Export PDF — verify branding header/footer
- [ ] JSON export → import round-trip
- [ ] Check all Settings toggles persist across app restart
- [ ] Verify "© 2026 Developed by Narpat Prihar" footer

---

## 📄 License

MIT © 2026 Narpat Prihar
