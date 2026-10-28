import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders, CanceledError, type InternalAxiosRequestConfig } from 'axios'
import { AppError, ERROR_MESSAGES, getErrorMessage, shouldRetry, toAppError } from './errors'

const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() }

function httpError(status: number): AxiosError {
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, {
    status,
    statusText: '',
    headers: {},
    config,
    data: { errors: [{ status: String(status) }] },
  })
}

describe('toAppError', () => {
  it('memetakan status HTTP ke pesan bahasa Indonesia (PRD 6.4)', () => {
    expect(toAppError(httpError(400)).message).toBe(ERROR_MESSAGES.badRequest)
    expect(toAppError(httpError(403)).message).toBe(ERROR_MESSAGES.forbidden)
    expect(toAppError(httpError(404)).message).toBe(ERROR_MESSAGES.notFound)
    expect(toAppError(httpError(429)).message).toBe(ERROR_MESSAGES.rateLimited)
    expect(toAppError(httpError(500)).message).toBe(ERROR_MESSAGES.server)
    expect(toAppError(httpError(503)).status).toBe(503)
  })

  it('membedakan timeout, network, dan pembatalan', () => {
    expect(toAppError(new AxiosError('timeout', 'ECONNABORTED', config)).kind).toBe('timeout')
    expect(toAppError(new AxiosError('Network Error', 'ERR_NETWORK', config)).message).toBe(
      ERROR_MESSAGES.network,
    )
    expect(toAppError(new CanceledError('canceled')).kind).toBe('canceled')
  })

  it('meneruskan AppError apa adanya dan membungkus error lain', () => {
    const original = new AppError('http', ERROR_MESSAGES.vehicleNotFound, 404)
    expect(toAppError(original)).toBe(original)
    expect(getErrorMessage(new Error('boom'))).toBe(ERROR_MESSAGES.unknown)
    expect(getErrorMessage('string')).toBe(ERROR_MESSAGES.unknown)
  })
})

describe('shouldRetry', () => {
  it('tidak mengulang error klien kecuali 429', () => {
    expect(shouldRetry(0, httpError(404))).toBe(false)
    expect(shouldRetry(0, httpError(400))).toBe(false)
    expect(shouldRetry(0, httpError(429))).toBe(true)
    expect(shouldRetry(1, httpError(429))).toBe(false)
  })

  it('mengulang error server dan jaringan maksimal dua kali', () => {
    expect(shouldRetry(0, httpError(500))).toBe(true)
    expect(shouldRetry(1, httpError(500))).toBe(true)
    expect(shouldRetry(2, httpError(500))).toBe(false)
    expect(shouldRetry(0, new AxiosError('Network Error', 'ERR_NETWORK', config))).toBe(true)
  })
})
