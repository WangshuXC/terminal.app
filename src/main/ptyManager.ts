import * as pty from 'node-pty'
import { BrowserWindow } from 'electron'
import os from 'os'
import { IPC_CHANNELS, PtyCreateOptions, PtyResizeOptions } from '../shared/types'

class PtyManager {
  private instances: Map<string, pty.IPty> = new Map()

  /**
   * Get the default shell for the current platform
   */
  private getDefaultShell(): string {
    if (process.platform === 'win32') {
      return process.env.COMSPEC || 'cmd.exe'
    }
    return process.env.SHELL || '/bin/bash'
  }

  /**
   * Create a new PTY instance
   */
  create(options: PtyCreateOptions, window: BrowserWindow): boolean {
    const { id, cols, rows } = options

    if (this.instances.has(id)) {
      console.warn(`PTY instance ${id} already exists`)
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

      // Handle PTY output
      ptyProcess.onData((data) => {
        if (!window.isDestroyed()) {
          window.webContents.send(IPC_CHANNELS.PTY_OUTPUT, { id, data })
        }
      })

      // Handle PTY exit
      ptyProcess.onExit(({ exitCode }) => {
        if (!window.isDestroyed()) {
          window.webContents.send(IPC_CHANNELS.PTY_EXIT, { id, exitCode })
        }
        this.instances.delete(id)
      })

      this.instances.set(id, ptyProcess)
      return true
    } catch (error) {
      console.error(`Failed to create PTY instance ${id}:`, error)
      return false
    }
  }

  /**
   * Write data to a PTY instance
   */
  write(id: string, data: string): boolean {
    const ptyProcess = this.instances.get(id)
    if (!ptyProcess) {
      console.warn(`PTY instance ${id} not found`)
      return false
    }

    try {
      ptyProcess.write(data)
      return true
    } catch (error) {
      console.error(`Failed to write to PTY instance ${id}:`, error)
      return false
    }
  }

  /**
   * Resize a PTY instance
   */
  resize(options: PtyResizeOptions): boolean {
    const { id, cols, rows } = options
    const ptyProcess = this.instances.get(id)

    if (!ptyProcess) {
      console.warn(`PTY instance ${id} not found`)
      return false
    }

    try {
      ptyProcess.resize(cols, rows)
      return true
    } catch (error) {
      console.error(`Failed to resize PTY instance ${id}:`, error)
      return false
    }
  }

  /**
   * Destroy a PTY instance
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
      console.error(`Failed to destroy PTY instance ${id}:`, error)
      return false
    }
  }

  /**
   * Destroy all PTY instances
   */
  destroyAll(): void {
    for (const [id] of this.instances) {
      this.destroy(id)
    }
  }
}

export const ptyManager = new PtyManager()
