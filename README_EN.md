[中文](README.md) | [English](README_EN.md)

> **⚠️ Disclaimer**: This software is intended for learning, research, and personal lawful use only. Any use for fraud, impersonation, voice forgery, or any other illegal activity is strictly prohibited. Users assume full legal responsibility for their actions. (Yes, we have to say it. Move along.)

# TTS Desktop

> Make words talk and give voices a soul ✨

A desktop dubbing client built with Electron + React — **Smart Dubbing · Voice Cloning · Voice Design** all in one.

The author is a clueless frontend dev who writes code like spaghetti, but hey, it works (mostly). If you find a bug, congratulations — you've discovered a hidden feature.

## Features

- **🎬 Smart Dubbing** — Solo dubbing too boring? Try **Multi-Character Mode**: pick different voices and let them argue with each other. Or switch on **Emotion Mode** — happy, sad, angry, just pick your mood and go full method acting
- **🎭 One-Shot Cloning** — Throw in a reference audio and the AI will copy the voice faster than you can say "wait, that's illegal" (needs the `tts_serve_mlx` backend buddy)
- **🎨 Voice Design** — No sliders, no knobs. Just type "a gentle, warm female voice" and the AI builds it on the fly
- **⚙️ Preferences** — Themes, language, notifications. Make it yours
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

A frontend refugee forced to learn Electron by a pushy product manager. The code runs, that's good enough. Optimization? Never heard of her.
