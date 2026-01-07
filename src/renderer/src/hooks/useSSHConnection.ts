import { useState, useEffect, useCallback, useRef } from 'react'
import { SshConnectionStatus, SshConnectionLog, SshConnectOptions } from '../../../shared/types'
import { HostData } from '@/store/hosts'

export interface SSHConnectionState {
  status: SshConnectionStatus
  progress: number
  logs: SshConnectionLog[]
  error: string | null
  isConnected: boolean
}

const initialState: SSHConnectionState = {
  status: 'idle',
  progress: 0,
  logs: [],
  error: null,
  isConnected: false
}

export function useSSHConnection(tabId: string, host: HostData | undefined) {
  const [state, setState] = useState<SSHConnectionState>(initialState)
  const isConnectingRef = useRef(false)
  const terminalSizeRef = useRef({ cols: 80, rows: 24 })

  const addLog = useCallback((log: SshConnectionLog) => {
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, log]
    }))
  }, [])

  const connect = useCallback(async () => {
    if (!host || isConnectingRef.current) return

    isConnectingRef.current = true
    setState({
      status: 'connecting',
      progress: 0,
      logs: [],
      error: null,
      isConnected: false
    })

    const options: SshConnectOptions = {
      id: tabId,
      host: host.address,
      port: host.port,
      username: host.username,
      authType: host.authType,
      password: host.password,
      privateKey: host.privateKey,
      cols: terminalSizeRef.current.cols,
      rows: terminalSizeRef.current.rows
    }

    const success = await window.sshApi.connect(options)
    isConnectingRef.current = false

    if (!success) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        isConnected: false
      }))
    }
  }, [tabId, host])

  const disconnect = useCallback(() => {
    window.sshApi.disconnect(tabId)
    setState(initialState)
  }, [tabId])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 100)
  }, [connect, disconnect])

  const setTerminalSize = useCallback((cols: number, rows: number) => {
    terminalSizeRef.current = { cols, rows }
  }, [])

  // 订阅 SSH 事件
  useEffect(() => {
    let transitionTimer: ReturnType<typeof setTimeout> | null = null

    const unSubStatus = window.sshApi.onStatus((payload) => {
      if (payload.id !== tabId) return

      // 立即更新状态和进度
      setState((prev) => ({
        ...prev,
        status: payload.status,
        progress: payload.progress
      }))

      // 延迟设置 isConnected 让用户看到进度动画
      if (payload.status === 'ready' && payload.progress >= 100) {
        transitionTimer = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            isConnected: true
          }))
        }, 800) // 等待 800ms 让动画完成
      }
    })

    const unSubLog = window.sshApi.onLog((payload) => {
      if (payload.id !== tabId) return
      addLog(payload.log)
    })

    const unSubError = window.sshApi.onError((payload) => {
      if (payload.id !== tabId) return
      setState((prev) => ({
        ...prev,
        error: payload.error,
        status: 'error'
      }))
    })

    const unSubExit = window.sshApi.onExit((payload) => {
      if (payload.id !== tabId) return
      setState((prev) => ({
        ...prev,
        status: 'disconnected',
        isConnected: false
      }))
      addLog({
        timestamp: Date.now(),
        type: 'info',
        message: `Session ended with code ${payload.code}`,
        icon: '📴'
      })
    })

    return () => {
      if (transitionTimer) {
        clearTimeout(transitionTimer)
      }
      unSubStatus()
      unSubLog()
      unSubError()
      unSubExit()
    }
  }, [tabId, addLog])

  // 挂载时自动连接
  useEffect(() => {
    if (host && state.status === 'idle') {
      // 使用 setTimeout 避免在 effect 中同步调用 setState
      const timer = setTimeout(() => {
        connect()
      }, 0)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [host, state.status, connect])

  // 卸载时清理
  useEffect(() => {
    return () => {
      if (state.isConnected) {
        window.sshApi.disconnect(tabId)
      }
    }
  }, [tabId, state.isConnected])

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    setTerminalSize
  }
}
