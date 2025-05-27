# AI Collaboration Platform

A web-based platform where two AIs (Claude by Anthropic and ChatGPT by OpenAI) autonomously collaborate on programming tasks. One AI acts as the programmer, the other as reviewer. The system is designed for extensibility, transparency, and real-time interaction.

---

## Features
- **Live Modellauswahl:** Wähle für beide KIs (Claude & ChatGPT) das Modell aus einer aktuellen Liste.
- **Zweistufige Kollaboration:** Claude (Programmierer) und ChatGPT (Reviewer) arbeiten iterativ an einer Aufgabe.
- **Token-Tracking:** Pro Nachricht und als Gesamtsumme werden die genutzten Tokens angezeigt.
- **Markdown-fähige Ausgaben:** KI-Antworten werden als Markdown gerendert (inkl. Code, Listen, Formatierungen).
- **Initialisierungsprompt:** KIs werden nur kurz und neutral initialisiert ("Du bist Claude/ChatGPT ... du kannst in Markdown antworten.").
- **Responsives, modernes UI:** Chat-Bubbles, Turn-Indikator, Session-Timer, Iterationszähler, Icons statt Namen.
- **Fehler- und Statusanzeigen:** Transparente Logs im Backend und im UI.

---

## Setup
1. **.env anlegen:**
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-...
   PORT=3000
   ```
2. **Abhängigkeiten installieren:**
   ```
   npm install
   ```
3. **Server starten:**
   ```
   npm run dev
   # oder
   node server.js
   ```
4. **Im Browser öffnen:**
   [http://localhost:3000](http://localhost:3000)

---

## Bedienung
- **Modellauswahl:** Wähle für beide KIs das gewünschte Modell.
- **Task eingeben:** Beschreibe die Programmieraufgabe und starte die Kollaboration.
- **Live-Chat:** Verfolge die KI-Konversation, Tokenverbrauch, Status und Zeit.
- **Markdown:** KI-Antworten werden formatiert angezeigt.

---

## Aktueller Stand (Juni 2024)
- Zwei KIs (Claude & ChatGPT) arbeiten autonom an einer Aufgabe.
- Modellauswahl, Token-Tracking, Markdown, modernes UI, Logging.
- Keine User-Systemprompts, KIs sind "unvoreingenommen" (nur Identität/Markdown-Hinweis als Prompt).
- Fehlerbehandlung und Transparenz auf allen Ebenen.

---

## Vorschläge für die Weiterentwicklung
- **Multi-User & Sessions:** Parallele Sessions, History, User-Accounts.
- **Export:** Download der Konversation als Markdown, PDF, JSON.
- **Plugins/Tools:** Integration von Code-Executors, Tests, Linter, etc.
- **Weitere LLMs:** Google Gemini, Mistral, Cohere, etc.
- **Langzeit-Session-Management:** Fortsetzen, Pausieren, Resume.
- **KI-Rollen dynamisch im Verlauf ändern.**
- **API-Usage/Cost-Tracking pro User.**
- **Erweiterte UI:** Dark Mode, Themes, Drag&Drop, etc.
- **Automatisierte Tests für Kollaborations-Workflows.**

---

## Feedback & Mitmachen
Pull Requests, Issues und Ideen sind willkommen!
