import { atom } from 'jotai'

export type AuthType = 'password' | 'privateKey'

export interface HostData {
  id: string
  name: string
  address: string
  port: number
  authType: AuthType
  username: string
  password?: string
  privateKey?: string
  createdAt: number
}

const STORAGE_KEY = 'terminal-app-hosts'

// 从 localStorage 加载 hosts
function loadHostsFromStorage(): HostData[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

// 保存 hosts 到 localStorage
function saveHostsToStorage(hosts: HostData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hosts))
}

// Hosts 列表 atom
export const hostsAtom = atom<HostData[]>(loadHostsFromStorage())

// 添加 Host 的 action atom
export const addHostAtom = atom(null, (get, set, hostData: Omit<HostData, 'id' | 'createdAt'>) => {
  const newHost: HostData = {
    ...hostData,
    id: `host-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now()
  }
  const hosts = [...get(hostsAtom), newHost]
  set(hostsAtom, hosts)
  saveHostsToStorage(hosts)
  return newHost
})

// 删除 Host 的 action atom
export const removeHostAtom = atom(null, (get, set, hostId: string) => {
  const hosts = get(hostsAtom).filter((h) => h.id !== hostId)
  set(hostsAtom, hosts)
  saveHostsToStorage(hosts)
})

// 更新 Host 的 action atom
export const updateHostAtom = atom(
  null,
  (get, set, { id, data }: { id: string; data: Partial<HostData> }) => {
    const hosts = get(hostsAtom).map((h) => (h.id === id ? { ...h, ...data } : h))
    set(hostsAtom, hosts)
    saveHostsToStorage(hosts)
  }
)
