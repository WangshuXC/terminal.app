import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import type { FilePermissions } from '@shared/types'

interface PermissionEditorProps {
  permissions: FilePermissions
  onSave: (permissions: string) => void
  onCancel: () => void
  isVisible: boolean
}

export const PermissionEditor: React.FC<PermissionEditorProps> = ({
  permissions,
  onSave,
  onCancel,
  isVisible
}) => {
  const [editPermissions, setEditPermissions] = useState(permissions)
  const [octalValue, setOctalValue] = useState(permissions.octal)

  useEffect(() => {
    setEditPermissions(permissions)
    setOctalValue(permissions.octal)
  }, [permissions])

  const updatePermissions = (
    category: 'owner' | 'group' | 'others',
    permission: 'read' | 'write' | 'execute',
    value: boolean
  ) => {
    const newPermissions = {
      ...editPermissions,
      [category]: {
        ...editPermissions[category],
        [permission]: value
      }
    }
    setEditPermissions(newPermissions)

    // 计算八进制值
    const calculateOctal = (perms: typeof newPermissions) => {
      const getValue = (category: 'owner' | 'group' | 'others') => {
        let value = 0
        if (perms[category].read) value += 4
        if (perms[category].write) value += 2
        if (perms[category].execute) value += 1
        return value
      }

      return `${getValue('owner')}${getValue('group')}${getValue('others')}`
    }

    setOctalValue(calculateOctal(newPermissions))
  }

  const handleOctalChange = (value: string) => {
    if (!/^[0-7]{3}$/.test(value)) return

    setOctalValue(value)

    const parseOctal = (octal: string) => {
      const digits = octal.split('').map(Number)

      const parseDigit = (digit: number) => ({
        read: (digit & 4) !== 0,
        write: (digit & 2) !== 0,
        execute: (digit & 1) !== 0
      })

      return {
        owner: parseDigit(digits[0]),
        group: parseDigit(digits[1]),
        others: parseDigit(digits[2]),
        octal: value
      }
    }

    setEditPermissions(parseOctal(value))
  }

  const handleSave = () => {
    onSave(octalValue)
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          编辑文件权限
        </h3>

        <div className="space-y-4">
          {/* 八进制输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              八进制权限
            </label>
            <input
              type="text"
              value={octalValue}
              onChange={(e) => handleOctalChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="755"
              maxLength={3}
            />
          </div>

          {/* 权限复选框 */}
          <div className="space-y-3">
            {(['owner', 'group', 'others'] as const).map((category) => (
              <div
                key={category}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {category === 'owner' ? '所有者' : category === 'group' ? '组' : '其他'}
                </h4>
                <div className="flex space-x-4">
                  {(['read', 'write', 'execute'] as const).map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editPermissions[category][permission]}
                        onChange={(e) => updatePermissions(category, permission, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {permission === 'read' ? '读' : permission === 'write' ? '写' : '执行'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 权限预览 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">权限字符串:</div>
            <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
              {[
                editPermissions.owner.read ? 'r' : '-',
                editPermissions.owner.write ? 'w' : '-',
                editPermissions.owner.execute ? 'x' : '-',
                editPermissions.group.read ? 'r' : '-',
                editPermissions.group.write ? 'w' : '-',
                editPermissions.group.execute ? 'x' : '-',
                editPermissions.others.read ? 'r' : '-',
                editPermissions.others.write ? 'w' : '-',
                editPermissions.others.execute ? 'x' : '-'
              ].join('')}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
