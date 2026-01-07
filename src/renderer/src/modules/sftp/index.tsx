import { useAtomValue, useSetAtom } from 'jotai'
import { hostsAtom } from '@/store/hosts'
import { tabsAtom, closeTabAtom } from '@/store/tabs'
import { useSftpConnection } from '@/hooks/useSftpConnection'
import { DualPanelManager } from './components/DualPanelManager'
import { SftpConnecting } from './components/SftpConnecting'
import { AnimatePresence, motion } from 'motion/react'

interface SftpModuleProps {
  tabId: string
}

export default function SftpModule({ tabId }: SftpModuleProps) {
  const hosts = useAtomValue(hostsAtom)
  const tabs = useAtomValue(tabsAtom)
  const closeTab = useSetAtom(closeTabAtom)

  // 查找标签页和关联的主机
  const tab = tabs.find((t) => t.id === tabId)
  const host = tab?.hostId ? hosts.find((h) => h.id === tab.hostId) : undefined

  const { status, error, isConnected, reconnect } = useSftpConnection(tabId, host)

  const handleClose = () => {
    closeTab(tabId)
  }

  // 如果主机未找到则显示错误
  if (!host) {
    return (
      <div className="flex h-full w-full flex-1 items-center justify-center bg-neutral-900">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-400">Host Not Found</h1>
          <p className="mt-2 text-neutral-400">
            The host configuration for this connection could not be found.
          </p>
          <button
            onClick={handleClose}
            className="mt-4 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
          >
            Close Tab
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* 文件管理器 - 连接成功后始终渲染 */}
      {isConnected && <DualPanelManager tabId={tabId} hostLabel={host.name} />}

      {/* 连接中遮罩层，带渐出动画 */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            key="connecting"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 z-10"
          >
            <SftpConnecting
              host={host}
              status={status}
              error={error}
              onClose={handleClose}
              onReconnect={reconnect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
