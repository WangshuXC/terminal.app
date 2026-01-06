import { ElectronAPI } from '@electron-toolkit/preload'
import { PtyCreateOptions, PtyResizeOptions } from '../shared/types'

interface TerminalApi {
  createPty: (options: PtyCreateOptions) => Promise<boolean>
  writePty: (id: string, data: string) => void
  resizePty: (options: PtyResizeOptions) => void
  destroyPty: (id: string) => void
  onPtyOutput: (callback: (data: { id: string; data: string }) => void) => () => void
  onPtyExit: (callback: (data: { id: string; exitCode: number }) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    terminalApi: TerminalApi
  }
}
