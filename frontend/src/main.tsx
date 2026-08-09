import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { queryClient } from '@/services/query-client'
import { Toaster } from '@/components/ui/sonner'
import { CookieBlockedNotice } from '@/components/auth/cookie-blocked-notice'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors position="top-right" />
      <CookieBlockedNotice />
    </QueryClientProvider>
  </StrictMode>,
)
