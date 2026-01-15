import { useState, useRef, useEffect } from 'react'
import {
  IconChevronDown,
  IconRefresh,
  IconFolderPlus,
  IconUpload,
  IconDownload,
  IconSettings,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react'

type MenuItem =
  | { separator: true }
  | { icon: React.ReactNode; label: string; onClick: () => void; checked?: boolean }

interface ActionsMenuProps {
  isLocal: boolean
  showPermissions: boolean
  onRefresh: () => void
  onCreateFolder: () => void
  onTogglePermissions: () => void
  onUpload?: () => void
  onDownload?: () => void
  onChangePermissions?: () => void
}

export function ActionsMenu({
  isLocal,
  showPermissions,
  onRefresh,
  onCreateFolder,
  onTogglePermissions,
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
        setIsOpen(false)
        onRefresh()
      }
    },
    {
      icon: <IconFolderPlus size={16} />,
      label: '新建文件夹',
      onClick: () => {
        setIsOpen(false)
        // 使用 setTimeout 确保菜单关闭后再显示 prompt
        setTimeout(() => onCreateFolder(), 0)
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

  // 添加显示设置分隔符和选项
  menuItems.push({ separator: true })
  menuItems.push({
    icon: showPermissions ? <IconEye size={16} /> : <IconEyeOff size={16} />,
    label: showPermissions ? '隐藏权限列' : '显示权限列',
    onClick: () => {
      onTogglePermissions()
      setIsOpen(false)
    },
    checked: showPermissions
  })

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-md cursor-pointer px-2 py-1 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
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
