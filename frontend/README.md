# AI Collaboration Platform - Frontend

Dies ist das moderne React-Frontend für die AI Collaboration Platform, wo Claude (Anthropic) und ChatGPT (OpenAI) zusammenarbeiten.

## 🏗️ Architektur

### Frontend-Backend Kommunikation
- **Socket.io**: Echtzeit-Kommunikation für AI-Nachrichten
- **REST API**: Modell-Listen und Metadaten
- **Proxy**: Vite Development Server leitet Requests an Backend weiter

### Warum Backend-Services?
Die AI-Services (`aiServices.js` und `collaborationManager.js`) bleiben im Backend, weil:
- 🔒 **Sicherheit**: API-Keys sind nur serverseitig
- 🌐 **CORS**: Keine Browser-Restriktionen
- 🚀 **Performance**: Server-zu-Server Kommunikation

## 📁 Projektstruktur

```
frontend/
├── src/
│   ├── App.jsx              # Hauptkomponente mit Socket.io-Integration
│   ├── components/          # Modulare UI-Komponenten
│   │   ├── InfoBar.jsx      # Status, Tokens, Zeit, Export
│   │   ├── SessionControls.jsx # Start/Stop/Reset
│   │   ├── ChatPanel.jsx    # AI-Chat-Anzeige
│   │   ├── CodeExecutor.jsx # Code-Ausführung
│   │   └── MCPTools.jsx     # MCP Tool-Integration
│   └── main.jsx             # App-Einstiegspunkt
├── index.html
├── vite.config.js           # Vite-Konfiguration mit Proxy
└── package.json
```

## 🚀 Features

### Session-Management
- Start/Stop/Reset von AI-Kollaborationen
- Echtzeit-Status und Fortschritt
- Token-Tracking und Zeit-Messung

### AI-Integration
- **Claude**: Wählbare Modelle und Rollen
- **ChatGPT**: Wählbare Modelle und Rollen
- Markdown-Rendering für AI-Antworten
- Token-Anzeige pro Nachricht

### Tools & Extras
- **Code Executor**: JavaScript, Python, Shell (simuliert)
- **MCP Tools**: Erweiterbare Tool-Integration
- **Export**: Session als JSON speichern

## 🛠️ Entwicklung

### Voraussetzungen
- Node.js 18+
- Backend läuft auf Port 3000

### Installation
```bash
npm install
```

### Starten
```bash
# Backend starten (im Hauptverzeichnis)
cd .. && npm run dev

# Frontend starten (in diesem Verzeichnis)
npm run dev
```

### Build
```bash
npm run build
```

## 🔌 Socket.io Events

### Client → Server
- `start_task`: Startet neue AI-Kollaboration
- `stop_task`: Stoppt laufende Session

### Server → Client
- `chat_message`: AI-Nachrichten und System-Updates
- `error_message`: Fehler-Benachrichtigungen

## 🎨 Komponenten

### InfoBar
Zeigt Session-Status, Tokens, Zeit und Iterationen. Ermöglicht JSON-Export.

### SessionControls
Buttons für Start, Stop und Reset der AI-Session.

### ChatPanel
Zeigt AI-Nachrichten mit Markdown-Rendering. Erlaubt Modell- und Rollenwahl.

### CodeExecutor
Führt Code in verschiedenen Sprachen aus (JavaScript nativ, andere simuliert).

### MCPTools
Erweiterbare Tool-Integration für zusätzliche Funktionalitäten.

## 🔐 Sicherheit

- API-Keys werden **niemals** im Frontend gespeichert
- Alle AI-API-Calls laufen über das Backend
- Socket.io-Verbindung ist authentifiziert

## 📝 Notizen

- Das Frontend ist für moderne Browser optimiert
- Responsive Design für Desktop-Nutzung
- Inline-Styles für einfache Anpassung
