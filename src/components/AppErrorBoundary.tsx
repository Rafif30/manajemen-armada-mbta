import type { ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { ErrorState } from './ErrorState'

function Fallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ErrorState
        title="Tampilan gagal dimuat"
        message="Terjadi kesalahan tak terduga pada aplikasi. Muat ulang halaman untuk melanjutkan."
        retryLabel="Muat ulang"
        onRetry={() => {
          resetErrorBoundary()
          window.location.reload()
        }}
      />
    </div>
  )
}

/** Penangkap error render di level halaman (design 6.5), tanpa class component (NFR-8). */
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>
}
