import { useSetAtom } from 'jotai'
import { addSshTabAtom, addTerminalTabAtom } from '@/store/tabs'

export default function HostsPage() {
  const addSshTab = useSetAtom(addSshTabAtom)
  const addTerminalTab = useSetAtom(addTerminalTabAtom)

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Hosts</h1>
      <div className="flex gap-3">
        <button
          onClick={() => addSshTab()}
          className="w-fit rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
        >
          New SSH Connection
        </button>
        <button
          onClick={() => addTerminalTab()}
          className="w-fit rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          New Local Terminal
        </button>
      </div>
    </div>
  )
}
