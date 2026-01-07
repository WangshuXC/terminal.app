import { ElectronAPI } from '@electron-toolkit/preload'
import {
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
  LocalChmodOptions,
  FileItem
} from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    sshApi: {
      connect: (options: SshConnectOptions) => Promise<boolean>
      write: (id: string, data: string) => void
      resize: (options: SshResizeOptions) => void
      disconnect: (id: string) => void
      onStatus: (callback: (payload: SshStatusPayload) => void) => () => void
      onLog: (callback: (payload: SshLogPayload) => void) => () => void
      onError: (callback: (payload: SshErrorPayload) => void) => () => void
      onOutput: (callback: (payload: SshOutputPayload) => void) => () => void
      onExit: (callback: (payload: SshExitPayload) => void) => () => void
    }
    sftpApi: {
      connect: (options: SftpConnectOptions) => Promise<boolean>
      disconnect: (id: string) => void
      list: (options: SftpListOptions) => Promise<FileItem[]>
      upload: (options: SftpUploadOptions) => Promise<void>
      download: (options: SftpDownloadOptions) => Promise<void>
      delete: (options: SftpFileOperation) => Promise<void>
      mkdir: (options: SftpFileOperation) => Promise<void>
      rename: (options: SftpFileOperation) => Promise<void>
      chmod: (options: SftpChmodOptions) => Promise<void>
      onStatus: (callback: (payload: SftpStatusPayload) => void) => () => void
      onError: (callback: (payload: SftpErrorPayload) => void) => () => void
      onProgress: (callback: (payload: SftpProgressPayload) => void) => () => void
    }
    localApi: {
      getHome: () => Promise<string>
      list: (options: LocalListOptions) => Promise<FileItem[]>
      delete: (options: LocalFileOperation) => Promise<void>
      mkdir: (options: LocalFileOperation) => Promise<void>
      rename: (options: LocalFileOperation) => Promise<void>
      chmod: (options: LocalChmodOptions) => Promise<void>
    }
  }
}
