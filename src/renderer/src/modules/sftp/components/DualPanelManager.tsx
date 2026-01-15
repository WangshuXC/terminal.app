import React, { useState, useEffect, useRef } from 'react'
import { FilePanel, FilePanelRef } from './FilePanel'

interface DualPanelManagerProps {
  tabId: string
  hostLabel: string
}

export const DualPanelManager: React.FC<DualPanelManagerProps> = ({ tabId, hostLabel }) => {
  const [localPath, setLocalPath] = useState('')
  const [remotePath, setRemotePath] = useState('/')

  const localPanelRef = useRef<FilePanelRef>(null)
  const remotePanelRef = useRef<FilePanelRef>(null)

  // 获取用户主目录作为初始本地路径
  useEffect(() => {
    const getHomeDirectory = async () => {
      try {
        const homeDir = await window.localApi.getHome()
        setLocalPath(homeDir)
      } catch (error) {
        console.error('Failed to get home directory:', error)
        setLocalPath('/')
      }
    }

    getHomeDirectory()
  }, [])

  // 上传文件（本地 -> 远程）
  const handleUpload = async (localFilePath: string) => {
    try {
      const fileName = localFilePath.split('/').pop() || 'unknown'
      const targetPath = remotePath.endsWith('/')
        ? `${remotePath}${fileName}`
        : `${remotePath}/${fileName}`

      await window.sftpApi.upload({
        id: tabId,
        localPath: localFilePath,
        remotePath: targetPath
      })

      // 上传成功后刷新远程面板
      remotePanelRef.current?.refresh()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
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
        id: tabId,
        remotePath: remoteFilePath,
        localPath: targetPath
      })

      // 下载成功后刷新本地面板
      localPanelRef.current?.refresh()
    } catch (error) {
      console.error('Download failed:', error)
      alert('下载失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  return (
    <div className="flex h-full w-full">
      {/* 左侧本地文件面板 */}
      <div className="flex-1 border-r border-neutral-200 dark:border-neutral-700">
        <FilePanel
          ref={localPanelRef}
          mode="local"
          title="本地文件"
          currentPath={localPath}
          onPathChange={setLocalPath}
          onTransfer={handleUpload}
        />
      </div>

      {/* 右侧远程文件面板 */}
      <div className="flex-1">
        <FilePanel
          ref={remotePanelRef}
          mode="remote"
          title={hostLabel}
          tabId={tabId}
          currentPath={remotePath}
          onPathChange={setRemotePath}
          onTransfer={handleDownload}
        />
      </div>
    </div>
  )
}
