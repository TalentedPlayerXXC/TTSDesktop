[中文](UPDATE.md) | [English](UPDATE_EN.md)

# Changelog

## 2025-07-03

### ✨ New Features

#### 1. Multi-Character Dubbing
- Smart Dubbing now has a **Multi-Character Mode** with per-line speaker and text editing
- Pick a different voice actor for each line, add as many lines as you want
- Real-time character overview on the right — your casting call at a glance

#### 2. Emotion Dubbing Mode
- Brand new **Emotion Mode** with 12 emotion tags: happy, sad, angry, gentle, calm, lively, healing, deep, energetic, sexy, serious, lazy
- Select multiple emotions for extra dramatic effect

#### 3. Crash Test Page
- New `/crash-test` route for debugging error boundaries
- Three crash types: normal exception, async error, and full-on React meltdown

#### 4. ErrorBoundary Global Protection
- Catches render errors so you never see a white screen of death
- Shows error details and stack trace, with a "try again" button

#### 5. CyberpunkLoading Screen
- Full-screen cyberpunk-styled loading animation component
- Customizable loading message and model name

### 🔧 Refactoring

#### 1. One-Shot Cloning (TTSComponentBeta) Overhaul
- Removed language selection, text splitting mode, speed slider — let the AI handle it
- Switched from FormData upload to file path, now talks to the real backend API
- Added model loading workflow (`ensureModelLoaded`) — unload old model first, then load fresh
- CyberpunkLoading shows real-time "Loading model..." status
- Text limit bumped from 300 to **5000 characters**

#### 2. Voice Design (VoiceDesign) Overhaul
- Removed speed/volume sliders and reset button — no more knob-twiddling
- Added **text input field** for the content to synthesize (up to 5000 chars)
- Prompt limit raised from 200 to **500 characters**
- Connected to real backend API (`voxDesign`), audio plays inline after synthesis
- CyberpunkLoading included for the dramatic wait

#### 3. Service Layer Fully TypeScript'd
- New `src/services/types.ts` — full TypeScript types for every API request/response
- Unified API: `clone` / `batchClone` / `dialogue` / `voxDesign` / `voxClone` / `stt` / `getFilesList`
- Deprecated: `getTTS` / `qwen` / `getModels` / `getSpks` / `getFileLink` / `getEmotionList`
- New `ensureModelLoaded` lifecycle manager
- Auto-switches API base URL between Electron and browser
- `index_fetch.tsx` synced up — pure-fetch version enjoys all the new endpoints too

### 🎨 UI/UX Polish

- Smart Dubbing page now has **mode tabs** (Single / Multi / Emotion) for easy switching
- Text input limits uniformly raised to **5000 characters** — long texts rejoice
- GitHub Issues link updated to the new repo
- Mascot feedback form textarea now has `autoSize`

### 📁 New Files

```
src/
├── services/
│   └── types.ts               # Full API type definitions (new)
├── components/
│   ├── CrashTest.tsx           # Crash test page (new)
│   ├── CyberpunkLoading.tsx    # Cyberpunk loading component (new)
│   ├── CyberpunkLoading.css    # Loading styles (new)
│   ├── ErrorBoundary.tsx       # Error boundary component (new)
│   └── ErrorBoundary.css       # Error boundary styles (new)
tts_serve_mlx/                  # Python backend service directory (new)
ELECTRON_INTEGRATION.md         # Electron integration docs (new)
api.md                          # API documentation (new)
```

### 🔧 Other Changes

- `.gitignore` updated with `tts_serve_mlx` directory rule (keep the folder, ignore the contents)
- SidebarMenu now has `/crash-test` entry
- Router added `/crash-test` route
- `package.json` dependency bumps

---

## 2025-06-17

### ✨ New Features

#### 1. Curved Sidebar Navigation (SidebarMenu)
- A vertically centered, arc-layout navigation menu rendered with Canvas animations
- Four entry points: Smart Dubbing, One-Shot Cloning, Voice Design, Preferences
- Each button features a dynamic Canvas icon:
  - **Smart Dubbing** — Microphone icon with a breathing glow and particle effects
  - **One-Shot Cloning** — DNA double-helix icon with a continuous rotation animation
  - **Voice Design** — Palette icon with subtly animated paint droplets
  - **Preferences** — Gear icon with a steady spinning animation
