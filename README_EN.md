[中文](README.md) | [English](README_EN.md)

> **⚠️ Disclaimer**: This software is intended for learning, research, and personal lawful use only. Any use for fraud, impersonation, voice forgery, or any other illegal activity is strictly prohibited. Have fun, but don't cross the line — I can't bail you out 🙏

# 绘声

> Make words talk and give voices a soul ✨

Turn your computer into a dubbing studio in one second. **Smart Dubbing · Voice Cloning · Voice Design · Sound Workshop · Multi-Character** — all running locally, no cloud, no extra cost (electricity bill not included). Models auto-download on first launch, no manual foraging on ModelScope.

Built with Electron + React + Tone.js. **Apple Silicon only** — don't bother with Intel, it's not gonna happen 🤡.

The author is a clueless frontend dev who writes code like spaghetti, but hey, can't stop tinkering. If you find a bug, congratulations — you've discovered a hidden feature. Every time you open the app, a random meme tagline drops in with a typewriter effect. Click it for a new one 👇

**"feature is a bonus bug-方休"**
**"console.log cures everything-方休"**
**"ship it now, patch it later-方休"**
**"not a crash, it's a feature-方休"**
**…29 flavors of developer humor**

📢 **Changelog:** Curious what the author broke this time? 👉 [UPDATE.md](./UPDATE.md)

## Features

- **🎬 Smart Dubbing** — Solo monologue, multi-character banter, or emotional outburst — three modes for every mood. Browse 349+ voice actors, mark favorites, add custom speakers. Emotion tags auto-parsed from filenames (happy/angry/sad/shy), no manual typing
- **🎭 One-Shot Cloning** — Toss in a reference audio and the AI will mimic the voice faster than you can say "wait, that's illegal" (needs the tts_serve_mlx backend slave laboring away)
- **🎨 Voice Design** — No knobs to twist. Just type "a gentle, warm female voice" and the AI builds it on the fly. Power users can tweak inference steps and CFG too
- **📦 Custom Speakers** — One-click save from Voice Design to your speaker list. Use them like any built-in character, no begging required
- **🎛️ Sound Workshop** (added 2026-07-13) — Drop in any audio, add real-time DSP effects (echo/pitch/distortion/reverb… 13 total), export fully processed WAV. All effects built with native Web Audio — no silent exports here
- **💬 Chat Bubble Multi-Character** (added 2026-07-14) — Finally killed that clunky dropdown editor. Write dialogues like texting, click a character and emotions auto-fill, synthesize in one flow
- **⚙️ Preferences** — Themes, language, cache nuke. Make it yours
- **🛡️ Error Boundary** — Page crashed? One click and you're back. Even the author uses this regularly (for real this time)

## Tech Stack

Electron · React 19 · TypeScript · Vite 6 · Ant Design 6 · react-router 7 · Axios  
(Looks impressive on paper. In practice, the author debugs exclusively with `console.log`.)

## Getting Started

```bash
# Build and launch (one-stop shop)
npm run preview

# Development mode (two terminals, best enjoyed with a coffee)
npm run dev                        # Vite dev server
NODE_ENV=development npm start     # Electron
```

## 更新日志

想看中文？👉 [UPDATE.md](./UPDATE.md)

## About the Author

A frontend chicken who got elbowed out of the team for slacking off and writing terrible code. Was deep in a keyframing session last year when a thought hit: "nobody watches my stupid animations anyway, might as well build a dubbing thing." So here we are. It works. Probably. Gradually improving? Yeah right (Arena Breakout: Infinite, launching! Delta Force, launching!).

**Tech Credits:**
- 🎨 Animations - Teacher Da D
- 🧠 Core logic - Some unreliable guy (that's me)
