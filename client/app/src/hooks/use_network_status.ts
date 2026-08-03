import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'

type NetworkListener = (isOnline: boolean) => void

let currentOnline = true
let nativeStatusLoaded = false
const listeners = new Set<NetworkListener>()

function browser_online_state(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

function set_online_state(isOnline: boolean) {
  if (currentOnline === isOnline) return
  currentOnline = isOnline
  listeners.forEach((listener) => listener(currentOnline))
}

async function refresh_network_status(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const status = await Network.getStatus()
    nativeStatusLoaded = true
    set_online_state(status.connected)
    return status.connected
  }

  const isOnline = browser_online_state()
  set_online_state(isOnline)
  return isOnline
}

export function getNetworkOnlineState(): boolean {
  return currentOnline
}

export async function requestNetworkStatusRecheck(): Promise<boolean> {
  return await refresh_network_status()
}

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    if (Capacitor.isNativePlatform() && !nativeStatusLoaded) return currentOnline
    return Capacitor.isNativePlatform() ? currentOnline : browser_online_state()
  })

  useEffect(() => {
    let cancelled = false
    let removeNativeListener: (() => void) | undefined

    const listener: NetworkListener = (nextOnline) => {
      if (!cancelled) setIsOnline(nextOnline)
    }
    listeners.add(listener)

    if (Capacitor.isNativePlatform()) {
      Network.addListener('networkStatusChange', (status) => {
        set_online_state(status.connected)
      }).then((handle) => {
        if (cancelled) {
          void handle.remove()
          return
        }
        removeNativeListener = () => {
          void handle.remove()
        }
      }).catch(() => undefined)
    } else {
      const update = () => set_online_state(browser_online_state())
      window.addEventListener('online', update)
      window.addEventListener('offline', update)
      update()
      removeNativeListener = () => {
        window.removeEventListener('online', update)
        window.removeEventListener('offline', update)
      }
    }

    void refresh_network_status()

    return () => {
      cancelled = true
      listeners.delete(listener)
      removeNativeListener?.()
    }
  }, [])

  return isOnline
}
