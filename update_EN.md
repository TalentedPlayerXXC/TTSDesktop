[中文](update.md) | [English](update_EN.md)

# Changelog

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
