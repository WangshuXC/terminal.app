import { useState, useCallback } from 'react'
import type { FileTransferProgress } from '@shared/types'

export interface TransferTask {
  id: string
  type: 'upload' | 'download'
  localPath: string
  remotePath: string
  fileName: string
  fileSize: number
  status: 'pending' | 'active' | 'completed' | 'error' | 'cancelled'
  error?: string
}

export const useFileTransfer = () => {
  const [transfers, setTransfers] = useState<FileTransferProgress[]>([])
  const [queue, setQueue] = useState<TransferTask[]>([])

  const addTransfer = useCallback((task: Omit<TransferTask, 'id' | 'status'>) => {
    const id = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newTask: TransferTask = {
      ...task,
      id,
      status: 'pending'
    }

    setQueue((prev) => [...prev, newTask])
    return id
  }, [])

  const updateProgress = useCallback((progress: FileTransferProgress) => {
    setTransfers((prev) => {
      const existing = prev.find((t) => t.id === progress.id)
      if (existing) {
        return prev.map((t) => (t.id === progress.id ? progress : t))
      } else {
        return [...prev, progress]
      }
    })
  }, [])

  const removeTransfer = useCallback((id: string) => {
    setTransfers((prev) => prev.filter((t) => t.id !== id))
    setQueue((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const cancelTransfer = useCallback(
    (id: string) => {
      setQueue((prev) =>
        prev.map((task) => (task.id === id ? { ...task, status: 'cancelled' } : task))
      )
      removeTransfer(id)
    },
    [removeTransfer]
  )

  const clearCompleted = useCallback(() => {
    setTransfers((prev) => prev.filter((t) => t.percentage < 100))
    setQueue((prev) => prev.filter((task) => task.status !== 'completed'))
  }, [])

  const getActiveTransfers = useCallback(() => {
    return transfers.filter((t) => t.percentage < 100)
  }, [transfers])

  const getPendingTasks = useCallback(() => {
    return queue.filter((task) => task.status === 'pending')
  }, [queue])

  return {
    transfers,
    queue,
    addTransfer,
    updateProgress,
    removeTransfer,
    cancelTransfer,
    clearCompleted,
    getActiveTransfers,
    getPendingTasks
  }
}
