# 绘声 User Guide

> Make words talk and give voices a soul ✨

## Contents

1. [Installation](#1-installation)
2. [Quick Start](#2-quick-start)
3. [Smart Dubbing](#3-smart-dubbing)
4. [One-Click Cloning](#4-one-click-cloning)
5. [Voice Design](#5-voice-design)
6. [Custom Speakers](#6-custom-speakers)
7. [Settings](#7-settings)
8. [FAQ](#8-faq)

---

## 1. Installation

### macOS

1. Double-click `绘声-1.0.0-arm64.dmg`
2. Drag **绘声** into Applications
3. If "unidentified developer" → **right-click app → Open**
4. If "damaged" → double-click **修复.command**

### Notes

- First launch loads ~5.2GB ML models
- Ensure port 8000 free: `lsof -ti:8000 | xargs kill`

---

## 2. Quick Start

- **Keyword search** — find characters
- **Voice filter** — All / Male / Female
- **Tag filter** — voice type & temperament
- **Favorites** — star them

---

## 3. Smart Dubbing

- **Single 🎤** — type text → pick character → synthesize
- **Multi 🗣️** — add roles → assign → type lines → synthesize
- **Emotion 🎭** — type → character → emotion → synthesize (VoxCPM2)

---

## 4. One-Click Cloning 🎭

Enter character → type line → synthesize.

---

## 5. Voice Design 🎨

Describe voice → set steps/CFG → generate → add to speakers.

---

## 6. Custom Speakers 📦

- **Delete** — remove `characters/自定义/<name>/`
- **Restore** — "Clean & Rebuild" in Settings

---

## 7. Settings ⚙️

- **Theme** — Light / Dark
- **Cache** — view / clean

---

## 8. FAQ

### Q: App won't open?

**A:**
- "Unidentified developer" → **right-click app → Open**
- "Damaged" → double-click **修复.command**
- Port conflict → `lsof -ti:8000 | xargs kill`

### Q: No audio?

Check model loaded (terminal logs), system volume, try different character.

### Q: Custom speakers missing?

"Clean & Rebuild" in Settings.

---

> **Disclaimer**: For lawful personal use only.
