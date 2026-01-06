import { useAtomValue } from 'jotai'
import { activeTabAtom, tabsAtom } from '@/store/tabs'
import EntryModule from './modules/entry'
import SshModule from './modules/ssh'
import TerminalModule from './modules/terminal'
import TabBar from './components/TabBar'

function App(): React.JSX.Element {
  const activeTab = useAtomValue(activeTabAtom)
  const tabs = useAtomValue(tabsAtom)

  return (
    <div className="flex h-screen flex-col bg-neutral-900">
      <TabBar />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Vaults tab - always render when active */}
        {activeTab.type === 'vaults' && <EntryModule />}

        {/* SSH tabs - keep all instances alive */}
        {tabs
          .filter((tab) => tab.type === 'ssh')
          .map((tab) => (
            <div
              key={tab.id}
              className="absolute inset-0"
              style={{ display: activeTab.id === tab.id ? 'flex' : 'none' }}
            >
              <SshModule tabId={tab.id} />
            </div>
          ))}

        {/* Terminal tabs - keep all instances alive */}
        {tabs
          .filter((tab) => tab.type === 'terminal')
          .map((tab) => (
            <div
              key={tab.id}
              className="absolute inset-0"
              style={{ display: activeTab.id === tab.id ? 'flex' : 'none' }}
            >
              <TerminalModule tabId={tab.id} />
            </div>
          ))}
      </div>
    </div>
  )
}

export default App
