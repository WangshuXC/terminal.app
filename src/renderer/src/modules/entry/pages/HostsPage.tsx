import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { addSshTabAtom, addTerminalTabAtom } from '@/store/tabs'
import { hostsAtom, addHostAtom, removeHostAtom, HostData } from '@/store/hosts'
import { SlidePanel } from '@/components/ui/SlidePanel'
import { NewHostForm, NewHostFormData } from '@/components/forms/NewHostForm'
import { IconPlus, IconServer, IconTrash, IconTerminal2 } from '@tabler/icons-react'

export default function HostsPage() {
  const [hosts] = useAtom(hostsAtom)
  const addHost = useSetAtom(addHostAtom)
  const removeHost = useSetAtom(removeHostAtom)
  const addSshTab = useSetAtom(addSshTabAtom)
  const addTerminalTab = useSetAtom(addTerminalTabAtom)

  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const handleAddHost = (formData: NewHostFormData) => {
    const newHost = addHost(formData)
    setIsPanelOpen(false)
    // 自动打开 SSH Tab
    addSshTab({ hostId: newHost.id, label: `${formData.name}` })
  }

  const handleConnectHost = (host: HostData) => {
    addSshTab({ hostId: host.id, label: host.name })
  }

  const handleDeleteHost = (e: React.MouseEvent, hostId: string) => {
    e.stopPropagation()
    removeHost(hostId)
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Hosts</h1>
        <div className="flex gap-3">
          <button
            onClick={() => addTerminalTab()}
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
          >
            <IconTerminal2 size={18} />
            Local Terminal
          </button>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-linear-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40 active:scale-[0.98]"
          >
            <IconPlus size={18} />
            New Host
          </button>
        </div>
      </div>

      {/* Host Cards Grid */}
      {hosts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-neutral-500 dark:text-neutral-400">
          <IconServer size={64} strokeWidth={1} className="opacity-50" />
          <p className="text-lg">No hosts configured</p>
          <p className="text-sm">Click &quot;New Host&quot; to add your first SSH connection</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hosts.map((host) => (
            <HostCard
              key={host.id}
              host={host}
              onConnect={() => handleConnectHost(host)}
              onDelete={(e) => handleDeleteHost(e, host.id)}
            />
          ))}
        </div>
      )}

      {/* New Host Slide Panel */}
      <SlidePanel
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        side="right"
        width="380px"
      >
        <NewHostForm onSubmit={handleAddHost} />
      </SlidePanel>
    </div>
  )
}

interface HostCardProps {
  host: HostData
  onConnect: () => void
  onDelete: (e: React.MouseEvent) => void
}

function HostCard({ host, onConnect, onDelete }: HostCardProps) {
  return (
    <div
      onClick={onConnect}
      className="group relative flex gap-4 cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-all hover:shadow-lg hover:shadow-neutral-200 dark:border-neutral-700 dark:bg-neutral-800"
    >
      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="absolute right-3 top-3 cursor-pointer rounded-lg p-1.5 text-neutral-400 opacity-0 transition-all hover:bg-red-100 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/30"
      >
        <IconTrash size={16} />
      </button>

      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white">
        <IconServer size={24} />
      </div>

      {/* Host Info */}
      <div className="flex flex-col">
        <h3 className="mb-1 truncate text-base font-semibold text-neutral-900 dark:text-white">
          {host.name}
        </h3>
        <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
          {host.username}@{host.address}
        </p>
      </div>
    </div>
  )
}
