import { useState, useRef, useEffect } from 'react'
import {
  IconChevronDown,
  IconRefresh,
  IconFolderPlus,
  IconUpload,
  IconDownload,
  IconSettings
} from '@tabler/icons-react'

type MenuItem = { separator: true } | { icon: React.ReactNode; label: string; onClick: () => void }

interface ActionsMenuProps {
  isLocal: boolean
  onRefresh: () => void
  onCreateFolder: () => void
  onUpload?: () => void
  onDownload?: () => void
  onChangePermissions?: () => void
}

export function ActionsMenu({
  isLocal,
  onRefresh,
  onCreateFolder,
  onUpload,
  onDownload,
  onChangePermissions
}: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const menuItems: MenuItem[] = [
    {
      icon: <IconRefresh size={16} />,
      label: '刷新',
      onClick: () => {
        onRefresh()
        setIsOpen(false)
      }
    },
    {
      icon: <IconFolderPlus size={16} />,
      label: '新建文件夹',
      onClick: () => {
        onCreateFolder()
        setIsOpen(false)
      }
    }
  ]

  // 添加分隔符和传输操作
  if (onUpload || onDownload) {
    menuItems.push({ separator: true })

    if (onUpload && isLocal) {
      menuItems.push({
        icon: <IconUpload size={16} />,
        label: '上传选中文件',
        onClick: () => {
          onUpload()
          setIsOpen(false)
        }
      })
    }

    if (onDownload && !isLocal) {
      menuItems.push({
        icon: <IconDownload size={16} />,
        label: '下载选中文件',
        onClick: () => {
          onDownload()
          setIsOpen(false)
        }
      })
    }
  }

  // 远程模式下添加权限修改
  if (!isLocal && onChangePermissions) {
    menuItems.push({
      icon: <IconSettings size={16} />,
      label: '修改权限',
      onClick: () => {
        onChangePermissions()
        setIsOpen(false)
      }
    })
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
      >
        <span>Actions</span>
        <IconChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {menuItems.map((item, index) => {
            if ('separator' in item) {
              return <div key={index} className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
            }

            return (
              <button
                key={index}
                onClick={item.onClick}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {item.icon}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
