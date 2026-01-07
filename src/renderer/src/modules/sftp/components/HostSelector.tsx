import React, { useState } from 'react'
import { useAtomValue } from 'jotai'
import { motion, AnimatePresence } from 'motion/react'
import { hostsAtom, HostData } from '@/store/hosts'

interface HostSelectorProps {
  selectedHostId?: string
  onHostSelect: (host: HostData) => void
  disabled?: boolean
}

export const HostSelector: React.FC<HostSelectorProps> = ({
  selectedHostId,
  onHostSelect,
  disabled = false
}) => {
  const hosts = useAtomValue(hostsAtom)
  const [isOpen, setIsOpen] = useState(false)

  const selectedHost = hosts.find((h) => h.id === selectedHostId)

  const handleHostClick = (host: HostData) => {
    onHostSelect(host)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-sm
          border border-gray-300 dark:border-gray-600 rounded-md
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
          ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        `}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${selectedHost ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          <span className="truncate">{selectedHost ? selectedHost.name : '选择主机'}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {hosts.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">暂无主机配置</div>
            ) : (
              hosts.map((host) => (
                <button
                  key={host.id}
                  onClick={() => handleHostClick(host)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 text-sm text-left
                    hover:bg-gray-100 dark:hover:bg-gray-600
                    ${
                      selectedHostId === host.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }
                  `}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedHostId === host.id ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{host.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {host.username}@{host.address}:{host.port}
                    </div>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部关闭下拉菜单 */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
