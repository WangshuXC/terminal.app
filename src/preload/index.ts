import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS, PtyCreateOptions, PtyResizeOptions } from '../shared/types'

// Terminal API for renderer
const terminalApi = {
  // Create a new PTY instance
  createPty: (options: PtyCreateOptions): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.PTY_CREATE, options)
  },

  // Send data to PTY
  writePty: (id: string, data: string): void => {
    ipcRenderer.send(IPC_CHANNELS.PTY_DATA, { id, data })
  },

  // Resize PTY
  resizePty: (options: PtyResizeOptions): void => {
    ipcRenderer.send(IPC_CHANNELS.PTY_RESIZE, options)
  },

  // Destroy PTY
  destroyPty: (id: string): void => {
    ipcRenderer.send(IPC_CHANNELS.PTY_DESTROY, id)
  },

  // Listen for PTY output
  onPtyOutput: (callback: (data: { id: string; data: string }) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { id: string; data: string }) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.PTY_OUTPUT, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.PTY_OUTPUT, handler)
    }
  },

  // Listen for PTY exit
  onPtyExit: (callback: (data: { id: string; exitCode: number }) => void): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: { id: string; exitCode: number }
    ) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.PTY_EXIT, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.PTY_EXIT, handler)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('terminalApi', terminalApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.terminalApi = terminalApi
}
