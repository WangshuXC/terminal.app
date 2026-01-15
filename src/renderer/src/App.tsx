import { useAtomValue } from 'jotai'
import { activeTabAtom, tabsAtom } from '@/store/tabs'
import EntryModule from './modules/entry'
import SshModule from './modules/ssh'
import SftpModule from './modules/sftp'
import TabBar from './components/TabBar'
import { useMemo } from 'react'

function App(): React.JSX.Element {
  const activeTab = useAtomValue(activeTabAtom)
  const tabs = useAtomValue(tabsAtom)

  // 只渲染当前活跃的SSH实例，减少内存占用
  const activeSshTabs = useMemo(
    () => tabs.filter((tab) => tab.type === 'ssh' && tab.id === activeTab.id),
    [tabs, activeTab.id]
  )

  return (
    <div className="flex h-screen flex-col bg-neutral-900">
      <TabBar />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Vaults tab - always render when active */}
        {activeTab.type === 'vaults' && <EntryModule />}

        {/* SFTP tab - 常驻 tab，active 时显示 */}
        {activeTab.type === 'sftp' && activeTab.id === 'sftp' && <SftpModule />}

        {/* SSH tabs - only render active tab */}
        {activeSshTabs.map((tab) => (
          <div key={tab.id} className="absolute inset-0 flex">
            <SshModule tabId={tab.id} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
