import * as pty from 'node-pty'
import { BrowserWindow } from 'electron'
import os from 'os'
import { IPC_CHANNELS, PtyCreateOptions, PtyResizeOptions } from '../shared/types'

class PtyManager {
  private instances: Map<string, pty.IPty> = new Map()

  /**
   * 获取当前平台的默认 Shell
   */
  private getDefaultShell(): string {
    if (process.platform === 'win32') {
      return process.env.COMSPEC || 'cmd.exe'
    }
    return process.env.SHELL || '/bin/bash'
  }

  /**
   * 创建新的 PTY 实例
   */
  create(options: PtyCreateOptions, window: BrowserWindow): boolean {
    const { id, cols, rows } = options

    if (this.instances.has(id)) {
      console.warn(`PTY 实例 ${id} 已存在`)
      return false
    }

    const shell = this.getDefaultShell()
    const homeDir = os.homedir()

    try {
      const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols,
        rows,
        cwd: homeDir,
        env: process.env as { [key: string]: string }
      })

      // 处理 PTY 输出
      ptyProcess.onData((data) => {
        if (!window.isDestroyed()) {
          window.webContents.send(IPC_CHANNELS.PTY_OUTPUT, { id, data })
        }
      })

      // 处理 PTY 退出
      ptyProcess.onExit(({ exitCode }) => {
        if (!window.isDestroyed()) {
          window.webContents.send(IPC_CHANNELS.PTY_EXIT, { id, exitCode })
        }
        this.instances.delete(id)
      })

      this.instances.set(id, ptyProcess)
      return true
    } catch (error) {
      console.error(`创建 PTY 实例 ${id} 失败:`, error)
      return false
    }
  }

  /**
   * 向 PTY 实例写入数据
   */
  write(id: string, data: string): boolean {
    const ptyProcess = this.instances.get(id)
    if (!ptyProcess) {
      console.warn(`PTY 实例 ${id} 不存在`)
      return false
    }

    try {
      ptyProcess.write(data)
      return true
    } catch (error) {
      console.error(`向 PTY 实例 ${id} 写入数据失败:`, error)
      return false
    }
  }

  /**
   * 调整 PTY 实例大小
   */
  resize(options: PtyResizeOptions): boolean {
    const { id, cols, rows } = options
    const ptyProcess = this.instances.get(id)

    if (!ptyProcess) {
      console.warn(`PTY 实例 ${id} 不存在`)
      return false
    }

    try {
      ptyProcess.resize(cols, rows)
      return true
    } catch (error) {
      console.error(`调整 PTY 实例 ${id} 大小失败:`, error)
      return false
    }
  }

  /**
   * 销毁 PTY 实例
   */
  destroy(id: string): boolean {
    const ptyProcess = this.instances.get(id)
    if (!ptyProcess) {
      return false
    }

    try {
      ptyProcess.kill()
      this.instances.delete(id)
      return true
    } catch (error) {
      console.error(`销毁 PTY 实例 ${id} 失败:`, error)
      return false
    }
  }

  /**
   * 销毁所有 PTY 实例
   */
  destroyAll(): void {
    for (const [id] of this.instances) {
      this.destroy(id)
    }
  }
}

export const ptyManager = new PtyManager()
