import { useEffect, useState } from 'react'

interface ErrorAlertProps {
  message: string | null
  onDismiss?: () => void
}

function format_error(msg: string): string | null {
  const normalized = msg.trim()
  const lower = normalized.toLowerCase()

  // Ignore user cancellation errors silently
  if (
    lower.includes('canceled') ||
    lower.includes('cancelled') ||
    lower.includes('user_canceled') ||
    lower.includes('user_cancelled') ||
    lower.includes('12501') // Google sign-in cancel code
  ) {
    return null
  }

  // Convert technical/backend/network details into clean user-facing error messages
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('cannot reach backend') ||
    lower.includes('http://') ||
    lower.includes('https://')
  ) {
    return 'Unable to connect. Please check your internet connection.'
  }

  if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('forbidden')) {
    return 'Authentication error. Please try again.'
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

  const formatted = visibleMessage ? format_error(visibleMessage) : null
  if (!formatted) return null

  return (
    <p className="mt-4 text-center text-sm font-medium leading-relaxed text-destructive animate-in fade-in duration-300">
      {formatted}
    </p>
  )
}
