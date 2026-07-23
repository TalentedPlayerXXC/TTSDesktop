[中文](UPDATE.md) | [English](UPDATE_EN.md)

# Changelog

## 2026-07-23

### 🎨 Distribution Page Expansion

- **Architecture docs pages** — `huisheng-client.html` (frontend architecture) + `huisheng-serve.html` (backend architecture). All expanded by default, collapsible sections, SVG diagrams, code snippets, data flows, endpoint tables. Never again will someone ask "how is this project built?" 🤓
- **Top-nav tri-link** — The release page now has "📐 Frontend / ⚙️ Backend" quick links at top-right. Both architecture pages link back to the release page and to each other. Seamless navigation between all three pages 🧭
- **Star badge moved to the right** — Now sits alongside the arch links, consistent across all pages
- **Star badge on arch pages too** — Both architecture pages now show the live GitHub star count from the API, same as the release page ✨
- **All links use relative paths** — Double-clicking locally works just as well as on GitHub Pages 👌

## 2026-07-22

### 🛡️ Error Reporting Enhancements

- **ErrorBoundary auto-reporting** — Component tree crashes no longer just show a cyberpunk screen; the error is auto-filed to GitHub Issues, awaiting the patrol 🧐
- **Global JS error capture** — `window.onerror` + `unhandledrejection` listeners catch runtime errors and unhandled Promise rejections. Everything goes up, nothing slips through 💥
- **Session dedup** — Same error only reported once per session. Page refresh resets the dedup set — no spam

### 🔒 Security Fixes (Hardened Sanitization)

- **Path sanitization covers all environments** — `sanitizePath` now handles Vite `http://localhost:5173/` URLs, `file:///` protocol, and asar-nested paths. Dev/build/installed-to-Applications — none of them will leak absolute paths to GitHub 🛡️

### 📦 Packaging & Signing Fixes

- **macOS 15 Sequoia compatibility** — `pack:online`/`pack:offline` now run ad-hoc codesign with proper `CodeResources` sealing. macOS 15 no longer shows "app is damaged" — degrades to the normal "unidentified developer → allow in Settings" flow. Other macOS versions unaffected 🎯
- **electron-builder config hardened** — Both YAML files set `identity: null` for consistent signing behavior

### 🔒 Security Fixes

- **Log path sanitization** — Absolute paths in feedback logs are now trimmed to `/last/two/segments` before submission. Usernames and directory structure stay hidden. Fixed matching for paths containing spaces like `Application Support` 🛡️
- **Contact field removed** — Feedback modal no longer asks for email/QQ/WeChat. GitHub Issues are public — no personal identifiable information collected 🚫

### 🎨 Distribution Page Polish

- **Star badge ⭐** — Top-right corner now shows a live GitHub star count. Hover glows gold, click goes straight to the repo
- **Project description** — Playful one-liner under the hero title so visitors instantly know what this is about
- **Inline changelog** — Collapsible section at the bottom fetches `UPDATE.md` from the dev branch and renders it on the spot. No need to leave the page to see what's new

## 2026-07-21

### ✨ New Features

- **New game: Blue Archive** — Character database expanded to 6 games, 452 characters total. `GAME_FOLDER_MAP` and `characters.json` fully synced 🎉
- **🎭 Cyberpunk Distribution Site** — `docs/` folder hosts a GitHub Pages download page. Cyberpunk grid background, neon title, macOS offline/online packages clearly listed. Direct download URL for the latest release is copyable. Even has a favicon. All free, all GitHub 🤑

### 🔧 Refactors

- **Emotion regex enhanced** — New bare `【emotion】` pattern catches numbered variants like `【默认2】` / `【默认3】`. The emotion dropdown now correctly surfaces all of them 👀
- **English artifact names** — Changed from `绘声-1.2.0-online-arm64.dmg` to `huisheng-1.2.0-online-arm64.dmg`. GitHub no longer chokes on Chinese characters in filenames

### 🧹 Data Cleanup

- **`【_unk_】` → `【其他】`** — 21 unclassifiable audio files batch-renamed. No more ugly `_unk_` labels, replaced with clean `【其他】` (Other)

### 🐛 Squashed Some Bugs

- **Emotion list counts match actual files** — Two audio files = two emotion tags. No more merging, no more hiding

---

## 2026-07-20

