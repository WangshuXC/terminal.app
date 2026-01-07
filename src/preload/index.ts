import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  IPC_CHANNELS,
  PtyCreateOptions,
  PtyResizeOptions,
  SshConnectOptions,
  SshResizeOptions,
  SshStatusPayload,
  SshLogPayload,
  SshErrorPayload,
  SshOutputPayload,
  SshExitPayload
} from '../shared/types'

// 渲染进程终端 API
const terminalApi = {
  // 创建新的 PTY 实例
  createPty: (options: PtyCreateOptions): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.PTY_CREATE, options)
  },

  // 向 PTY 发送数据
  writePty: (id: string, data: string): void => {
    ipcRenderer.send(IPC_CHANNELS.PTY_DATA, { id, data })
  },

  // 调整 PTY 大小
  resizePty: (options: PtyResizeOptions): void => {
    ipcRenderer.send(IPC_CHANNELS.PTY_RESIZE, options)
  },

  // 销毁 PTY
  destroyPty: (id: string): void => {
    ipcRenderer.send(IPC_CHANNELS.PTY_DESTROY, id)
  },

  // 监听 PTY 输出
  onPtyOutput: (callback: (data: { id: string; data: string }) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { id: string; data: string }) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.PTY_OUTPUT, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.PTY_OUTPUT, handler)
    }
  },

  // 监听 PTY 退出
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

// 渲染进程 SSH API
const sshApi = {
  // 连接 SSH 服务器
  connect: (options: SshConnectOptions): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SSH_CONNECT, options)
  },

  // 向 SSH 写入数据
  write: (id: string, data: string): void => {
    ipcRenderer.send(IPC_CHANNELS.SSH_WRITE, { id, data })
  },

  // 调整 SSH 终端大小
  resize: (options: SshResizeOptions): void => {
    ipcRenderer.send(IPC_CHANNELS.SSH_RESIZE, options)
  },

  // 断开 SSH 连接
  disconnect: (id: string): void => {
    ipcRenderer.send(IPC_CHANNELS.SSH_DISCONNECT, id)
  },

  // 监听 SSH 状态更新
  onStatus: (callback: (payload: SshStatusPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SshStatusPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SSH_STATUS, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SSH_STATUS, handler)
    }
  },

  // 监听 SSH 日志
  onLog: (callback: (payload: SshLogPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SshLogPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SSH_LOG, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SSH_LOG, handler)
    }
  },

  // 监听 SSH 错误
  onError: (callback: (payload: SshErrorPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SshErrorPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SSH_ERROR, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SSH_ERROR, handler)
    }
  },

  // 监听 SSH 输出
  onOutput: (callback: (payload: SshOutputPayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: SshOutputPayload) => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.SSH_OUTPUT, handler)
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SSH_OUTPUT, handler)
    }
  },

  // 监听 SSH 退出
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

// 使用 contextBridge API 将 Electron API 暴露给渲染进程
// 仅在启用上下文隔离时使用，否则直接添加到 DOM 全局对象
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('terminalApi', terminalApi)
    contextBridge.exposeInMainWorld('sshApi', sshApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (在 dts 中定义)
  window.electron = electronAPI
  // @ts-ignore (在 dts 中定义)
  window.terminalApi = terminalApi
  // @ts-ignore (在 dts 中定义)
  window.sshApi = sshApi
}
