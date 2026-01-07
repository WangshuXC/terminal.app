import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {
  LocalListOptions,
  LocalFileOperation,
  LocalChmodOptions,
  FileItem,
  FileType,
  FilePermissions
} from '../shared/types'

export class LocalFileManager {
  private homeDirectory: string

  constructor() {
    this.homeDirectory = os.homedir()
  }

  getHomeDirectory(): string {
    return this.homeDirectory
  }

  async listFiles(options: LocalListOptions): Promise<FileItem[]> {
    try {
      // 安全检查：确保路径在用户主目录内
      const safePath = this.validatePath(options.path)

      const files = await fs.promises.readdir(safePath, { withFileTypes: true })
      const fileItems: FileItem[] = []

      for (const file of files) {
        try {
          const filePath = path.join(safePath, file.name)
          const stats = await fs.promises.stat(filePath)

          fileItems.push({
            name: file.name,
            path: filePath,
            type: this.getFileType(file),
            size: stats.size,
            permissions: this.parsePermissions(stats.mode),
            modifiedTime: stats.mtime,
            isHidden: file.name.startsWith('.'),
            isLocal: true
          })
        } catch (error) {
          // 跳过无法访问的文件
          console.warn(`Cannot access file ${file.name}:`, error)
        }
      }

      return fileItems.sort((a, b) => {
        // 目录排在前面，然后按名称排序
        if (a.type === 'directory' && b.type !== 'directory') return -1
        if (a.type !== 'directory' && b.type === 'directory') return 1
        return a.name.localeCompare(b.name)
      })
    } catch (error) {
      console.error('Local list files failed:', error)
      throw error
    }
  }

  async deleteFile(options: LocalFileOperation): Promise<void> {
    try {
      const safePath = this.validatePath(options.sourcePath)
      const stats = await fs.promises.stat(safePath)

      if (stats.isDirectory()) {
        await fs.promises.rmdir(safePath, { recursive: true })
      } else {
        await fs.promises.unlink(safePath)
      }
    } catch (error) {
      console.error('Local delete failed:', error)
      throw error
    }
  }

  async createDirectory(options: LocalFileOperation): Promise<void> {
    try {
      const safePath = this.validatePath(options.sourcePath)
      await fs.promises.mkdir(safePath, { recursive: true })
    } catch (error) {
      console.error('Local mkdir failed:', error)
      throw error
    }
  }

  async renameFile(options: LocalFileOperation): Promise<void> {
    if (!options.targetPath) {
      throw new Error('Target path is required for rename operation')
    }

    try {
      const safeSourcePath = this.validatePath(options.sourcePath)
      const safeTargetPath = this.validatePath(options.targetPath)

      await fs.promises.rename(safeSourcePath, safeTargetPath)
    } catch (error) {
      console.error('Local rename failed:', error)
      throw error
    }
  }

  async changePermissions(options: LocalChmodOptions): Promise<void> {
    try {
      const safePath = this.validatePath(options.path)
      const mode = parseInt(options.permissions, 8)

      await fs.promises.chmod(safePath, mode)
    } catch (error) {
      console.error('Local chmod failed:', error)
      throw error
    }
  }

  async copyFile(sourcePath: string, targetPath: string): Promise<void> {
    try {
      const safeSourcePath = this.validatePath(sourcePath)
      const safeTargetPath = this.validatePath(targetPath)

      await fs.promises.copyFile(safeSourcePath, safeTargetPath)
    } catch (error) {
      console.error('Local copy failed:', error)
      throw error
    }
  }

  private validatePath(filePath: string): string {
    // 解析路径，允许访问任意本地路径
    return path.resolve(filePath)
  }

  private getFileType(dirent: fs.Dirent): FileType {
    if (dirent.isDirectory()) {
      return 'directory'
    } else if (dirent.isSymbolicLink()) {
      return 'symlink'
    } else {
      return 'file'
    }
  }

  private parsePermissions(mode: number): FilePermissions {
    const octal = (mode & parseInt('777', 8)).toString(8).padStart(3, '0')

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
}

// 单例实例
export const localFileManager = new LocalFileManager()