### 🔧 Refactors

- **Dynamic port, backend-driven** — Backend picks a free port on startup, prints `TTS_SERVER_PORT=xxxx` to stdout. Electron main process just parses it. Removed `findFreePort()` and `net` dependency. Ports fully decoupled 🎯
- **Fetch service synced to dynamic port** — `fetch_request.tsx` now has `updateServerPort()` + `getServerPortValue()`, matching the Axios version. Kept as a fallback in case Axios supply chain ever goes sideways 🛞

### 🧹 Code Cleanup

- **SettingsCompontent → SettingsComponent** — Folder name, component name, imports all fixed. OCD comfort achieved ✅
- **Wiped out `(window as any).electronAPI`** — All 7 occurrences replaced with proper typed calls. `vite-env.d.ts` fully covers all preload IPC types
- **Unified `isElectron` detection** — All 3 service files now use `window.electronAPI !== undefined`. No more guessing from userAgent
- **Dead code removal** — `AudioRecorder/` shell component, orphaned `base64ToBlob` in `util.tsx`, swept away 🧹
- **electron-builder gets `node_modules`** — Both yml configs updated. Dependencies won't mysteriously vanish from the bundle

### 🐛 Squashed Some Bugs

- **`Menu` finally properly imported** — `main.js` forgot to destructure `Menu` from electron. Packaged builds never actually hid the menu bar. Now they do 👌
- **Typo fixes** — `unloadTTTModel` → `unloadTTSModel`, `loadTTTModel` → `loadTTSModel`. Three Ts → two Ts
- **Entry point fix** — `index.html` referenced `main.jsx` which didn't exist. Now points at `main.tsx`
- **Delete Model button drops the \"testing\" label** — Triple path validation is solid. Real feature, no disclaimer needed 💪
- **SoundWorkshop closes AudioContext after use** — `ctx.close()` finally called. Not holding the toilet hostage anymore

### 🐞 Squashed Some More Bugs

- **Lightweight model warmup** — After downloading, secretly runs one inference to trigger MLX JIT compilation. First synthesis on the lightweight model is no longer a slideshow 🔥
- **App kill now actually kills everything** — `stopServer()` and `will-quit` both use recursive process tree killing + `pkill` as backup. Close window, Cmd+Q — children, grandchildren, all dead 🗡️
- **`execSync` scope fixed** — Moved from middle of file to top so `stopServer` can actually reach the `pkill` function

---

## 2026-07-16

### ✨ New Features

- **📂 Storage Info Card** — Settings now shows model and app data paths at a glance
- **🗑️ Delete Model Files** — One-click model deletion in Settings with triple path validation. Testing-phase feature with risk warning

### 🔧 Refactors

- **Dual Build Config** — `electron-builder.yml` (offline ~4GB with models) / `electron-builder.online.yml` (online ~750MB, downloads on launch). Distinct `artifactName` prevents overwrites
- **Online Model Path** — Models go to `~/Library/Application Support/huisheng/models/`. Falls back to bundle path when present (offline compat)
- **Backend Logs Forwarded to Renderer** — New `backend-log` IPC + `onBackendLog` preload bridge for easier network debugging

### 🐛 Squashed Some Bugs

- **No more "Object destroyed" on quit** — try-catch wrapped webContents.send in backend log forwarding
- **Menu bar hidden when packaged** — `Menu.setApplicationMenu(null)` replaces `mainWindow.setMenu(null)` for global macOS effect
- **Drag & drop magic byte validation** — Checks RIFF/ID3/fLaC/OggS/ftyp headers instead of trusting file extensions
- **DevTools uses app.isPackaged** — Removed NODE_ENV dependency. DevTools auto-close when packaged

---

## 2026-07-15

### ✨ New Features

- **📥 Auto Model Download** — First launch pops a download dialog. Backend `git clone`s from ModelScope, frontend polls every 500ms. Disclaimer ready: "ModelScope is special — no resume support 🙏"
- **📜 Startup Disclaimer** — Pops terms of use on every launch. Disagree = instant kill, clean exit
- **🗑️ Custom Speaker Delete Confirmation** — No more accidental deletions. Popconfirm asks "you sure?" before yeeting
- **🎯 Default Emotion Auto-Select** — Picking a character now auto-selects the first emotion. One less click
- **🎭 Sassy Loading Messages** — "Voice actor is on the way 🏃" / "Sound engineer is twisting knobs 🎛️" / "Emotion module is loading drama queen mode 🎭"

