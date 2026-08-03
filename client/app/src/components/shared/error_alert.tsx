import { useEffect, useState } from 'react'

interface ErrorAlertProps {
  message: string | null
  onDismiss?: () => void
}

function format_error(msg: string): string {
  const normalized = msg.trim()
  const lower = normalized.toLowerCase()

  if (msg.toLowerCase().includes('failed to fetch')) {
    return 'Unable to connect to our servers. Please check your connection.'
  }

  if (lower === 'user not found.') {
    return 'Account not found.'
  }

  if (/^[A-Z_]+$/.test(normalized)) {
    return normalized
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return normalized
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  const [visibleMessage, setVisibleMessage] = useState<string | null>(message)

  useEffect(() => {
    setVisibleMessage(message)
  }, [message])

  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(() => {
      setVisibleMessage(null)
      onDismiss?.()
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [message, onDismiss])

  if (!visibleMessage) return null

  return (
    <p className="mt-4 text-sm font-medium leading-relaxed text-destructive animate-in fade-in duration-300">
      {format_error(visibleMessage)}
    </p>
  )
}
