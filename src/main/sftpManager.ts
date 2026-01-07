import SftpClient from 'ssh2-sftp-client'
import { Client as SshClient } from 'ssh2'
import { BrowserWindow } from 'electron'
import * as path from 'path'
import {
  IPC_CHANNELS,
  SftpConnectOptions,
  SftpListOptions,
  SftpUploadOptions,
  SftpDownloadOptions,
  SftpFileOperation,
  SftpChmodOptions,
  FileItem,
  FileType,
  FilePermissions,
  SftpConnectionStatus
} from '../shared/types'

interface SftpConnection {
  id: string
  client: SftpClient
  sshClient: SshClient
  status: SftpConnectionStatus
  window: BrowserWindow
}

export class SftpManager {
  private connections: Map<string, SftpConnection> = new Map()

  async connect(options: SftpConnectOptions, window: BrowserWindow): Promise<boolean> {
    try {
      const { id } = options

      // 如果已存在连接，先断开
      if (this.connections.has(id)) {
        await this.disconnect(id)
      }

      this.updateStatus(id, 'connecting', window)

      const sftpClient = new SftpClient()
      const sshClient = new SshClient()

      const connectConfig = {
        host: options.host,
        port: options.port,
        username: options.username,
        ...(options.authType === 'password'
          ? { password: options.password }
          : { privateKey: options.privateKey })
      }

      // 连接SFTP
      await sftpClient.connect(connectConfig)

      const connection: SftpConnection = {
        id,
        client: sftpClient,
        sshClient,
        status: 'connected',
        window
      }

      this.connections.set(id, connection)
      this.updateStatus(id, 'connected', window)

      return true
    } catch (error) {
      console.error('SFTP connection failed:', error)
      this.sendError(
        options.id,
        error instanceof Error ? error.message : 'Connection failed',
        window
      )
      return false
    }
  }

  async disconnect(id: string): Promise<boolean> {
    const connection = this.connections.get(id)
    if (!connection) return false

    try {
      await connection.client.end()
      this.connections.delete(id)
      this.updateStatus(id, 'disconnected', connection.window)
      return true
    } catch (error) {
      console.error('SFTP disconnect failed:', error)
      return false
    }
  }

  async listFiles(options: SftpListOptions): Promise<FileItem[]> {
    const connection = this.connections.get(options.id)
    if (!connection) {
      throw new Error('SFTP connection not found')
    }

    try {
      const fileList = await connection.client.list(options.path)

      return fileList.map(
        (item): FileItem => ({
          name: item.name,
          path: path.posix.join(options.path, item.name),
          type: this.getFileType(item.type),
          size: item.size,
          permissions: this.parsePermissions(item.rights),
          modifiedTime: new Date(item.modifyTime),
          isHidden: item.name.startsWith('.'),
          isLocal: false
        })
      )
    } catch (error) {
      console.error('SFTP list files failed:', error)
      throw error
    }
  }

  async uploadFile(options: SftpUploadOptions): Promise<void> {
    const connection = this.connections.get(options.id)
    if (!connection) {
      throw new Error('SFTP connection not found')
    }

    try {
      // 简化实现：直接上传，不使用进度回调（类型定义问题）
      await connection.client.put(options.localPath, options.remotePath)
    } catch (error) {
      console.error('SFTP upload failed:', error)
      throw error
    }
  }

  async downloadFile(options: SftpDownloadOptions): Promise<void> {
    const connection = this.connections.get(options.id)
    if (!connection) {
      throw new Error('SFTP connection not found')
    }

    try {
      // 简化实现：直接下载，不使用进度回调（类型定义问题）
      await connection.client.get(options.remotePath, options.localPath)
    } catch (error) {
      console.error('SFTP download failed:', error)
      throw error
    }
  }

  async deleteFile(options: SftpFileOperation): Promise<void> {
    const connection = this.connections.get(options.id)
    if (!connection) {
      throw new Error('SFTP connection not found')
    }

    try {
      const stat = await connection.client.stat(options.sourcePath)
      if (stat.isDirectory) {
        await connection.client.rmdir(options.sourcePath, true)
      } else {
        await connection.client.delete(options.sourcePath)
      }
    } catch (error) {
      console.error('SFTP delete failed:', error)
      throw error
    }
  }

  async createDirectory(options: SftpFileOperation): Promise<void> {
    const connection = this.connections.get(options.id)
    if (!connection) {
      throw new Error('SFTP connection not found')
    }

    try {
      await connection.client.mkdir(options.sourcePath, true)
    } catch (error) {
      console.error('SFTP mkdir failed:', error)
      throw error
    }
  }

  async renameFile(options: SftpFileOperation): Promise<void> {
    const connection = this.connections.get(options.id)
    if (!connection || !options.targetPath) {
      throw new Error('SFTP connection not found or target path missing')
    }

    try {
      await connection.client.rename(options.sourcePath, options.targetPath)
    } catch (error) {
      console.error('SFTP rename failed:', error)
      throw error
    }
  }

  async changePermissions(options: SftpChmodOptions): Promise<void> {
    const connection = this.connections.get(options.id)
    if (!connection) {
      throw new Error('SFTP connection not found')
    }

    try {
      const mode = parseInt(options.permissions, 8)
      await connection.client.chmod(options.path, mode)
    } catch (error) {
      console.error('SFTP chmod failed:', error)
      throw error
    }
  }

  disconnectAll(): void {
    for (const [id] of this.connections) {
      this.disconnect(id)
    }
  }

  private getFileType(sftpType: string): FileType {
    switch (sftpType) {
      case 'd':
        return 'directory'
      case 'l':
        return 'symlink'
      default:
        return 'file'
    }
  }

  private parsePermissions(
    rights: { user: string; group: string; other: string } | number
  ): FilePermissions {
    // ssh2-sftp-client 返回的权限对象
    let mode: number
    if (typeof rights === 'number') {
      mode = rights
    } else {
      // 从字符串权限转换
      mode = 0
      if (rights.user.includes('r')) mode |= 0o400
      if (rights.user.includes('w')) mode |= 0o200
      if (rights.user.includes('x')) mode |= 0o100
      if (rights.group.includes('r')) mode |= 0o040
      if (rights.group.includes('w')) mode |= 0o020
      if (rights.group.includes('x')) mode |= 0o010
      if (rights.other.includes('r')) mode |= 0o004
      if (rights.other.includes('w')) mode |= 0o002
      if (rights.other.includes('x')) mode |= 0o001
    }

    const octal = mode.toString(8).padStart(3, '0')

    return {
      owner: {
        read: !!(mode & 0o400),
        write: !!(mode & 0o200),
        execute: !!(mode & 0o100)
      },
      group: {
        read: !!(mode & 0o040),
        write: !!(mode & 0o020),
        execute: !!(mode & 0o010)
      },
      others: {
        read: !!(mode & 0o004),
        write: !!(mode & 0o002),
        execute: !!(mode & 0o001)
      },
      octal
    }
  }

  private updateStatus(id: string, status: SftpConnectionStatus, window: BrowserWindow): void {
    window.webContents.send(IPC_CHANNELS.SFTP_STATUS, { id, status })
  }

  private sendError(id: string, error: string, window: BrowserWindow): void {
    window.webContents.send(IPC_CHANNELS.SFTP_ERROR, { id, error })
  }
}

// 单例实例
export const sftpManager = new SftpManager()
