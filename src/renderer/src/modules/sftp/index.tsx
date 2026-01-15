import { useState, useRef, useEffect, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { hostsAtom, HostData } from '@/store/hosts'
import { useSftpConnection } from '@/hooks/useSftpConnection'
import { FilePanel, FilePanelRef } from './components/FilePanel'
import {
  IconArrowLeft,
  IconSearch,
  IconServer,
  IconSortAscending,
  IconSortDescending,
  IconRefresh
} from '@tabler/icons-react'

type SortField = 'name' | 'address'
type SortOrder = 'asc' | 'desc'

export default function SftpModule() {
  const hosts = useAtomValue(hostsAtom)
  const [selectedHost, setSelectedHost] = useState<HostData | null>(null)
  const [localPath, setLocalPath] = useState('')
  const [remotePath, setRemotePath] = useState('/')

  // 搜索和排序状态
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const localPanelRef = useRef<FilePanelRef>(null)
  const remotePanelRef = useRef<FilePanelRef>(null)

  // 使用固定的 tabId 'sftp' 作为连接标识
  const { status, error, isConnected, reconnect, disconnect } = useSftpConnection(
    'sftp',
    selectedHost || undefined
  )

  // 过滤和排序 hosts
  const filteredHosts = useMemo(() => {
    let result = [...hosts]

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (host) =>
          host.name.toLowerCase().includes(query) ||
          host.address.toLowerCase().includes(query) ||
          host.username.toLowerCase().includes(query)
      )
    }

    // 排序
    result.sort((a, b) => {
      const aValue = a[sortField].toLowerCase()
      const bValue = b[sortField].toLowerCase()
      const comparison = aValue.localeCompare(bValue)
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [hosts, searchQuery, sortField, sortOrder])

  // 获取用户主目录作为初始本地路径
  useEffect(() => {
    const getHomeDirectory = async () => {
      try {
        const homeDir = await window.localApi.getHome()
        setLocalPath(homeDir)
      } catch (err) {
        console.error('Failed to get home directory:', err)
        setLocalPath('/')
      }
    }
    getHomeDirectory()
  }, [])

  // 选择 Host 并开始连接
  const handleHostSelect = (host: HostData) => {
    setSelectedHost(host)
    setRemotePath('/')
  }

  // 断开连接 / 返回选择页面
  const handleDisconnect = () => {
    disconnect()
    setSelectedHost(null)
  }

  // 切换排序
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // 上传文件（本地 -> 远程）
  const handleUpload = async (localFilePath: string) => {
    try {
      const fileName = localFilePath.split('/').pop() || 'unknown'
      const targetPath = remotePath.endsWith('/')
        ? `${remotePath}${fileName}`
        : `${remotePath}/${fileName}`

      await window.sftpApi.upload({
        id: 'sftp',
        localPath: localFilePath,
        remotePath: targetPath
      })

      remotePanelRef.current?.refresh()
    } catch (err) {
      console.error('Upload failed:', err)
      alert('上传失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  // 下载文件（远程 -> 本地）
  const handleDownload = async (remoteFilePath: string) => {
    try {
      const fileName = remoteFilePath.split('/').pop() || 'unknown'
      const targetPath = localPath.endsWith('/')
        ? `${localPath}${fileName}`
        : `${localPath}/${fileName}`

      await window.sftpApi.download({
        id: 'sftp',
        remotePath: remoteFilePath,
        localPath: targetPath
      })

      localPanelRef.current?.refresh()
    } catch (err) {
      console.error('Download failed:', err)
      alert('下载失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  // 渲染 Host 选择页面
  const renderHostSelectPage = () => (
    <div className="flex h-full flex-col bg-white dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-3 dark:border-neutral-700">
        <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Select Host
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-3 py-2.25 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search hosts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-0.5 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleSort('name')}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
              sortField === 'name'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700'
            }`}
          >
            Name
            {sortField === 'name' &&
              (sortOrder === 'asc' ? (
                <IconSortAscending className="h-3.5 w-3.5" />
              ) : (
                <IconSortDescending className="h-3.5 w-3.5" />
              ))}
          </button>
          <button
            onClick={() => toggleSort('address')}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
              sortField === 'address'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700'
            }`}
          >
            Address
            {sortField === 'address' &&
              (sortOrder === 'asc' ? (
                <IconSortAscending className="h-3.5 w-3.5" />
              ) : (
                <IconSortDescending className="h-3.5 w-3.5" />
              ))}
          </button>
        </div>
      </div>

      {/* Host List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Hosts ({filteredHosts.length})
        </div>

        {filteredHosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500 dark:text-neutral-400">
            {hosts.length === 0 ? (
              <>
                <IconServer className="mb-3 h-12 w-12 opacity-50" />
                <p className="text-sm">No hosts configured</p>
                <p className="mt-1 text-xs">Add a host in Vaults first</p>
              </>
            ) : (
              <>
                <IconSearch className="mb-3 h-12 w-12 opacity-50" />
                <p className="text-sm">No hosts match your search</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHosts.map((host) => (
              <button
                key={host.id}
                onClick={() => handleHostSelect(host)}
                className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm transition-all hover:shadow-md dark:bg-neutral-800 dark:hover:bg-neutral-750"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white">
                  <IconServer className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 dark:text-white truncate">
                    {host.name}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    ssh, {host.username}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // 渲染连接中页面
  const renderConnectingPage = () => (
    <div className="flex h-full flex-col bg-white dark:bg-neutral-800">
      {/* Header with back button - 与左侧工具栏高度对齐 */}
      <div className="flex items-center gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-700">
        <button
          onClick={handleDisconnect}
          className="flex h-6 w-6 items-center justify-center rounded text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <IconArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {selectedHost?.name}
        </h1>
      </div>

      {/* 占位行 - 与左侧面包屑高度对齐 */}
      <div className="flex items-center border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {selectedHost?.username}@{selectedHost?.address}:{selectedHost?.port}
        </span>
      </div>

      {/* Connecting content */}
      <div className="flex flex-1 items-center justify-center bg-white dark:bg-neutral-800">
        <div className="flex flex-col items-center gap-4">
          {status === 'connecting' && (
            <>
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Connecting...</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <IconServer className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Connection failed
              </p>
              {error && (
                <p className="max-w-xs text-center text-xs text-neutral-500 dark:text-neutral-400">
                  {error}
                </p>
              )}
              <button
                onClick={reconnect}
                className="mt-2 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <IconRefresh className="h-4 w-4" />
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-full w-full">
      {/* 左侧本地文件面板 */}
      <div className="flex-1 border-r border-neutral-200 dark:border-neutral-700">
        <FilePanel
          ref={localPanelRef}
          mode="local"
          title="Local"
          currentPath={localPath}
          onPathChange={setLocalPath}
          onTransfer={handleUpload}
        />
      </div>

      {/* 右侧：Host 选择页面 / 连接中 / 远程文件面板 */}
      <div className="flex-1 relative">
        {!selectedHost ? (
          // Host 选择页面
          renderHostSelectPage()
        ) : isConnected ? (
          // 已连接：显示远程文件面板
          <FilePanel
            ref={remotePanelRef}
            mode="remote"
            title={selectedHost.name}
            tabId="sftp"
            currentPath={remotePath}
            onPathChange={setRemotePath}
            onTransfer={handleDownload}
            onDisconnect={handleDisconnect}
          />
        ) : (
          // 连接中页面
          renderConnectingPage()
        )}
      </div>
    </div>
  )
}
