// IPC 通道名称
export const IPC_CHANNELS = {
  // SSH 通道
  SSH_CONNECT: 'ssh:connect',
  SSH_DISCONNECT: 'ssh:disconnect',
  SSH_WRITE: 'ssh:write',
  SSH_RESIZE: 'ssh:resize',
  SSH_OUTPUT: 'ssh:output',
  SSH_STATUS: 'ssh:status',
  SSH_LOG: 'ssh:log',
  SSH_ERROR: 'ssh:error',
  SSH_EXIT: 'ssh:exit',
  // SFTP 通道
  SFTP_CONNECT: 'sftp:connect',
  SFTP_DISCONNECT: 'sftp:disconnect',
  SFTP_LIST: 'sftp:list',
  SFTP_UPLOAD: 'sftp:upload',
  SFTP_DOWNLOAD: 'sftp:download',
  SFTP_DELETE: 'sftp:delete',
  SFTP_MKDIR: 'sftp:mkdir',
  SFTP_RENAME: 'sftp:rename',
  SFTP_CHMOD: 'sftp:chmod',
  SFTP_STATUS: 'sftp:status',
  SFTP_ERROR: 'sftp:error',
  SFTP_PROGRESS: 'sftp:progress',
  // 本地文件系统通道
  LOCAL_LIST: 'local:list',
  LOCAL_DELETE: 'local:delete',
  LOCAL_MKDIR: 'local:mkdir',
  LOCAL_RENAME: 'local:rename',
  LOCAL_CHMOD: 'local:chmod'
} as const

// SSH 连接状态
export type SshConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'authenticating'
  | 'authenticated'
  | 'ready'
  | 'error'
  | 'disconnected'

// SSH 日志类型
export type SshLogType = 'info' | 'success' | 'error' | 'warning'

// SSH 连接日志
export interface SshConnectionLog {
  timestamp: number
  type: SshLogType
  message: string
  icon?: string
}

// SSH 连接选项
export interface SshConnectOptions {
  id: string
  host: string
  port: number
  username: string
  authType: 'password' | 'privateKey'
  password?: string
  privateKey?: string
  cols: number
  rows: number
}

// SSH 调整大小选项
export interface SshResizeOptions {
  id: string
  cols: number
  rows: number
}

// SSH 状态负载
export interface SshStatusPayload {
  id: string
  status: SshConnectionStatus
  progress: number
}

// SSH 日志负载
export interface SshLogPayload {
  id: string
  log: SshConnectionLog
}

// SSH 错误负载
export interface SshErrorPayload {
  id: string
  error: string
}

// SSH 输出负载
export interface SshOutputPayload {
  id: string
  data: string
}

// SSH 退出负载
export interface SshExitPayload {
  id: string
  code: number
  signal?: string
}

// SFTP 连接状态
export type SftpConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'

// 文件类型
export type FileType = 'file' | 'directory' | 'symlink'

// 文件权限
export interface FilePermissions {
  owner: {
    read: boolean
    write: boolean
    execute: boolean
  }
  group: {
    read: boolean
    write: boolean
    execute: boolean
  }
  others: {
    read: boolean
    write: boolean
    execute: boolean
  }
  octal: string // 八进制表示，如 "755"
}

// 文件项
export interface FileItem {
  name: string
  path: string
  type: FileType
  size: number
  permissions: FilePermissions
  modifiedTime: Date
  isHidden: boolean
  isLocal: boolean
}

// SFTP 连接选项
export interface SftpConnectOptions {
  id: string
  host: string
  port: number
  username: string
  authType: 'password' | 'privateKey'
  password?: string
  privateKey?: string
}

// SFTP 文件列表选项
export interface SftpListOptions {
  id: string
  path: string
}

// SFTP 文件操作选项
export interface SftpFileOperation {
  id: string
  sourcePath: string
  targetPath?: string
}

// SFTP 上传选项
export interface SftpUploadOptions {
  id: string
  localPath: string
  remotePath: string
}

// SFTP 下载选项
export interface SftpDownloadOptions {
  id: string
  remotePath: string
  localPath: string
}

// SFTP 权限修改选项
export interface SftpChmodOptions {
  id: string
  path: string
  permissions: string // 八进制权限，如 "755"
}

// 文件传输进度
export interface FileTransferProgress {
  id: string
  type: 'upload' | 'download'
  fileName: string
  transferred: number
  total: number
  percentage: number
  speed: number // bytes per second
  estimatedTime: number // seconds
}

// SFTP 状态负载
export interface SftpStatusPayload {
  id: string
  status: SftpConnectionStatus
}

// SFTP 错误负载
export interface SftpErrorPayload {
  id: string
  error: string
  operation?: string
}

// SFTP 进度负载
export interface SftpProgressPayload {
  id: string
  progress: FileTransferProgress
}

// 本地文件列表选项
export interface LocalListOptions {
  path: string
}

// 本地文件操作选项
export interface LocalFileOperation {
  sourcePath: string
  targetPath?: string
}

// 本地权限修改选项
export interface LocalChmodOptions {
  path: string
  permissions: string
}
