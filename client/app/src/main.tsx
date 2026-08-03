import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/index'
import { Toaster } from '@/components/ui/toaster'
import { AppBootSplash } from '@/components/shared/app_boot_splash'
import './index.css'

function preventMobileZoom() {
  const preventDefault = (event: Event) => event.preventDefault()
  document.addEventListener('gesturestart', preventDefault, { passive: false })
  document.addEventListener('gesturechange', preventDefault, { passive: false })
  document.addEventListener('gestureend', preventDefault, { passive: false })

  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) event.preventDefault()
      lastTouchEnd = now
    },
    { passive: false },
  )
}

preventMobileZoom()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppBootSplash>
      <RouterProvider router={router} />
      <Toaster />
    </AppBootSplash>
  </StrictMode>,
)
