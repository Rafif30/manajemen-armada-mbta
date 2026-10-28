import axios from 'axios'

export type AppErrorKind = 'network' | 'timeout' | 'http' | 'canceled' | 'unknown'

/**
 * Error terpusat (design 6.5). Komponen hanya membaca `message`;
 * pemetaan status ke pesan bahasa Indonesia ada di sini (PRD 6.4).
 */
export class AppError extends Error {
  readonly kind: AppErrorKind
  readonly status: number | undefined

  constructor(kind: AppErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'AppError'
    this.kind = kind
    this.status = status
  }
}

export const ERROR_MESSAGES = {
  network: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.',
  timeout: 'Server terlalu lama merespons. Silakan coba lagi.',
  badRequest: 'Permintaan tidak valid. Coba ubah filter yang dipilih.',
  forbidden: 'Akses ditolak oleh server data. Periksa API key Anda.',
  notFound: 'Data yang diminta tidak ditemukan.',
  vehicleNotFound: 'Kendaraan ini sudah tidak aktif atau tidak ditemukan.',
  rateLimited: 'Terlalu banyak permintaan. Tunggu beberapa saat lalu coba lagi.',
  server: 'Server data sedang bermasalah. Silakan coba beberapa saat lagi.',
  unknown: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
  canceled: 'Permintaan dibatalkan.',
} as const

export function messageForStatus(status: number): string {
  if (status === 400) return ERROR_MESSAGES.badRequest
  if (status === 401 || status === 403) return ERROR_MESSAGES.forbidden
  if (status === 404) return ERROR_MESSAGES.notFound
  if (status === 429) return ERROR_MESSAGES.rateLimited
  if (status >= 500) return ERROR_MESSAGES.server
  return ERROR_MESSAGES.unknown
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/** Ubah error apa pun (terutama AxiosError) menjadi AppError. */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error

  if (axios.isCancel(error)) {
    return new AppError('canceled', ERROR_MESSAGES.canceled)
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new AppError('timeout', ERROR_MESSAGES.timeout)
    }
    const status = error.response?.status
    if (typeof status === 'number') {
      return new AppError('http', messageForStatus(status), status)
    }
    return new AppError('network', ERROR_MESSAGES.network)
  }

  return new AppError('unknown', ERROR_MESSAGES.unknown)
}

export function getErrorMessage(error: unknown): string {
  return toAppError(error).message
}

/** Error klien (4xx selain 429) tidak perlu diulang otomatis. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  const appError = toAppError(error)
  if (appError.kind === 'canceled') return false
  if (appError.kind === 'http' && appError.status !== undefined) {
    if (appError.status === 429) return failureCount < 1
    if (appError.status < 500) return false
  }
  return failureCount < 2
}
