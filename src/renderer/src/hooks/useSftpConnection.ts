import { useState, useEffect, useCallback, useRef } from 'react'
import { SftpConnectionStatus, SftpConnectOptions } from '../../../shared/types'
import { HostData } from '@/store/hosts'

export interface SftpConnectionState {
  status: SftpConnectionStatus
  error: string | null
  isConnected: boolean
}

const initialState: SftpConnectionState = {
  status: 'idle',
  error: null,
  isConnected: false
}

export function useSftpConnection(tabId: string, host: HostData | undefined) {
  const [state, setState] = useState<SftpConnectionState>(initialState)
  const isConnectingRef = useRef(false)

  const connect = useCallback(async () => {
    if (!host || isConnectingRef.current) return

    isConnectingRef.current = true
    setState({
      status: 'connecting',
      error: null,
      isConnected: false
    })

    const options: SftpConnectOptions = {
      id: tabId,
      host: host.address,
      port: host.port,
      username: host.username,
      authType: host.authType,
      password: host.password,
      privateKey: host.privateKey
    }

    const success = await window.sftpApi.connect(options)
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
    window.sftpApi.disconnect(tabId)
    setState(initialState)
  }, [tabId])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 100)
  }, [connect, disconnect])

  // 订阅 SFTP 事件
  useEffect(() => {
    const unSubStatus = window.sftpApi.onStatus((payload) => {
      if (payload.id !== tabId) return

      setState((prev) => ({
        ...prev,
        status: payload.status,
        isConnected: payload.status === 'connected'
      }))
    })

    const unSubError = window.sftpApi.onError((payload) => {
      if (payload.id !== tabId) return
      setState((prev) => ({
        ...prev,
        error: payload.error,
        status: 'error'
      }))
    })

    return () => {
      unSubStatus()
      unSubError()
    }
  }, [tabId])

  // 挂载时自动连接
  useEffect(() => {
    if (host && state.status === 'idle') {
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
        window.sftpApi.disconnect(tabId)
      }
    }
  }, [tabId, state.isConnected])

  return {
    ...state,
    connect,
    disconnect,
    reconnect
  }
}
