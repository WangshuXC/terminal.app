// IPC Channel names
export const IPC_CHANNELS = {
  PTY_CREATE: 'pty:create',
  PTY_DATA: 'pty:data',
  PTY_RESIZE: 'pty:resize',
  PTY_DESTROY: 'pty:destroy',
  PTY_OUTPUT: 'pty:output',
  PTY_EXIT: 'pty:exit'
} as const

// PTY creation options
export interface PtyCreateOptions {
  id: string
  cols: number
  rows: number
}

// PTY resize options
export interface PtyResizeOptions {
  id: string
  cols: number
  rows: number
}

// PTY data payload
export interface PtyDataPayload {
  id: string
  data: string
}

// PTY exit payload
export interface PtyExitPayload {
  id: string
  exitCode: number
}
