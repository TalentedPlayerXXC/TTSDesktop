[中文](README.md) | [English](README_EN.md)

> **⚠️ Disclaimer**: This software is intended for learning, research, and personal lawful use only. Any use for fraud, impersonation, voice forgery, or any other illegal activity is strictly prohibited. Users assume full legal responsibility for their actions. (Yes, we have to say it. Move along.)

# TTS Desktop

> Make words talk and give voices a soul ✨

A desktop dubbing client built with Electron + React — **Smart Dubbing · Voice Cloning · Voice Design** all in one.

The author is a clueless frontend dev who writes code like spaghetti, but hey, it works (mostly). (Does it though? 👀) If you find a bug, congratulations — you've discovered a hidden feature.

## Features

- **🎬 Smart Dubbing** — Solo, Multi-Character, and Emotion modes at your fingertips. Search and filter through 296+ voice actors, mark favorites, and add custom speakers. Emotion tags are automatically parsed from audio filenames
- **🎭 One-Shot Cloning** — Throw in a reference audio and the AI will copy the voice faster than you can say "wait, that's illegal" (needs the `tts_serve_mlx` backend buddy)
- **🎨 Voice Design** — No sliders, no knobs. Just type "a gentle, warm female voice" and the AI builds it on the fly. Advanced params (inference steps, CFG) included
- **📦 Custom Speakers** — One-click add from Voice Design to your speaker list, use them like any other character
- **⚙️ Preferences** — Themes, language, cache management. Make it yours
- **🛡️ Error Boundary** — Page crashed? No big deal. One click and you're back in business. (Even the author uses this regularly.)

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

## Changelog

Curious what the author broke this time? 👉 [UPDATE.md](./UPDATE.md)

## 更新日志

想看中文？👉 [UPDATE.md](./UPDATE.md)

## About the Author

A frontend chicken who got elbowed out of the team for slacking off and writing terrible code. Was deep in a keyframing session last year when a thought hit: "nobody watches my stupid animations anyway, might as well build a dubbing thing." So here we are. It works. Probably. Gradually improving? Yeah right (Arena Breakout: Infinite, launching! Delta Force, launching!).

**Tech Credits:**
- 🎨 Animations - Teacher Da D
- 🧠 Core logic - Some unreliable guy (that's me)
