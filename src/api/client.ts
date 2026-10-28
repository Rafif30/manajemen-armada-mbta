import axios from 'axios'
import { toAppError } from '../lib/errors'

const API_KEY = import.meta.env.VITE_MBTA_API_KEY?.trim()

/**
 * Satu Axios instance untuk semua request (FR-1.3).
 * API key opsional dikirim lewat header `x-api-key` (FR-1.5).
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_MBTA_API_BASE_URL?.trim() || 'https://api-v3.mbta.com',
  timeout: 15_000,
  headers: {
    Accept: 'application/vnd.api+json',
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toAppError(error)),
)

export type QueryParams = Record<string, string | number>
