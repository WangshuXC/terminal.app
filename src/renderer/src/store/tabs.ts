import { atom } from 'jotai'

export type TabType = 'vaults' | 'ssh' | 'terminal'

export interface Tab {
  id: string
  type: TabType
  label: string
  hostId?: string // SSH tab 关联的 host ID
}

// 默认有一个vaults标签
const defaultTabs: Tab[] = [{ id: 'vaults', type: 'vaults', label: 'Vaults' }]

export const tabsAtom = atom<Tab[]>(defaultTabs)
export const activeTabIdAtom = atom<string>('vaults')

// 派生atom：获取当前激活的tab
export const activeTabAtom = atom((get) => {
  const tabs = get(tabsAtom)
  const activeId = get(activeTabIdAtom)
  return tabs.find((tab) => tab.id === activeId) || tabs[0]
})

// 用于生成唯一ID的计数器
let sshCounter = 0
let terminalCounter = 0

// 添加新SSH标签的action atom (支持传入 host 信息)
export const addSshTabAtom = atom(
  null,
  (get, set, hostInfo?: { hostId: string; label: string }) => {
    sshCounter++
    const tabs = get(tabsAtom)
    const baseLabel = hostInfo?.label || 'SSH'

    // 统计相同 baseLabel 的 SSH tab 数量
    const sameLabelCount = tabs.filter(
      (tab) =>
        tab.type === 'ssh' && (tab.label === baseLabel || tab.label.startsWith(`${baseLabel} (`))
    ).length

    const newTab: Tab = {
      id: `ssh-${sshCounter}`,
      type: 'ssh',
      label: sameLabelCount === 0 ? baseLabel : `${baseLabel} - ${sameLabelCount}`,
      hostId: hostInfo?.hostId
    }
    set(tabsAtom, [...get(tabsAtom), newTab])
    set(activeTabIdAtom, newTab.id)
    return newTab
  }
)

// 添加新Terminal标签的action atom
export const addTerminalTabAtom = atom(null, (get, set) => {
  terminalCounter++
  const newTab: Tab = {
    id: `terminal-${terminalCounter}`,
    type: 'terminal',
    label: terminalCounter === 1 ? 'Local Terminal' : `Local Terminal - ${terminalCounter - 1}`
  }
  set(tabsAtom, [...get(tabsAtom), newTab])
  set(activeTabIdAtom, newTab.id)
  return newTab
})

// 关闭标签的action atom
export const closeTabAtom = atom(null, (get, set, tabId: string) => {
  const tabs = get(tabsAtom)
  const activeId = get(activeTabIdAtom)

  // 不能关闭vaults标签
  if (tabId === 'vaults') return

  const newTabs = tabs.filter((tab) => tab.id !== tabId)
  set(tabsAtom, newTabs)

  // 如果关闭的是当前激活的标签，切换到前一个标签
  if (activeId === tabId) {
    const closedIndex = tabs.findIndex((tab) => tab.id === tabId)
    const newActiveIndex = Math.max(0, closedIndex - 1)
    set(activeTabIdAtom, newTabs[newActiveIndex]?.id || 'vaults')
  }
})
