import { useEffect, useState } from 'react'

/** Waktu sekarang yang diperbarui tiap `intervalMs`, untuk teks relatif ("2 menit lalu"). */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}