### 🔧 Refactors

- **Multi-voice switched to `/dialogue` API** — Backend handles cross-character gaps and crossfades. Frontend just sends an array
- **`return_raw` for synthesis endpoints** — All synthesis APIs can return raw WAV binary now. One request instead of two
- **Unload-all-before-load** — `POST /model/unload` with no body clears everything before loading a new model. No more tracking, no 10GB memory leak
- **Direct load after download** — Download done → straight `POST /model/load {"model": "tts"}`. No detour through `ensureModelLoaded`

### 🐛 Squashed Some Bugs

- **Dialog no longer deadlocks** — `onComplete` no longer waits for `loadInitialModels` IPC. Close first, ask questions later
- **No forced load on startup** — Checks `/models-info` first. If files are missing, skips loading instead of throwing FileNotFoundError
- **Preload sync** — New IPC `get-startup-model` so the renderer knows what main process loaded. `_currentModel` stays in sync
- **Popconfirm over Modal.confirm** — Lighter confirmations. No heavy modal dialog for a simple "are you sure?"

---

## 2026-07-14

### ✨ New Features

- **💬 Chat Bubble Multi-Character Mode** — Finally buried that crappy "number + dropdown + input" editor! Now it's chat bubbles. Click to speak, click again to edit. Just like messaging your friends
  - Left column: bubbles lined up, click to edit words, × to delete lines
  - Right column: full character list, search/filter/favorites/emotions, click 'em and they hop in
  - Bottom input: [Character Name:2] [Pick Emotion:2] [Write Lines:5] [Clear:1]
  - Select a character and it auto-picks the first emotion, saves you a click

### 🎨 UI Shenanigans

- **Layout restructured** — Bubbles on the left, character grid on the right, no more cramped 60% corner
- **Character name goes commando** — Selected character is just plain text, no box, no fuss
- **Emotion dropdown finally aligns** — Same 32px height as name and text inputs, standing in a neat row

### 🐛 Squashed Some Bugs

- **Fixed silent WAV export** — Tone.Offline and native AudioNodes just don't get along, throwing "A value with the given key could not be found". Got mad, ripped it all out, rewrote with pure native OfflineAudioContext + raw Web Audio nodes. All 13 effects manually mapped. Export finally goes boom.

### 🔮 Pie in the Sky 🥮

- **Multi-Character Mode Polish** — The current speaker picker feels clunky, planning some love to make it smoother ✨

### ✨ New Features

- **🎛️ Sound Workshop** — Brand new page! Drop an audio in, slap on some effects (echo/pitch/distortion/reverb…), click export, done
- **13 audio effects** — Volume, Echo, Vibrato, Pitch Shift, Distortion, Reverb, Chorus, PingPong Delay, AutoFilter, Phaser, Tremolo, Stereo Widener, 3-Band EQ — plenty to play with
- **12 sound presets** — Cute Girl, Deep Man, Kawaii, Electronic, Ethereal, Valley Echo, Telephone, Ghost, Surround, KTV Reverb, Bass Boost, Heartfelt Words — one for every mood
- **Preset exclusivity + toggle** — Click a preset, it replaces everything. Click effects individually to stack. Click again to remove. Like switches.

### 🎨 UI Shenanigans

- **Sound Workshop layout** — 47% left column for upload/waveform/output volume, right column toggles between effects/presets tabs. Feels roomy
- **SWPlayer component** — Dedicated waveform displayer. No sound, just waves. With play/download/clear buttons
- **AudioPlayer cleaned up** — Stripped out all the hack props (muted/onClear/onTogglePlay) I piled on earlier. TTSComponent lives in peace again
- **Output volume control** — -20~+20dB knob, real-time Tone.js master volume
- **Waveform sync** — Tone.now() drives WaveSurfer progress bar, 50ms refresh, syncs like a champ
- **Tone.Offline export** — Click export and it renders the full effects chain offline. No data loss, no drama

### 🐛 Squashed Some Bugs

