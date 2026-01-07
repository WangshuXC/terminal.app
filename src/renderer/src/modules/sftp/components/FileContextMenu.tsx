import { useEffect, useRef, useLayoutEffect } from 'react'
import type { FileItem } from '@shared/types'
import {
  IconDownload,
  IconUpload,
  IconTrash,
  IconEdit,
  IconSettings,
  IconRefresh,
  IconFolderPlus
} from '@tabler/icons-react'

type MenuItem =
  | { separator: true }
  | {
      icon: React.ReactNode
      label: string
      onClick: () => void
      danger?: boolean
      disabled?: boolean
    }

interface FileContextMenuProps {
  x: number
  y: number
  file: FileItem | null
  selectedCount: number // 选中的文件数量
  onClose: () => void
  onRefresh?: () => void
  onCreateFolder?: () => void
  onDelete?: (filePath: string) => void
  onRename?: (filePath: string) => void
  onUpload?: () => void
  onDownload?: () => void
  onChangePermissions?: () => void
}

export function FileContextMenu({
  x,
  y,
  file,
  selectedCount,
  onClose,
  onRefresh,
  onCreateFolder,
  onDelete,
  onRename,
  onUpload,
  onDownload,
  onChangePermissions
}: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef({ x, y })

  // 使用 useLayoutEffect 同步计算位置，避免闪烁
  useLayoutEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      let adjustedX = x
      let adjustedY = y

      // 如果菜单底部超出视口，向上弹出
      if (y + menuRect.height > viewportHeight) {
        adjustedY = Math.max(8, y - menuRect.height)
      }

      // 如果菜单右侧超出视口，向左调整
      if (x + menuRect.width > viewportWidth) {
        adjustedX = Math.max(8, viewportWidth - menuRect.width - 8)
      }

      positionRef.current = { x: adjustedX, y: adjustedY }
      menuRef.current.style.left = `${adjustedX}px`
      menuRef.current.style.top = `${adjustedY}px`
    }
  }, [x, y])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const menuItems: MenuItem[] = []

  // 通用操作：刷新和新建文件夹
  if (onRefresh) {
    menuItems.push({
      icon: <IconRefresh size={16} />,
      label: '刷新',
      onClick: () => {
        onRefresh()
        onClose()
      }
    })
  }

  if (onCreateFolder) {
    menuItems.push({
      icon: <IconFolderPlus size={16} />,
      label: '新建文件夹',
      onClick: () => {
        onCreateFolder()
        onClose()
      }
    })
  }

  // 如果有文件被选中，添加文件操作
  if (file) {
    if (menuItems.length > 0) {
      menuItems.push({ separator: true })
    }

    if (onUpload) {
      menuItems.push({
        icon: <IconUpload size={16} />,
        label: '上传',
        onClick: () => {
          onUpload()
          onClose()
        }
      })
    }

    if (onDownload) {
      menuItems.push({
        icon: <IconDownload size={16} />,
        label: '下载',
        onClick: () => {
          onDownload()
          onClose()
        }
      })
    }

    if (onRename) {
      // 多选时禁用重命名
      const isMultiSelect = selectedCount > 1
      menuItems.push({
        icon: <IconEdit size={16} />,
        label: '重命名',
        onClick: () => {
          if (!isMultiSelect) {
            onRename(file.path)
            onClose()
          }
        },
        disabled: isMultiSelect
      })
    }

    if (onChangePermissions && !file.isLocal) {
      menuItems.push({
        icon: <IconSettings size={16} />,
        label: '修改权限',
        onClick: () => {
          onChangePermissions()
          onClose()
        }
      })
    }

    if (onDelete) {
      if (menuItems.length > 0) {
        menuItems.push({ separator: true })
      }
      menuItems.push({
        icon: <IconTrash size={16} />,
        label: '删除',
        onClick: () => {
          onDelete(file.path)
          onClose()
        },
        danger: true
      })
    }
  }

  if (menuItems.length === 0) {
    return null
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
      style={{
        left: x,
        top: y
      }}
    >
      {menuItems.map((item, index) => {
        if ('separator' in item) {
          return <div key={index} className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
        }

        const isDisabled = item.disabled

        return (
          <button
            key={index}
            onClick={isDisabled ? undefined : item.onClick}
            disabled={isDisabled}
            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
              isDisabled
                ? 'cursor-not-allowed text-neutral-400 dark:text-neutral-600'
                : item.danger
                  ? 'text-red-600 hover:bg-neutral-100 dark:text-red-400 dark:hover:bg-neutral-700'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
