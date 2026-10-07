import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { queryClient } from './api/queryClient'
import { router } from './routes/router'
import { AuthProvider } from './store/auth'

/** Application providers only — pages, sections and logic live in their own modules. */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{ className: '!bg-ink-850 !border-[var(--line-strong)] !text-fg', duration: 4000 }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}