- **Packaging signing fix** — Added ad-hoc codesign, downgraded from "damaged file → fix.command" to "right-click app → Open"
- **Fixed One-Click Cloning** — Dumped Ant Design Upload for the native file dialog. Fixes the empty `originFileObj.path` issue that broke synthesis in Electron
- **Backend port randomization** — Scans for free ports from 8000 on startup, stops fighting other apps
- **Fixed effect chain dropouts** — disposeChain no longer kicks the player offline, sound stays continuous through chain rebuilds
- **Fixed LFO effects not working** — AutoFilter/Vibrato/Phaser/Chorus now all call .start() properly. Was being lazy.
- **Fixed export missing output volume** — Tone.Offline callback now reapplies outputVolume, export volume follows the slider

---

## 2026-07-08

### 🔮 Pie in the Sky 🥮

- **Multi-Character Mode Polish** — The current speaker picker feels clunky, planning some love to make it smoother ✨

### 🐛 Squashed Some Bugs

- Fixed `ensureModelLoaded` in `index_fetch.tsx` unloading the wrong model (was unloading the target instead of the loaded one). Added the missing `if` guard.
- Fixed `loadTTTModel()` in `main.js` not unloading before loading on startup, preventing model-stacking memory leaks
- Added `characters/` to `extraResources` — 296 characters' reference audio finally reads correctly in packaged builds
- Rewrote path logic: `getCharactersBase()` / `getCustomSpeakersDir()` — dev goes through `__dirname`, packaged build reads reference from `resources` (read-only), custom speakers from `userData` (writable)

### 🎨 UI Shenanigans

- **Renamed to 绘声 (HuìShēng)** — Finally an official name, updated everywhere
- **Logo redrawn** — Sound wave bars + brand name in STKaiti system font, zero copyright worries, canvas widened to 180px
- **Listening ring avatar** — Right side switched to concentric expanding rings, pairs with the left-side speaker
- **Meme tagline pool** — 29 dev humor quotes drop at random, typewriter effect + blinking cursor. Every launch is a blind box
- **Layout fix** — Three-column flex centering, no more crooked-right nonsense

---

## 2026-07-07

### ✨ New Features

#### 1. Custom Speaker System
- Voice Design synthesized audio can now join the speaker list with one click — custom characters finally sit at the same table as native ones
- Audio files auto-migrate to `characters/自定义/`, delete the folder and it auto-disappears from the list
- Bidirectional sync between localStorage and filesystem — CRUD all day long

#### 2. Dynamic Emotion Tags
- Click a speaker and it auto-guesses emotions from audio filenames (`开心-xxx.wav` → 开心), no manual setup needed
- Works in both Solo and Emotion modes, single-tag selectable
- Custom speakers have no emotions? Skipped automatically, no fuss

#### 3. Full Backend API Integration
- Solo: `ensureModelLoaded('tts')` → `clone()`
- Multi: `ensureModelLoaded('tts')` → `batchClone({ merge: true })`
- Emotion: `ensureModelLoaded('voxcpm2')` → `voxClone(instruct)`
- Switch modes, it auto-unloads old model, loads new one — never cross the streams
- Auto-plays synthesized audio on completion

#### 4. Session-Based Data Cache
- In-memory cache, gone when you close the app
- First load fetches from MongoDB, subsequent page visits are instant
- Skeleton loading + CyberpunkLoading fullscreen animation — even waiting looks cool

#### 5. MongoDB Character Data
- Loads 296+ characters from MongoDB Atlas (with voice type / temperament tags)
- Dynamic filter bar: All / Male / Female / voice type / temperament — finding people is easy
- Search + favorites supported

### 🔧 Refactoring

#### 1. Smart Dubbing (TTSComponent) Rewrite
- Switched from MOCK_SPEAKERS fake data to real MongoDB characters
- New sessionCache so page switching doesn't re-fetch
- Custom speakers injected into the character list
- Filesystem bidirectional sync
- CSS fully migrated to global variables — dark/light mode on demand
- Skeleton loading placeholders, no more empty voids

#### 2. Model Lifecycle Management
- New `getCurrentModel()` export — always know which model is loaded
- `ensureModelLoaded` skips if model already matches, no redundant requests
- Mode tabs pre-load models in the background
- CyberpunkLoading animation during model switches, cyberpunk aesthetic maxed
- One-Shot Clone / Voice Design also benefit from the model management

