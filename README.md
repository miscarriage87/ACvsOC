# AI Collaboration Platform — Claude × ChatGPT

A full-stack application where two large-language-models (LLMs) – **Claude (Anthropic)** acting as the *Programmer* and **ChatGPT (OpenAI)** acting as the *Reviewer* – collaborate autonomously on programming tasks.  
The 2025 rebuild introduces an elegant **React + Material-UI** front-end with glassmorphism aesthetics, dark/light themes, framer-motion micro-interactions and a refined Node / Express / Socket.IO backend.

---

## ✨ Key Highlights (2025 Rebuild)

| Area | Improvements |
|------|--------------|
| Front-End | • React 18 + Vite • Material-UI 5 design system • Glassmorphism cards • Responsive layout • Dark / Light switch • Framer-motion animations |
| Real-Time | • Socket.IO duplex channel • Typing / turn indicators • Live token + iteration counters • Session timer |
| Collaboration | • Two-stage loop (Claude → ChatGPT) • Up to 8 iterations / 3 min default • Auto-run or step mode |
| UX Power-Ups | • Markdown rendering with syntax highlighting • Code blocks themed • Token usage progress bar • Export conversation (Markdown / JSON / Clipboard) |
| Ops & DX | • Split dev servers (nodemon + Vite) • One-command prod build • Health endpoints • API connectivity check • ESLint / Prettier ready |

---

## 📸 Screenshots

> _Add screenshots or screen recordings here._
> ```
> /docs/screenshots
> ├── landing-dark.png
> ├── landing-light.png
> └── chat-session.gif
> ```

---

## 🗺️ Architecture Overview

```
Browser (React + MUI + Socket.IO-client)
        │
        ▼
┌────────────────────────┐
│  Node/Express Server   │  REST: /api/models /api/health
│  • socket.io           │◀──────────────────────────────┐
│  • ClaudeService       │      Bi-directional WebSocket │
│  • ChatGPTService      │      (events + streams)       │
│  • AICollaborationMgr  │                              Browser
└────────────────────────┘
```

* **ClaudeService** – thin wrapper around Anthropic Messages API  
* **ChatGPTService** – wrapper around OpenAI Chat Completions API  
* **AICollaborationSession** – orchestrates iteration loop, token tracking, state & timeout  

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/miscarriage87/ACvsOC.git
cd ACvsOC
npm run setup          # installs backend & frontend deps
```

### 2. Configure API Keys

Create `.env` in project root:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PORT=3000               # optional
```

### 3. Development Mode

```bash
npm run dev:all         # concurrently: nodemon backend + Vite frontend
# Frontend http://localhost:5173
# Backend  http://localhost:3000/api/health
```

Hot-reload everywhere.

### 4. Production Build

```bash
npm run build           # bundles React into /frontend/dist
npm run start:prod      # serves built assets via Express on PORT
```

Open _http://localhost:3000_.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Backend (nodemon) only |
| `npm run dev:frontend` | Front-end Vite dev-server |
| `npm run dev:all` | Both above concurrently |
| `npm run build` | Create production React bundle |
| `npm start` | Start Express (NODE_ENV respected) |
| `npm run start:prod` | Force production server |
| `npm run lint` / `lint:frontend` | ESLint checks |
| `npm run clean` | Remove node_modules & build artifacts |

---

## 🧩 Feature List

- **Model Picker** – dynamic fetch of available Claude & GPT models  
- **Glassmorphism UI** – soft-blur cards, gradient outlines  
- **Dark / Light Themes** – instant toggle, saved to `localStorage`  
- **Real-Time Chat** – live message streaming, typing indicators  
- **Token Analytics** – per-message badge & aggregate bar with colour thresholds  
- **Iteration & Timer** – visual progress + auto-stop limits  
- **Export** – Markdown / JSON files or clipboard copy  
- **Health Checks** – backend `/api/health`, start-script API probes  
- **Accessibility** – keyboard navigation, focus rings, semantic markup  
- **Performance** – code-splitting, font preloads, HTTP/2 hints  

---

## 🛠️ Technology Stack

| Layer | Tech |
|-------|------|
| Front-End | React 18, Vite 5, Material-UI 5, Emotion, Framer-motion, Socket.IO-client, Marked, Prism-react-renderer |
| Back-End | Node.js ≥18, Express 4, Socket.IO 4, Axios, dotenv |
| Styling | CSS-in-JS (Emotion) + global CSS tokens |
| Tooling | ESLint, Nodemon, Concurrently, Rimraf |
| Cloud LLMs | Anthropic Claude v3, OpenAI GPT-3.5 / 4 |

---

## 🔧 Development Workflow

1. `npm run dev:all` – start full stack  
2. Edit React components – live HMR via Vite  
3. Modify backend – nodemon restarts server  
4. Write tests (coming soon)  
5. `npm run lint:all` before committing  
6. Submit PR → automatic checks (CI pipeline TBD)

---

## ☁️ Production Deployment Guide

1. Set environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `PORT`).  
2. `npm run build` – bundles front-end.  
3. Optional: `docker build -t ai-collab .` (Dockerfile sample in `/deploy`).  
4. Run with `npm run start:prod` or deploy container to your cloud of choice.

---

## 🆘 Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing ANTHROPIC_API_KEY` on start | Check `.env` spelling and path |
| `CORS` errors in console | Ensure both servers run on allowed origins |
| Blank page after build | Re-run `npm run build`, verify `/frontend/dist` exists |
| High latency / 429 errors | Lower max iterations or upgrade API plan |
| Socket disconnects | Reverse proxy must support WebSockets (`upgrade` header) |

---

## 🤝 Contributing

1. Fork ➜ create feature branch (`git checkout -b feat/awesome`)  
2. Follow **Airbnb** style (ESLint pre-configured)  
3. Add/update unit tests if applicable  
4. Open Pull Request with clear description & screenshots  
5. Please sign the CLA if prompted  

Looking for issues? See [**good first issue**](https://github.com/miscarriage87/ACvsOC/labels/good%20first%20issue).

---

## ⚡ Performance Notes

- Vite + ESBuild for ultra-fast dev startup  
- Production bundle minified & chunk-split  
- Font & asset preloading, lazy code-highlight library  
- Memoised React components & virtualised chat list (planned)  
- Cache-control headers served by Express in prod  

---

## ♿ Accessibility Features

- WCAG-compliant colour ratios in both themes  
- Keyboard navigable interactive elements  
- `aria-label`s & roles for dynamic components  
- Reduced-motion respects `prefers-reduced-motion`  

---

## 📄 License

[MIT](LICENSE) © 2025—present

> Crafted with ❤️ and lots of tokens.
