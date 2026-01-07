import type { FileItem } from '@shared/types'
import { IconFolder, IconFile, IconLink, IconLoader2, IconAlertCircle } from '@tabler/icons-react'

interface FileListProps {
  files: FileItem[]
  loading: boolean
  error: string | null
  selectedFiles: Set<string>
  onFileDoubleClick: (file: FileItem) => void
  onFileSelect: (file: FileItem, selected: boolean) => void
  onContextMenu: (event: React.MouseEvent, file: FileItem | null) => void
}

export function FileList({
  files,
  loading,
  error,
  selectedFiles,
  onFileDoubleClick,
  onFileSelect,
  onContextMenu
}: FileListProps) {
  const getFileIcon = (file: FileItem) => {
    switch (file.type) {
      case 'directory':
        return <IconFolder size={16} className="text-blue-500" />
      case 'symlink':
        return <IconLink size={16} className="text-purple-500" />
      default:
        return <IconFile size={16} className="text-neutral-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatPermissions = (file: FileItem) => {
    const { permissions } = file
    let result = file.type === 'directory' ? 'd' : '-'

    result += permissions.owner.read ? 'r' : '-'
    result += permissions.owner.write ? 'w' : '-'
    result += permissions.owner.execute ? 'x' : '-'
    result += permissions.group.read ? 'r' : '-'
    result += permissions.group.write ? 'w' : '-'
    result += permissions.group.execute ? 'x' : '-'
    result += permissions.others.read ? 'r' : '-'
    result += permissions.others.write ? 'w' : '-'
    result += permissions.others.execute ? 'x' : '-'

    return result
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-500">
          <IconLoader2 size={20} className="animate-spin" />
          <span>Loading files...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-red-500">
          <IconAlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-neutral-500">No files found</span>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-800">
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            <th className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
              Name
            </th>
            <th className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
              Size
            </th>
            <th className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
              Permissions
            </th>
            <th className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
              Modified
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const isSelected = selectedFiles.has(file.path)
            // hover: 浅蓝色背景 (原来select的颜色)
            // selected: 深蓝色背景
            // selected + hover: 更深的蓝色
            const rowClass = isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
              : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'

            return (
              <tr
                key={file.path}
                className={`cursor-pointer ${rowClass}`}
                onClick={(e) => {
                  e.preventDefault()
                  onFileSelect(file, !isSelected)
                }}
                onDoubleClick={() => onFileDoubleClick(file)}
                onContextMenu={(e) => onContextMenu(e, file)}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <span className={file.isHidden ? 'opacity-60' : ''}>{file.name}</span>
                  </div>
                </td>
                <td
                  className={`px-3 py-2 ${isSelected ? 'text-blue-100' : 'text-neutral-600 dark:text-neutral-400'}`}
                >
                  {file.type === 'directory' ? '-' : formatFileSize(file.size)}
                </td>
                <td
                  className={`px-3 py-2 font-mono text-xs ${isSelected ? 'text-blue-100' : 'text-neutral-600 dark:text-neutral-400'}`}
                >
                  {formatPermissions(file)}
                </td>
                <td
                  className={`px-3 py-2 ${isSelected ? 'text-blue-100' : 'text-neutral-600 dark:text-neutral-400'}`}
                >
                  {formatDate(file.modifiedTime)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
