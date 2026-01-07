import { useAtomValue, useSetAtom } from 'jotai'
import { AnimatePresence, motion } from 'motion/react'
import { hostsAtom } from '@/store/hosts'
import { tabsAtom, closeTabAtom } from '@/store/tabs'
import { useSSHConnection } from '@/hooks/useSSHConnection'
import { SSHConnecting } from '@/components/ssh/SSHConnecting'
import { SSHTerminal } from '@/components/ssh/SSHTerminal'

interface SshModuleProps {
  tabId: string
}

export default function SshModule({ tabId }: SshModuleProps) {
  const hosts = useAtomValue(hostsAtom)
  const tabs = useAtomValue(tabsAtom)
  const closeTab = useSetAtom(closeTabAtom)

  // 查找标签页和关联的主机
  const tab = tabs.find((t) => t.id === tabId)
  const host = tab?.hostId ? hosts.find((h) => h.id === tab.hostId) : undefined

  const { status, progress, logs, error, isConnected, reconnect, setTerminalSize } =
    useSSHConnection(tabId, host)

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
      {/* 终端层 - 连接成功后始终渲染 */}
      {isConnected && <SSHTerminal tabId={tabId} onResize={setTerminalSize} />}

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
            <SSHConnecting
              host={host}
              status={status}
              progress={progress}
              logs={logs}
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
