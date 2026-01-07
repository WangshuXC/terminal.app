import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { addSshTabAtom, addTerminalTabAtom } from '@/store/tabs'
import { hostsAtom, addHostAtom, removeHostAtom, updateHostAtom, HostData } from '@/store/hosts'
import { SlidePanel } from '@/components/ui/SlidePanel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter
} from '@renderer/components/ui/AlertDialog'
import { NewHostForm, NewHostFormData } from '../components/NewHostForm'
import { HostCard } from '../components/HostCard'
import { IconPlus, IconServer, IconTerminal2, IconX } from '@tabler/icons-react'

export default function HostsPage() {
  const [hosts] = useAtom(hostsAtom)
  const addHost = useSetAtom(addHostAtom)
  const removeHost = useSetAtom(removeHostAtom)
  const updateHost = useSetAtom(updateHostAtom)
  const addSshTab = useSetAtom(addSshTabAtom)
  const addTerminalTab = useSetAtom(addTerminalTabAtom)

  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingHost, setEditingHost] = useState<HostData | null>(null)
  const [deletingHost, setDeletingHost] = useState<HostData | null>(null)

  const handleAddHost = (formData: NewHostFormData) => {
    const newHost = addHost(formData)
    setIsPanelOpen(false)
    // 自动打开 SSH Tab
    addSshTab({ hostId: newHost.id, label: `${formData.name}` })
  }

  const handleEditHost = (e: React.MouseEvent, host: HostData) => {
    e.stopPropagation()
    setEditingHost(host)
  }

  const handleUpdateHost = (formData: NewHostFormData) => {
    if (editingHost) {
      updateHost({ id: editingHost.id, data: formData })
      setEditingHost(null)
    }
  }

  const handleConnectHost = (host: HostData) => {
    addSshTab({ hostId: host.id, label: host.name })
  }

  const handleDeleteHost = (e: React.MouseEvent, host: HostData) => {
    e.stopPropagation()
    setDeletingHost(host)
  }

  const confirmDeleteHost = () => {
    if (deletingHost) {
      removeHost(deletingHost.id)
      setDeletingHost(null)
    }
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
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition-all hover:bg-sky-800 hover:shadow-sky-600/40 active:scale-[0.98]"
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
              onDelete={(e) => handleDeleteHost(e, host)}
              onEdit={(e) => handleEditHost(e, host)}
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

      {/* Edit Host Slide Panel */}
      <SlidePanel
        open={!!editingHost}
        onClose={() => setEditingHost(null)}
        side="right"
        width="380px"
      >
        {editingHost && (
          <NewHostForm onSubmit={handleUpdateHost} initialData={editingHost} submitLabel="Save" />
        )}
      </SlidePanel>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingHost} onOpenChange={() => setDeletingHost(null)}>
        <AlertDialogContent className="gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-md select-none">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Remove a host</h2>
            <AlertDialogCancel className="h-fit cursor-pointer rounded-lg border-0 bg-transparent p-1.5 text-white shadow-none hover:bg-slate-600 hover:text-white">
              <IconX className="size-5" />
            </AlertDialogCancel>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-5 dark:bg-neutral-900">
            <p className="mb-4 text-neutral-600 dark:text-neutral-300">
              You are going to remove this host:
            </p>
            <div className="flex items-center gap-4 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-600 text-white">
                <IconServer size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {deletingHost?.name}
                </h3>
                <p className="text-sm text-neutral-500">ssh, {deletingHost?.username}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <AlertDialogFooter className="rounded-b-2xl bg-white px-6 pb-6 dark:bg-neutral-900">
            <AlertDialogAction
              onClick={confirmDeleteHost}
              className="rounded-lg cursor-pointer bg-[#f87171] px-6 py-2.5 text-white hover:bg-[#ef4444]"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
