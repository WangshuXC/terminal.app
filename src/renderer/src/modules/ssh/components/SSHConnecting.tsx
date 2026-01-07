import { useState } from 'react'
import { HostData } from '@/store/hosts'
import { SshConnectionLog, SshConnectionStatus } from '../../../../../shared/types'
import {
  IconServer,
  IconTerminal2,
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle
} from '@tabler/icons-react'

interface SSHConnectingProps {
  host: HostData
  status: SshConnectionStatus
  progress: number
  logs: SshConnectionLog[]
  error: string | null
  onClose: () => void
  onReconnect: () => void
}

export function SSHConnecting({
  host,
  status,
  progress,
  logs,
  error,
  onClose,
  onReconnect
}: SSHConnectingProps) {
  const [showLogs, setShowLogs] = useState(true)

  const isConnecting = status === 'connecting' || status === 'authenticating'
  const isError = status === 'error'
  const isDisconnected = status === 'disconnected'

  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <div className="w-full max-w-2xl px-6">
        {/* Host Info Card */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <IconServer size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {host.address}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                SSH {host.address}:{host.port}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-1 rounded-lg bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
          >
            {showLogs ? 'Hide' : 'Show'} logs
            {showLogs ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                isError
                  ? 'bg-red-100 text-red-500 dark:bg-red-900/30'
                  : 'bg-blue-100 text-blue-500 dark:bg-blue-900/30'
              }`}
            >
              {isConnecting ? (
                <IconLoader2 size={18} className="animate-spin" />
              ) : isError ? (
                <IconX size={18} />
              ) : (
                <IconServer size={18} />
              )}
            </div>

            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                  isError ? 'bg-red-500' : 'bg-linear-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                progress >= 100
                  ? 'bg-green-100 text-green-500 dark:bg-green-900/30'
                  : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-700'
              }`}
            >
              {progress >= 100 ? <IconCheck size={18} /> : <IconTerminal2 size={18} />}
            </div>
          </div>
        </div>

        {/* Connection Logs */}
        {showLogs && (
          <div className="mb-8 max-h-80 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
            {logs.length === 0 ? (
              <p className="text-center text-sm text-neutral-400">Waiting for connection...</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <LogItem key={index} log={log} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <IconAlertTriangle size={20} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Connection Failed</p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-200 px-6 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
          >
            Close
          </button>
          {(isError || isDisconnected) && (
            <button
              onClick={onReconnect}
              className="rounded-lg bg-linear-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40"
            >
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface LogItemProps {
  log: SshConnectionLog
}

function LogItem({ log }: LogItemProps) {
  const getIcon = () => {
    if (log.icon) {
      return <span className="text-base">{log.icon}</span>
    }
    switch (log.type) {
      case 'success':
        return <IconCheck size={16} className="text-green-500" />
      case 'error':
        return <IconX size={16} className="text-red-500" />
      case 'warning':
        return <IconAlertTriangle size={16} className="text-amber-500" />
      default:
        return <IconInfoCircle size={16} className="text-blue-500" />
    }
  }

  const getTextColor = () => {
    switch (log.type) {
      case 'success':
        return 'text-green-700 dark:text-green-400'
      case 'error':
        return 'text-red-700 dark:text-red-400'
      case 'warning':
        return 'text-amber-700 dark:text-amber-400'
      default:
        return 'text-neutral-700 dark:text-neutral-300'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0">{getIcon()}</span>
      <p className={`font-mono text-sm ${getTextColor()}`}>{log.message}</p>
    </div>
  )
}
