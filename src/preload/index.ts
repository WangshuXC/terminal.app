import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  IPC_CHANNELS,
  SshConnectOptions,
  SshResizeOptions,
  SshStatusPayload,
  SshLogPayload,
  SshErrorPayload,
  SshOutputPayload,
  SshExitPayload,
  SftpConnectOptions,
  SftpListOptions,
  SftpUploadOptions,
  SftpDownloadOptions,
  SftpFileOperation,
  SftpChmodOptions,
  SftpStatusPayload,
  SftpErrorPayload,
  SftpProgressPayload,
  LocalListOptions,
  LocalFileOperation,
  LocalChmodOptions
} from '../shared/types'

// SSH API
const sshApi = {
  connect: (options: SshConnectOptions): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SSH_CONNECT, options)
  },

  write: (id: string, data: string): void => {
    ipcRenderer.send(IPC_CHANNELS.SSH_WRITE, { id, data })
  },

  resize: (options: SshResizeOptions): void => {
    ipcRenderer.send(IPC_CHANNELS.SSH_RESIZE, options)
  },

  disconnect: (id: string): void => {
    ipcRenderer.send(IPC_CHANNELS.SSH_DISCONNECT, id)
  },

  onStatus: (callback: (payload: SshStatusPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SshStatusPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SSH_STATUS, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SSH_STATUS, handler)
    }
  },

  onLog: (callback: (payload: SshLogPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SshLogPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SSH_LOG, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SSH_LOG, handler)
    }
  },

  onError: (callback: (payload: SshErrorPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SshErrorPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SSH_ERROR, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SSH_ERROR, handler)
    }
  },

  onOutput: (callback: (payload: SshOutputPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SshOutputPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SSH_OUTPUT, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SSH_OUTPUT, handler)
    }
  },

  onExit: (callback: (payload: SshExitPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SshExitPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SSH_EXIT, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SSH_EXIT, handler)
    }
  }
}

// SFTP API
const sftpApi = {
  connect: (options: SftpConnectOptions): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SFTP_CONNECT, options)
  },

  disconnect: (id: string): void => {
    ipcRenderer.send(IPC_CHANNELS.SFTP_DISCONNECT, id)
  },

  list: (options: SftpListOptions) => {
    return ipcRenderer.invoke(IPC_CHANNELS.SFTP_LIST, options)
  },

  upload: (options: SftpUploadOptions) => {
    return ipcRenderer.invoke(IPC_CHANNELS.SFTP_UPLOAD, options)
  },

  download: (options: SftpDownloadOptions) => {
    return ipcRenderer.invoke(IPC_CHANNELS.SFTP_DOWNLOAD, options)
  },

  delete: (options: SftpFileOperation) => {
    return ipcRenderer.invoke(IPC_CHANNELS.SFTP_DELETE, options)
  },

  mkdir: (options: SftpFileOperation) => {
    return ipcRenderer.invoke(IPC_CHANNELS.SFTP_MKDIR, options)
  },

  rename: (options: SftpFileOperation) => {
    return ipcRenderer.invoke(IPC_CHANNELS.SFTP_RENAME, options)
  },

  chmod: (options: SftpChmodOptions) => {
    return ipcRenderer.invoke(IPC_CHANNELS.SFTP_CHMOD, options)
  },

  onStatus: (callback: (payload: SftpStatusPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SftpStatusPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SFTP_STATUS, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SFTP_STATUS, handler)
    }
  },

  onError: (callback: (payload: SftpErrorPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SftpErrorPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SFTP_ERROR, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SFTP_ERROR, handler)
    }
  },

  onProgress: (callback: (payload: SftpProgressPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SftpProgressPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SFTP_PROGRESS, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SFTP_PROGRESS, handler)
    }
  }
}

// Local file API
const localApi = {
  getHome: () => {
    return ipcRenderer.invoke('local:home')
  },

  list: (options: LocalListOptions) => {
    return ipcRenderer.invoke(IPC_CHANNELS.LOCAL_LIST, options)
  },

  delete: (options: LocalFileOperation) => {
    return ipcRenderer.invoke(IPC_CHANNELS.LOCAL_DELETE, options)
  },

  mkdir: (options: LocalFileOperation) => {
    return ipcRenderer.invoke(IPC_CHANNELS.LOCAL_MKDIR, options)
  },

  rename: (options: LocalFileOperation) => {
    return ipcRenderer.invoke(IPC_CHANNELS.LOCAL_RENAME, options)
  },

  chmod: (options: LocalChmodOptions) => {
    return ipcRenderer.invoke(IPC_CHANNELS.LOCAL_CHMOD, options)
  }
}

// 使用 contextBridge API 将 Electron API 暴露给渲染进程
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('sshApi', sshApi)
    contextBridge.exposeInMainWorld('sftpApi', sftpApi)
    contextBridge.exposeInMainWorld('localApi', localApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (在 dts 中定义)
  window.electron = electronAPI
  // @ts-ignore (在 dts 中定义)
  window.sshApi = sshApi
  // @ts-ignore (在 dts 中定义)
  window.sftpApi = sftpApi
  // @ts-ignore (在 dts 中定义)
  window.localApi = localApi
}
