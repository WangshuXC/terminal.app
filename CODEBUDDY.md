# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## Commands

| Command               | Description                                        |
| --------------------- | -------------------------------------------------- |
| `npm install`         | Install dependencies                               |
| `npm run dev`         | Start development server with hot reload           |
| `npm run build`       | Type-check and build for production                |
| `npm run build:mac`   | Build macOS app package                            |
| `npm run build:win`   | Build Windows app package                          |
| `npm run build:linux` | Build Linux app package                            |
| `npm run lint`        | Run ESLint with cache                              |
| `npm run format`      | Format code with Prettier                          |
| `npm run typecheck`   | Run TypeScript type checking for both node and web |

## Architecture

This is an **Electron + React + TypeScript** SSH client application using **electron-vite** for build tooling. The app provides SSH remote connection capabilities.

### Process Architecture (Electron Three-Process Model)

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                           │
│  src/main/index.ts      - Window management, IPC handlers   │
│  src/main/sshManager.ts - SSH connections (ssh2)            │
└─────────────────────────────────────────────────────────────┘
                              │
                    IPC (contextBridge)
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Preload Process                         │
│  src/preload/index.ts   - Exposes sshApi                    │
│  src/preload/index.d.ts - TypeScript declarations           │
└─────────────────────────────────────────────────────────────┘
                              │
                     window.sshApi
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process                         │
│  src/renderer/src/      - React application                 │
└─────────────────────────────────────────────────────────────┘
```

### IPC Communication

All IPC channels are defined in `src/shared/types.ts` via `IPC_CHANNELS` constant. Key patterns:

- **SSH channels**: `ssh:connect`, `ssh:write`, `ssh:resize`, `ssh:disconnect`, `ssh:output`, `ssh:status`, `ssh:log`, `ssh:error`, `ssh:exit`

The preload script (`src/preload/index.ts`) wraps these into the API:

- `window.sshApi` - SSH connection operations

### Renderer Architecture

**State Management**: Jotai atoms in `src/renderer/src/store/`

- `tabs.ts` - Multi-tab state (vaults/ssh tabs)
- `hosts.ts` - SSH host configurations

**Module Pattern**: Each feature is a self-contained module in `src/renderer/src/modules/`

- `entry/` - Main entry with sidebar navigation (Hosts, Logs, Settings pages)
- `ssh/` - SSH connection with status UI and xterm.js terminal

**Tab System**: App.tsx renders tabs based on type, keeping all SSH instances alive (display:none when inactive) to preserve session state.

### Key Dependencies

- **xterm.js** (`@xterm/xterm`) - Terminal emulator UI
- **ssh2** - SSH2 client for remote connections
- **Jotai** - Atomic state management
- **Tailwind CSS v4** - Styling via `@tailwindcss/vite` plugin
- **motion** - Animations

### Path Aliases

Configured in `electron.vite.config.ts`:

- `@` → `src/renderer/src`
- `@renderer` → `src/renderer/src`
