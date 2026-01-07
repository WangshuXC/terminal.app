import { atom } from 'jotai'
import { FileItem, SftpConnectionStatus, FileTransferProgress } from '../../../shared/types'

// SFTP连接状态
export interface SftpConnectionState {
  id: string
  status: SftpConnectionStatus
  error: string | null
  currentRemotePath: string
  remoteFiles: FileItem[]
}

// 本地文件浏览状态
export interface LocalFileState {
  currentPath: string
  files: FileItem[]
  homeDirectory: string
}

// 文件传输状态
export interface FileTransferState {
  transfers: FileTransferProgress[]
  isTransferring: boolean
}

// SFTP连接状态映射 (tabId -> SftpConnectionState)
export const sftpConnectionsAtom = atom<Map<string, SftpConnectionState>>(new Map())

// 本地文件状态
export const localFileStateAtom = atom<LocalFileState>({
  currentPath: '',
  files: [],
  homeDirectory: ''
})

// 文件传输状态
export const fileTransferStateAtom = atom<FileTransferState>({
  transfers: [],
  isTransferring: false
})

// 获取指定标签页的SFTP连接状态
export const getSftpConnectionAtom = atom(null, (get, _set, tabId: string) => {
  const connections = get(sftpConnectionsAtom)
  return connections.get(tabId)
})

// 更新SFTP连接状态
export const updateSftpConnectionAtom = atom(
  null,
  (get, set, { tabId, state }: { tabId: string; state: Partial<SftpConnectionState> }) => {
    const connections = new Map(get(sftpConnectionsAtom))
    const currentState = connections.get(tabId) || {
      id: tabId,
      status: 'idle' as SftpConnectionStatus,
      error: null,
      currentRemotePath: '/',
      remoteFiles: []
    }
    connections.set(tabId, { ...currentState, ...state })
    set(sftpConnectionsAtom, connections)
  }
)

// 移除SFTP连接状态
export const removeSftpConnectionAtom = atom(null, (get, set, tabId: string) => {
  const connections = new Map(get(sftpConnectionsAtom))
  connections.delete(tabId)
  set(sftpConnectionsAtom, connections)
})

// 更新本地文件状态
export const updateLocalFileStateAtom = atom(null, (_get, set, state: Partial<LocalFileState>) => {
  set(localFileStateAtom, (prev) => ({ ...prev, ...state }))
})

// 添加文件传输
export const addFileTransferAtom = atom(null, (get, set, transfer: FileTransferProgress) => {
  const currentState = get(fileTransferStateAtom)
  set(fileTransferStateAtom, {
    transfers: [...currentState.transfers, transfer],
    isTransferring: true
  })
})

// 更新文件传输进度
export const updateFileTransferAtom = atom(
  null,
  (get, set, updatedTransfer: FileTransferProgress) => {
    const currentState = get(fileTransferStateAtom)
    const transfers = currentState.transfers.map((transfer) =>
      transfer.id === updatedTransfer.id ? updatedTransfer : transfer
    )
    set(fileTransferStateAtom, {
      ...currentState,
      transfers
    })
  }
)

// 移除文件传输
export const removeFileTransferAtom = atom(null, (get, set, transferId: string) => {
  const currentState = get(fileTransferStateAtom)
  const transfers = currentState.transfers.filter((transfer) => transfer.id !== transferId)
  set(fileTransferStateAtom, {
    transfers,
    isTransferring: transfers.length > 0
  })
})

// 清空所有传输
export const clearFileTransfersAtom = atom(null, (_get, set) => {
  set(fileTransferStateAtom, {
    transfers: [],
    isTransferring: false
  })
})