#### 3. Electron Main Process Lifecycle Rewrite
- Removed redundant `unloadTTTModel()` call on startup
- `stopMongoWorker` sends disconnect and waits 1s before killing, gives the DB some respect
- `will-quit` uses `event.preventDefault()` + async cleanup + `app.exit()` — ensures everything dies properly
- macOS: closing window stops backend, clicking Dock icon restarts it
- MongoDB URI extracted to `db.js` (gitignored), `db.example.js` template provided for copy-paste

#### 4. Voice Design Fixes
- Fixed `handleAddToSpeaker` variable scoping bug (`migrateRes` couldn't find its partner)
- Now actually calls `voxDesign` API (was just a shell before)
- Advanced params (inference steps, CFG) actually get sent to the API

### 🎨 UI/UX Polish

- Removed global `user-select: none` — finally can select text again
- Collapsible voice type / temperament tag panel in filters
- Synthesize button shows "Synthesizing…" instead of sitting there like a brick
- Dark mode adapted for all new UI elements (including One-Shot Clone)
- Removed all saveHistory junk code
- Emotion tags moved from right column to below the text input — smoother workflow: type → emotion → speaker → synthesize
- Fixed emotion tag flickering when switching speakers (no longer clear-before-load)

### 📁 New Files

```
src/
├── services/
│   ├── sessionCache.ts          # In-memory cache (new)
│   └── customSpeaker.ts         # Custom speaker CRUD (new)
db.example.js                    # MongoDB connection template (safe to commit)
db.js                            # Actual MongoDB connection (gitignored)
.gitignore updated with db.js + characters/
mongoose added to dependencies
```

### 🔧 Other Changes

- main.js: MongoDB Worker, GAME_FOLDER_MAP fix, migrate/recover IPC, removed saveHistory
- preload.js: custom speaker IPC bridge, removed saveHistory
- mongo-worker.js: removed history model
- SettingsComponent: cache management (getCacheStatus / cleanupCache)
- Deleted `src/backup.tsx`, `src/components/CrashTest.tsx`

---

## 2025-07-03

### ✨ New Features

#### 1. Multi-Character Dubbing
- Smart Dubbing now has a **Multi-Character Mode** — one character per line, add as many as you want
- Pick a different voice actor for each line, write their dialogue — the cast list shows up on the right

#### 2. Emotion Dubbing Mode
- Brand new **Emotion Mode** with 12 emotions: happy, sad, angry, gentle, calm, lively, healing, deep, energetic, sexy, serious, lazy
- Select multiple emotions for extra dramatic oomph

#### 3. Crash Test Page
- New `/crash-test` route for when you want to break things on purpose
- Three crash poses: normal exception, async error, and full-on React meltdown

#### 4. ErrorBoundary Global Protection
- Catches render errors so you never get that awful white screen
- Shows error details + stack trace, click "try again" and you're back

#### 5. CyberpunkLoading Screen
- Full-screen cyberpunk loading animation
- Customizable loading message and model name

### 🔧 Refactoring

#### 1. One-Shot Cloning (TTSComponentBeta) Overhaul
- Removed language selection, text splitting mode, speed slider — let the AI figure it out
- Switched from FormData upload to file path, now talks to the real backend
- Added `ensureModelLoaded` — unload old model, load fresh one
- CyberpunkLoading shows "Loading model…" in real time
- Text limit bumped from 300 to **5000 characters**

#### 2. Voice Design (VoiceDesign) Overhaul
- Removed speed/volume sliders and reset button — no more knob-twiddling
- Added text input for content to synthesize (up to 5000 chars)
- Prompt limit raised from 200 to **500 characters**
- Connected to real backend API (`voxDesign`), audio plays inline after synthesis
- CyberpunkLoading included for the dramatic wait

#### 3. Service Layer Fully TypeScript'd
- New `src/services/types.ts` — full TypeScript types for every API
- Unified API: `clone` / `batchClone` / `dialogue` / `voxDesign` / `voxClone` / `stt` / `getFilesList`
- Deprecated: `getTTS` / `qwen` / `getModels` / `getSpks` / `getFileLink` / `getEmotionList`
- New `ensureModelLoaded` lifecycle manager
- Auto-switches API base URL between Electron and browser
- `index_fetch.tsx` synced up — pure-fetch version gets all the new toys too

### 🎨 UI/UX Polish

- Smart Dubbing now has **mode tabs** (Single / Multi / Emotion) — easy switching
- Text input limits uniformly raised to **5000 characters** — long texts rejoice
- GitHub Issues link updated to the new repo
- Mascot feedback form textarea has `autoSize` now

### 📁 New Files

```
src/
├── services/
│   └── types.ts               # Full API types (new)
├── components/
│   ├── CrashTest.tsx           # Crash test page (new)
│   ├── CyberpunkLoading.tsx    # Cyberpunk loading (new)
│   ├── CyberpunkLoading.css    # Loading styles (new)
│   ├── ErrorBoundary.tsx       # Error boundary (new)
│   └── ErrorBoundary.css       # Error boundary styles (new)
tts_serve_mlx/                  # Python backend (new)
ELECTRON_INTEGRATION.md         # Electron integration docs (new)
api.md                          # API docs (new)
```

### 🔧 Other Changes

- `.gitignore` updated with `tts_serve_mlx` directory rule (keep folder, ignore contents)
- SidebarMenu gets `/crash-test` entry
- Router registers `/crash-test`
- `package.json` dependency bumps

---

## 2025-06-17

### ✨ New Features

#### 1. Curved Sidebar Navigation (SidebarMenu)
- A Canvas-animated arc menu that looks way fancier than it should
- Four entries: Smart Dubbing, One-Shot Cloning, Voice Design, Preferences
- Each button has an animated icon:
  - **Smart Dubbing** — Microphone with breathing glow and particles
  - **One-Shot Cloning** — DNA double-helix spinning around
  - **Voice Design** — Palette with subtle paint droplet wiggles
  - **Preferences** — Gear that just keeps turning
- Hover pops a Tooltip, active state shifts purple→amber, nice and clear

#### 2. Assistant Mascot (Bottom-Right Corner)
- Canvas-drawn cute character that blinks, breathes, and sparkles with star particles
- Click to expand: GitHub Issues link, bug report form
- Speech bubble nudges you to submit feedback

#### 3. Preferences Page (SettingsComponent)
- Dedicated component in `src/SettingsCompontent/`
- ConfigProvider unifies the purple (#7c3aed) theme
- Two sections: Appearance (theme/language) + Notifications & Privacy
- Restore Defaults and Save buttons at the bottom

### 🎨 UI/UX Polish

#### 1. Unified Visual Style
- **Card headers consistent** — deep purple text + light lavender background + rounded borders, same vibe everywhere
- **Icon system** — page titles get dynamic Canvas icons, card headers get static Ant Design icons, motion and stillness don't fight

#### 2. CSS Modularized
- Killed all inline `<style>` tags and `style={{}}` props, moved to separate CSS files
- Class names prefixed: `.mascot-*`, `.sidebar-*` — clean and tidy

#### 3. Interaction Tweaks
- **Smart Dubbing**: Added "Trending" category with flame icon, "Custom" category
- **One-Shot Cloning**: Simplified params, drag-and-drop upload, added remove button
- **Settings**: "Restore Defaults" in purple, Switch components unified to purple theme

#### 4. Routing
- Added `/settings` route
- Sidebar and routing linked up — click and it goes
- Invalid paths auto-redirect to `/tts`

### 📁 Directory Structure Changes

```
src/
├── components/           # Shared components (new)
│   ├── IconTTS.tsx      # Canvas icons
│   ├── IconClone.tsx
│   ├── IconDesign.tsx
│   ├── IconSettings.tsx
│   ├── IconTTSStatic.tsx
│   ├── IconCloneStatic.tsx
│   ├── IconDesignStatic.tsx
│   ├── Mascot.tsx       # Assistant mascot
│   ├── Mascot.css
│   ├── SidebarMenu.tsx  # Sidebar nav
│   └── SidebarMenu.css
├── SettingsCompontent/  # Settings page (new)
│   ├── index.tsx
│   └── index.css
├── TTSComponent/        # Smart Dubbing
├── TTSComponentBeta/    # One-Shot Clone
├── VoiceDesign/         # Voice Design
└── ...
```

### 🔧 Technical Improvements

- **Canvas animation system** — particles, orbital halos, breathing glows, looks cool
- **Unified theme** — ConfigProvider makes everything purple
- **CSS modular** — each component minding its own styles
- **Code cleanup** — all inline styles gone, looks respectable
