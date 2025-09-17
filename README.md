# Podomodoro | Focus Timer

A modern, minimal Pomodoro timer built with web technologies and wrapped in Electron. It features customizable session lengths, beautiful backgrounds (URL or image upload), Spotify playlist embedding, desktop notifications, and a custom frameless title bar.

## Features

- **Pomodoro Workflow**: `pomodoro`, `short break`, and `long break` modes with adjustable durations.
- **Persistent Backgrounds**:
  - Paste a background URL or upload an image; your choice is saved using `localStorage` and survives reset/restart.
  - On Electron, a native file dialog is available for choosing images.
- **Spotify Embed**:
  - Change the playlist via a modal; the chosen playlist is persisted across sessions.
- **Desktop Notifications**:
  - A notification is shown when a session ends (Pomodoro or Break), plus an audible chime.
- **Custom Title Bar (Frameless)**:
  - Minimize, Maximize/Restore, and Close buttons with a draggable header, implemented securely via preload + IPC.
- **Keyboard Shortcuts**:
  - Space: start/pause, R: reset, 1/2/3: switch modes.

## Getting Started

### Prerequisites
- Node.js 18+ recommended

### Install
```bash
npm install
```

### Run (Electron)
```bash
npm start
```
This launches Electron and loads `src/index.html` in a frameless window.

### Build a portable app (Windows)
Using electron-packager (already in devDependencies):
```bash
npx electron-packager . pomodoroapp
```
The packaged app will be generated in `pomodoroapp-win32-x64/`.

## Project Structure

```
pomodoro-timer/
├─ main.js               # Electron main process (frameless window, IPC)
├─ preload.js            # Secure bridge: expose limited APIs to renderer
├─ package.json          # Scripts and dependencies
├─ src/
│  ├─ index.html         # UI layout, settings modal, custom title bar
│  ├─ script.js          # Timer logic, notifications, persistence, IPC wiring
│  ├─ input.css          # Tailwind input
│  └─ output.css         # Tailwind build output
└─ README.md
```

## Key Implementation Notes

- **Persistence**
  - Background image (URL or uploaded Data URL) is stored in `localStorage` under `bgImage`.
  - Spotify playlist embed URL is stored under `spotifyPlaylist`.

- **Electron Security**
  - `contextIsolation: true` and `nodeIntegration: false`.
  - `preload.js` exposes a minimal API: `chooseBackground()` and `windowControls`.
  - File selection and window management are handled via IPC in `main.js`.

## Keyboard Shortcuts

- `Space` — Start/Pause
- `R` — Reset
- `1` — Pomodoro
- `2` — Short Break
- `3` — Long Break

## Troubleshooting

- If notifications don’t appear, ensure notification permission is granted (Electron usually allows it). The app also plays an audible chime.
- Very large images may exceed `localStorage` size limits. Consider using smaller images or an external image URL.

## License

MIT (or your preferred license).

