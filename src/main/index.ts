import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ptyManager } from './ptyManager'
import { sshManager } from './sshManager'
import {
  IPC_CHANNELS,
  PtyCreateOptions,
  PtyResizeOptions,
  SshConnectOptions,
  SshResizeOptions
} from '../shared/types'

function createWindow(): void {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#F5F5F5',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于 electron-vite cli 的渲染进程热更新
  // 开发环境加载远程 URL，生产环境加载本地 HTML 文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
// 某些 API 只能在此事件发生后使用
app.whenReady().then(() => {
  // 设置 Windows 应用程序用户模型 ID
  electronApp.setAppUserModelId('com.electron')

  // 开发环境下按 F12 打开/关闭 DevTools
  // 生产环境下忽略 CommandOrControl + R
  // 参见 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC 测试
  ipcMain.on('ping', () => console.log('pong'))

  // PTY IPC 处理器
  ipcMain.handle(IPC_CHANNELS.PTY_CREATE, (event, options: PtyCreateOptions) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return false
    return ptyManager.create(options, window)
  })

  ipcMain.on(IPC_CHANNELS.PTY_DATA, (_, { id, data }: { id: string; data: string }) => {
    ptyManager.write(id, data)
  })

  ipcMain.on(IPC_CHANNELS.PTY_RESIZE, (_, options: PtyResizeOptions) => {
    ptyManager.resize(options)
  })

  ipcMain.on(IPC_CHANNELS.PTY_DESTROY, (_, id: string) => {
    ptyManager.destroy(id)
  })

  // SSH IPC 处理器
  ipcMain.handle(IPC_CHANNELS.SSH_CONNECT, async (event, options: SshConnectOptions) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return false
    return sshManager.connect(options, window)
  })

  ipcMain.on(IPC_CHANNELS.SSH_WRITE, (_, { id, data }: { id: string; data: string }) => {
    sshManager.write(id, data)
  })

  ipcMain.on(IPC_CHANNELS.SSH_RESIZE, (_, options: SshResizeOptions) => {
    sshManager.resize(options)
  })

  ipcMain.on(IPC_CHANNELS.SSH_DISCONNECT, (_, id: string) => {
    sshManager.disconnect(id)
  })

  createWindow()

  app.on('activate', function () {
    // 在 macOS 上，当点击 dock 图标且没有其他窗口打开时
    // 通常会重新创建应用窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口关闭时退出应用，macOS 除外
// 在 macOS 上，应用和菜单栏通常保持活动状态
// 直到用户使用 Cmd + Q 显式退出
app.on('window-all-closed', () => {
  ptyManager.destroyAll()
  sshManager.disconnectAll()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
