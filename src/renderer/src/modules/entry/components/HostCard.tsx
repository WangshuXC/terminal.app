import { IconServer, IconTrash, IconPencil, IconTerminal, IconFolder } from '@tabler/icons-react'
import { HostData } from '@/store/hosts'

export interface HostCardProps {
  host: HostData
  onConnect: () => void
  onSftpConnect: () => void
  onDelete: (e: React.MouseEvent) => void
  onEdit: (e: React.MouseEvent) => void
}

export function HostCard({ host, onConnect, onSftpConnect, onDelete, onEdit }: HostCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-all hover:shadow-lg hover:shadow-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
      {/* Action Buttons */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-all group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
        >
          <IconPencil size={16} />
        </button>
        <button
          onClick={onDelete}
          className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition-all hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
        >
          <IconTrash size={16} />
        </button>
      </div>

      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white mb-3">
        <IconServer size={24} />
      </div>

      {/* Host Info */}
      <div className="flex flex-col mb-3">
        <h3 className="mb-1 truncate text-base font-semibold text-neutral-900 dark:text-white">
          {host.name}
        </h3>
        <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
          {host.username}@{host.address}
        </p>
      </div>

      {/* Connection Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onConnect}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <IconTerminal size={16} />
          SSH
        </button>
        <button
          onClick={onSftpConnect}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-md transition-colors"
        >
          <IconFolder size={16} />
          SFTP
        </button>
      </div>
    </div>
  )
}
