import React from 'react'
import { motion } from 'motion/react'
import type { FileTransferProgress } from '@shared/types'

interface TransferProgressProps {
  transfers: FileTransferProgress[]
  onCancel?: (id: string) => void
}

export const TransferProgress: React.FC<TransferProgressProps> = ({ transfers, onCancel }) => {
  if (transfers.length === 0) return null

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds: number): string => {
    if (seconds === Infinity || isNaN(seconds)) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            文件传输 ({transfers.length})
          </h3>
          <button
            onClick={() => transfers.forEach((t) => onCancel?.(t.id))}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            全部取消
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {transfers.map((transfer) => (
            <motion.div
              key={transfer.id}
              layout
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      transfer.type === 'upload' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {transfer.fileName}
                  </span>
                </div>
                <button
                  onClick={() => onCancel?.(transfer.id)}
                  className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  取消
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>{transfer.type === 'upload' ? '上传' : '下载'}</span>
                  <span>{transfer.percentage.toFixed(1)}%</span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full ${
                      transfer.type === 'upload' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${transfer.percentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {formatBytes(transfer.transferred)} / {formatBytes(transfer.total)}
                  </span>
                  <span>
                    {formatBytes(transfer.speed)}/s · {formatTime(transfer.estimatedTime)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
