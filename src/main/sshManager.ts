import { Client, ClientChannel } from 'ssh2'
import { BrowserWindow } from 'electron'
import {
  IPC_CHANNELS,
  SshConnectOptions,
  SshResizeOptions,
  SshConnectionStatus,
  SshLogType
} from '../shared/types'

interface SshConnection {
  client: Client
  shell: ClientChannel | null
  window: BrowserWindow
  status: SshConnectionStatus
}

class SshManager {
  private connections: Map<string, SshConnection> = new Map()

  private sendStatus(
    window: BrowserWindow,
    id: string,
    status: SshConnectionStatus,
    progress: number
  ): void {
    if (!window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.SSH_STATUS, { id, status, progress })
    }
  }

  private sendLog(
    window: BrowserWindow,
    id: string,
    type: SshLogType,
    message: string,
    icon?: string
  ): void {
    if (!window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.SSH_LOG, {
        id,
        log: { timestamp: Date.now(), type, message, icon }
      })
    }
  }

  private sendError(window: BrowserWindow, id: string, error: string): void {
    if (!window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.SSH_ERROR, { id, error })
    }
  }

  private sendOutput(window: BrowserWindow, id: string, data: string): void {
    if (!window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.SSH_OUTPUT, { id, data })
    }
  }

  private sendExit(window: BrowserWindow, id: string, code: number, signal?: string): void {
    if (!window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.SSH_EXIT, { id, code, signal })
    }
  }

  connect(options: SshConnectOptions, window: BrowserWindow): Promise<boolean> {
    const { id, host, port, username, authType, password, privateKey, cols, rows } = options

    return new Promise((resolve) => {
    if (this.connections.has(id)) {
      console.warn(`SSH 连接 ${id} 已存在`)
      resolve(false)
      return
    }

      const client = new Client()
      const connection: SshConnection = {
        client,
        shell: null,
        window,
        status: 'connecting'
      }
      this.connections.set(id, connection)

      this.sendStatus(window, id, 'connecting', 10)
      this.sendLog(window, id, 'info', `Connecting to ${host}:${port}...`, '🔌')

      client.on('ready', () => {
        connection.status = 'ready'
        this.sendStatus(window, id, 'ready', 90)
        this.sendLog(window, id, 'success', `Connected to "${host}":"${port}"`, '✅')
        this.sendLog(window, id, 'info', 'Creating shell session...', '⚙️')

        client.shell({ term: 'xterm-256color', cols, rows }, (err, stream) => {
          if (err) {
            this.sendError(window, id, `Failed to create shell: ${err.message}`)
            this.sendStatus(window, id, 'error', 0)
            resolve(false)
            return
          }

          connection.shell = stream
          this.sendStatus(window, id, 'ready', 100)
          this.sendLog(window, id, 'success', 'Shell session established', '🖥️')

          stream.on('data', (data: Buffer) => {
            this.sendOutput(window, id, data.toString('utf-8'))
          })

          stream.on('close', () => {
            this.sendExit(window, id, 0)
            this.cleanup(id)
          })

          stream.stderr.on('data', (data: Buffer) => {
            this.sendOutput(window, id, data.toString('utf-8'))
          })

          resolve(true)
        })
      })

      client.on('handshake', (negotiated) => {
        this.sendStatus(window, id, 'authenticating', 30)
        this.sendLog(
          window,
          id,
          'info',
          `Handshake completed. Key exchange: ${negotiated.kex}`,
          '🤝'
        )
      })

      client.on(
        'keyboard-interactive',
        (_name, _instructions, _instructionsLang, prompts, finish) => {
          this.sendLog(window, id, 'info', 'Keyboard-interactive authentication requested', '⌨️')
          if (prompts.length > 0 && password) {
            finish([password])
          } else {
            finish([])
          }
        }
      )

      client.on('error', (err) => {
        connection.status = 'error'
        this.sendStatus(window, id, 'error', 0)
        this.sendError(window, id, err.message)
        this.sendLog(window, id, 'error', `Connection error: ${err.message}`, '❌')
        this.cleanup(id)
        resolve(false)
      })

      client.on('close', () => {
        if (connection.status !== 'error') {
          connection.status = 'disconnected'
          this.sendStatus(window, id, 'disconnected', 0)
          this.sendLog(window, id, 'info', 'Connection closed', '🔒')
        }
        this.cleanup(id)
      })

      client.on('end', () => {
        this.sendLog(window, id, 'info', 'Connection ended', '📴')
      })

      // 构建认证配置
      const authConfig: {
        host: string
        port: number
        username: string
        password?: string
        privateKey?: string
        readyTimeout: number
        keepaliveInterval: number
        keepaliveCountMax: number
      } = {
        host,
        port,
        username,
        readyTimeout: 30000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3
      }

      if (authType === 'password') {
        authConfig.password = password
        this.sendLog(window, id, 'info', 'Using password authentication', '🔑')
      } else if (authType === 'privateKey' && privateKey) {
        authConfig.privateKey = privateKey
        this.sendLog(window, id, 'info', 'Using private key authentication', '🔐')
      }

      this.sendStatus(window, id, 'authenticating', 20)
      this.sendLog(window, id, 'info', `Authenticating as ${username}...`, '👤')

      client.connect(authConfig)
    })
  }

  write(id: string, data: string): boolean {
    const connection = this.connections.get(id)
    if (!connection?.shell) {
      console.warn(`SSH 连接 ${id} 不存在或 shell 未就绪`)
      return false
    }

    connection.shell.write(data)
    return true
  }

  resize(options: SshResizeOptions): boolean {
    const { id, cols, rows } = options
    const connection = this.connections.get(id)
    if (!connection?.shell) {
      console.warn(`SSH 连接 ${id} 不存在或 shell 未就绪`)
      return false
    }

    connection.shell.setWindow(rows, cols, 0, 0)
    return true
  }

  disconnect(id: string): boolean {
    const connection = this.connections.get(id)
    if (!connection) {
      return false
    }

    connection.client.end()
    this.cleanup(id)
    return true
  }

  private cleanup(id: string): void {
    const connection = this.connections.get(id)
    if (connection) {
      if (connection.shell) {
        connection.shell.close()
      }
      connection.client.destroy()
      this.connections.delete(id)
    }
  }

  disconnectAll(): void {
    for (const [id] of this.connections) {
      this.disconnect(id)
    }
  }
}

export const sshManager = new SshManager()
