import { useState, useEffect, useCallback } from 'react'
import type { FileItem } from '@shared/types'
import { FileList } from './FileList'
import { PathBreadcrumb } from './PathBreadcrumb'
import { FileContextMenu } from './FileContextMenu'
import { ActionsMenu } from './ActionsMenu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter
} from '@/components/ui/AlertDialog'
import {
  IconHome,
  IconUpload,
  IconDownload,
  IconX,
  IconFile,
  IconFolder
} from '@tabler/icons-react'

export type FilePanelMode = 'local' | 'remote'

interface FilePanelProps {
  mode: FilePanelMode
  title: string
  tabId?: string // 仅远程模式需要
  currentPath: string
  onPathChange: (path: string) => void
  onTransfer?: (filePath: string) => void // 上传(本地)或下载(远程)
}

export function FilePanel({
  mode,
  title,
  tabId,
  currentPath,
  onPathChange,
  onTransfer
}: FilePanelProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    file: FileItem | null
  } | null>(null)
  const [deletingFile, setDeletingFile] = useState<FileItem | null>(null)

  const isLocal = mode === 'local'

  // 加载文件列表
  const loadFiles = useCallback(async () => {
    if (!currentPath) return

    setLoading(true)
    setError(null)

    try {
      let fileList: FileItem[]
      if (isLocal) {
        fileList = await window.localApi.list({ path: currentPath })
      } else {
        if (!tabId) throw new Error('tabId is required for remote mode')
        fileList = await window.sftpApi.list({ id: tabId, path: currentPath })
      }
      setFiles(fileList)
    } catch (err) {
      console.error(`Failed to load ${mode} files:`, err)
      setError(err instanceof Error ? err.message : 'Failed to load files')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [currentPath, isLocal, tabId, mode])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // 路径变化时清除选择
  useEffect(() => {
    setSelectedFiles(new Set())
  }, [currentPath])

  // 导航到路径
  const handleNavigate = (path: string) => {
    onPathChange(path)
    // 选择会在 currentPath 变化的 useEffect 中自动清除
  }

  // 双击文件/文件夹
  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === 'directory') {
      handleNavigate(file.path)
    }
  }

  // 选择文件
  const handleFileSelect = (file: FileItem, selected: boolean) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(file.path)
      } else {
        newSet.delete(file.path)
      }
      return newSet
    })
  }

  // 右键菜单
  const handleContextMenu = (event: React.MouseEvent, file: FileItem | null) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      file
    })
  }

  // 返回主目录
  const handleGoHome = async () => {
    if (isLocal) {
      try {
        const homeDir = await window.localApi.getHome()
        handleNavigate(homeDir)
      } catch (err) {
        console.error('Failed to navigate to home:', err)
      }
    } else {
      handleNavigate('/')
    }
  }

  // 创建文件夹
  const handleCreateFolder = async () => {
    const folderName = prompt('请输入文件夹名称:')
    if (!folderName) return

    try {
      const newFolderPath = currentPath.endsWith('/')
        ? currentPath + folderName
        : currentPath + '/' + folderName

      if (isLocal) {
        await window.localApi.mkdir({ sourcePath: newFolderPath })
      } else {
        if (!tabId) return
        await window.sftpApi.mkdir({ id: tabId, sourcePath: newFolderPath })
      }
      loadFiles()
    } catch (err) {
      alert('创建文件夹失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  // 请求删除文件（显示确认对话框）
  const handleDeleteRequest = (filePath: string) => {
    const file = files.find((f) => f.path === filePath)
    if (file) {
      setDeletingFile(file)
    }
  }

  // 确认删除文件
  const confirmDelete = async () => {
    if (!deletingFile) return

    try {
      if (isLocal) {
        await window.localApi.delete({ sourcePath: deletingFile.path })
      } else {
        if (!tabId) return
        await window.sftpApi.delete({ id: tabId, sourcePath: deletingFile.path })
      }
      loadFiles()
    } catch (err) {
      alert('删除失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setDeletingFile(null)
    }
  }

  // 重命名文件
  const handleRename = async (filePath: string) => {
    const currentName = filePath.split('/').pop() || ''
    const newName = prompt('请输入新名称:', currentName)
    if (!newName || newName === currentName) return

    try {
      const parentPath = filePath.substring(0, filePath.lastIndexOf('/'))
      const newPath = parentPath + '/' + newName

      if (isLocal) {
        await window.localApi.rename({ sourcePath: filePath, targetPath: newPath })
      } else {
        if (!tabId) return
        await window.sftpApi.rename({ id: tabId, sourcePath: filePath, targetPath: newPath })
      }
      loadFiles()
    } catch (err) {
      alert('重命名失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  // 修改权限（仅远程）
  const handleChangePermissions = async (filePath?: string) => {
    if (isLocal) return

    const targetPath = filePath || Array.from(selectedFiles)[0]
    if (!targetPath) return

    const currentFile = files.find((f) => f.path === targetPath)
    const currentPermissions = currentFile?.permissions.octal || '755'

    const newPermissions = prompt('请输入新权限 (八进制):', currentPermissions)
    if (!newPermissions || newPermissions === currentPermissions) return

    try {
      if (!tabId) return
      await window.sftpApi.chmod({ id: tabId, path: targetPath, permissions: newPermissions })
      loadFiles()
    } catch (err) {
      alert('修改权限失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  // 传输选中的文件
  const handleTransferSelected = () => {
    if (!onTransfer) return
    selectedFiles.forEach((filePath) => {
      onTransfer(filePath)
    })
    setSelectedFiles(new Set())
  }

  const TransferIcon = isLocal ? IconUpload : IconDownload
  const transferLabel = isLocal ? '上传' : '下载'

  return (
    <div className="flex h-full flex-col bg-white dark:bg-neutral-800">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
        </div>

        <div className="flex items-center gap-1">
          {/* 传输选中文件按钮 */}
          {selectedFiles.size > 0 && onTransfer && (
            <button
              onClick={handleTransferSelected}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              <TransferIcon size={14} />
              <span>{transferLabel}</span>
            </button>
          )}

          {/* 主目录 */}
          <button
            onClick={handleGoHome}
            className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
            title="主目录"
          >
            <IconHome size={16} />
          </button>

          {/* Actions 下拉菜单 */}
          <ActionsMenu
            isLocal={isLocal}
            onRefresh={loadFiles}
            onCreateFolder={handleCreateFolder}
            onUpload={selectedFiles.size > 0 && onTransfer ? handleTransferSelected : undefined}
            onDownload={selectedFiles.size > 0 && onTransfer ? handleTransferSelected : undefined}
            onChangePermissions={
              !isLocal && selectedFiles.size > 0 ? () => handleChangePermissions() : undefined
            }
          />
        </div>
      </div>

      {/* 路径导航 */}
      <PathBreadcrumb path={currentPath} onNavigate={handleNavigate} />

      {/* 文件列表 */}
      <div className="flex-1 overflow-hidden">
        <FileList
          files={files}
          loading={loading}
          error={error}
          selectedFiles={selectedFiles}
          onFileDoubleClick={handleFileDoubleClick}
          onFileSelect={handleFileSelect}
          onContextMenu={handleContextMenu}
        />
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          selectedCount={selectedFiles.size}
          onClose={() => setContextMenu(null)}
          onRefresh={loadFiles}
          onCreateFolder={handleCreateFolder}
          onDelete={handleDeleteRequest}
          onRename={handleRename}
          onUpload={isLocal && onTransfer ? () => onTransfer(contextMenu.file!.path) : undefined}
          onDownload={!isLocal && onTransfer ? () => onTransfer(contextMenu.file!.path) : undefined}
          onChangePermissions={
            !isLocal && contextMenu.file
              ? () => handleChangePermissions(contextMenu.file!.path)
              : undefined
          }
        />
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deletingFile} onOpenChange={() => setDeletingFile(null)}>
        <AlertDialogContent className="select-none gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">删除确认</h2>
            <AlertDialogCancel className="h-fit cursor-pointer rounded-lg border-0 bg-transparent p-1.5 text-white shadow-none hover:bg-slate-600 hover:text-white">
              <IconX className="size-5" />
            </AlertDialogCancel>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-5 dark:bg-neutral-900">
            <p className="mb-4 text-neutral-600 dark:text-neutral-300">
              确定要删除以下{deletingFile?.type === 'directory' ? '文件夹' : '文件'}吗？
            </p>
            <div className="flex items-center gap-4 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl text-white ${
                  deletingFile?.type === 'directory' ? 'bg-blue-500' : 'bg-neutral-500'
                }`}
              >
                {deletingFile?.type === 'directory' ? (
                  <IconFolder size={28} />
                ) : (
                  <IconFile size={28} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-neutral-900 dark:text-white">
                  {deletingFile?.name}
                </h3>
                <p className="truncate text-sm text-neutral-500">{deletingFile?.path}</p>
              </div>
            </div>
            {deletingFile?.type === 'directory' && (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                ⚠️ 此操作将删除文件夹及其所有内容，且无法恢复！
              </p>
            )}
          </div>

          {/* Footer */}
          <AlertDialogFooter className="rounded-b-2xl bg-white px-6 pb-6 dark:bg-neutral-900">
            <AlertDialogAction
              onClick={confirmDelete}
              className="cursor-pointer rounded-lg bg-red-500 px-6 py-2.5 text-white hover:bg-[#ef4444]"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