- Tooltip labels appear on hover
- Active-state icon color shifts from purple to amber for clear visual feedback

#### 2. Assistant Mascot (Bottom-Right Corner)
- A Canvas-drawn character with blink, breathing, and sparkle-particle animations
- Click to expand a feedback menu:
  - Quick link to GitHub Issues
  - Bug report form (accepts both title and detailed description)
- A speech bubble guides users to submit feedback

#### 3. Preferences Page (SettingsComponent)
- Dedicated component directory (`src/SettingsCompontent/`)
- Unified purple (#7c3aed) theme via ConfigProvider
- Two functional sections:
  - **Appearance** — Theme mode (light / dark / system), interface language (Chinese / English)
  - **Notifications & Privacy** — Toggle for notification alerts and history persistence
- Action buttons at the bottom: Restore Defaults, Save Settings
- Card headers use static icons while the page title uses a dynamic Canvas icon

### 🎨 UI/UX Polish

#### 1. Unified Visual Language
- **Consistent card-header styling** across all components:
  - Text color: `#4c1d95` (deep purple)
  - Background: `#faf9ff` (light lavender)
  - Rounded borders, no underlines
- **Icon system upgrade**:
  - Page-level titles use animated Canvas icons (IconTTS, IconClone, IconDesign, IconSettings)
  - Card-level headers use static Ant Design icons (FileTextOutlined, TeamOutlined, SettingOutlined, etc.)
  - A clear visual hierarchy is maintained by pairing motion with stillness

#### 2. CSS Modularization
- Moved away from all inline `<style>` tags and `style={{}}` attributes
- Newly created standalone CSS files:
  - `src/components/Mascot.css` — Mascot component styles
  - `src/components/SidebarMenu.css` — SidebarMenu component styles
- Class naming convention: component name as prefix (e.g., `.mascot-container`, `.sidebar-tooltip`)

#### 3. Interaction Refinements
- **Smart Dubbing page**:
  - Added a "Trending" category with a flame icon
  - Added a "Custom" category option
  - Voice-actor grid changed to a 4-column layout with improved spacing
- **One-Shot Cloning page**:
  - Simplified the parameter area to keep only core controls (language, segmentation mode, speed)
  - Improved the audio-upload interaction — supports both drag-and-drop and click-to-browse
  - Added a remove-audio button (CloseCircleFilled)
- **Settings page**:
  - "Restore Defaults" button styled in the purple color scheme to match the theme
  - Card spacing adjusted to 15px for a more comfortable feel
  - Switch components unified to theme purple via ConfigProvider

#### 4. Routing Improvements
- Added `/settings` route pointing to SettingsComponent
- Sidebar navigation integrated with the routing system — clicking navigates to the corresponding page
- Route guard: unrecognized paths automatically redirect to `/tts`

### 📁 Directory Structure Changes

```
src/
├── components/           # Shared components directory (new)
│   ├── IconTTS.tsx      # Dynamic Canvas icons
│   ├── IconClone.tsx
│   ├── IconDesign.tsx
│   ├── IconSettings.tsx # New settings icon
│   ├── IconTTSStatic.tsx
│   ├── IconCloneStatic.tsx
│   ├── IconDesignStatic.tsx
│   ├── Mascot.tsx       # Assistant mascot component
│   ├── Mascot.css       # Mascot styles (new)
│   ├── SidebarMenu.tsx  # Sidebar navigation menu
│   └── SidebarMenu.css  # SidebarMenu styles (new)
├── SettingsCompontent/  # Settings page component (new)
│   ├── index.tsx
│   └── index.css
├── TTSComponent/        # Smart Dubbing page
├── TTSComponentBeta/    # One-Shot Cloning page
├── VoiceDesign/         # Voice Design page
└── ...
```

### 🔧 Technical Improvements

- **Canvas animation system** — Implemented particle effects, orbital halos, breathing glows, and other motion effects
- **Unified theme management** — Global theme color configured through Ant Design ConfigProvider
- **CSS modularization** — Component styles managed independently to avoid global pollution
- **Code standardization** — All inline styles removed for improved maintainability
