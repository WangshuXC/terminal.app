import { useAtom, useSetAtom } from 'jotai'
import { tabsAtom, activeTabIdAtom, closeTabAtom } from '@/store/tabs'
import { IconX, IconTerminal2, IconEye, IconServer } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

export default function TabBar() {
  const [tabs] = useAtom(tabsAtom)
  const [activeTabId, setActiveTabId] = useAtom(activeTabIdAtom)
  const closeTab = useSetAtom(closeTabAtom)

  return (
    <div
      className={cn(
        'flex h-12 items-center bg-[#1e2a3a] overflow-x-auto gap-2 px-2',
        isMac && 'pl-22'
      )}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div
        className="flex h-full items-center gap-2 py-2"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'group flex h-full items-center gap-2 px-4 cursor-pointer rounded-lg transition-all',
              activeTabId === tab.id
                ? 'bg-[#2d3f54] text-white'
                : 'bg-transparent text-neutral-400 hover:bg-[#2d3f54]/50 hover:text-white'
            )}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.type === 'vaults' ? (
              <IconEye className="h-4 w-4 shrink-0" />
            ) : tab.type === 'ssh' ? (
              <IconServer className="h-4 w-4 shrink-0" />
            ) : (
              <IconTerminal2 className="h-4 w-4 shrink-0" />
            )}
            <span
              className={cn(
                'text-sm whitespace-nowrap overflow-hidden text-ellipsis transition-all',
                activeTabId === tab.id && tab.type !== 'vaults' ? 'max-w-40 mr-10' : 'max-w-24'
              )}
            >
              {tab.label}
            </span>
            {tab.type !== 'vaults' && (
              <button
                className={cn(
                  'ml-1 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-neutral-600 transition-opacity',
                  activeTabId === tab.id && 'opacity-100'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
              >
                <IconX className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
