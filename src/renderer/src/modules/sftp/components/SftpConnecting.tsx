import { HostData } from '@/store/hosts'
import { SftpConnectionStatus } from '../../../../../shared/types'
import {
  IconServer,
  IconFolder,
  IconLoader2,
  IconCheck,
  IconX,
  IconAlertTriangle
} from '@tabler/icons-react'

interface SftpConnectingProps {
  host: HostData
  status: SftpConnectionStatus
  error: string | null
  onClose: () => void
  onReconnect: () => void
}

export function SftpConnecting({ host, status, error, onClose, onReconnect }: SftpConnectingProps) {
  const isConnecting = status === 'connecting'
  const isError = status === 'error'
  const isDisconnected = status === 'disconnected'

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting to SFTP server...'
      case 'connected':
        return 'Connected successfully!'
      case 'error':
        return 'Connection failed'
      case 'disconnected':
        return 'Disconnected'
      default:
        return 'Initializing...'
    }
  }

  const getStatusIcon = () => {
    if (isConnecting) {
      return <IconLoader2 size={24} className="animate-spin text-blue-500" />
    } else if (isError) {
      return <IconX size={24} className="text-red-500" />
    } else if (status === 'connected') {
      return <IconCheck size={24} className="text-green-500" />
    } else {
      return <IconServer size={24} className="text-neutral-500" />
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <div className="w-full max-w-md px-6">
        {/* Host Info Card */}
        <div className="mb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30">
              <IconFolder size={32} />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              SFTP Connection
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {host.address}:{host.port}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">{getStatusIcon()}</div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {getStatusText()}
          </p>
        </div>

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
              className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-600 hover:to-green-700 hover:shadow-green-500/40"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
