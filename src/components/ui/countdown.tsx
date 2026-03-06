'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

interface CountdownProps {
  targetDate?: string
}

function calcTimeLeft(targetDate: string) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const serverSnapshot = { days: 0, hours: 0, minutes: 0, seconds: 0 }

export function Countdown({ targetDate }: CountdownProps) {
  const t = useTranslations('home.countdown')

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!targetDate) return () => {}
      const interval = setInterval(onStoreChange, 1000)
      return () => clearInterval(interval)
    },
    [targetDate]
  )

  const getSnapshot = useCallback(
    () => (targetDate ? JSON.stringify(calcTimeLeft(targetDate)) : JSON.stringify(serverSnapshot)),
    [targetDate]
  )

  const getServerSnapshot = useCallback(() => JSON.stringify(serverSnapshot), [])

  const timeLeft = JSON.parse(
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  ) as { days: number; hours: number; minutes: number; seconds: number }

  if (!targetDate || (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0)) {
    return null
  }

  const units = [
    { value: timeLeft.days, label: t('days') },
    { value: timeLeft.hours, label: t('hours') },
    { value: timeLeft.minutes, label: t('minutes') },
    { value: timeLeft.seconds, label: t('seconds') },
  ]

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-3 sm:gap-6">
          <div className="text-center">
            <div className="text-gradient-gold font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight tabular-nums leading-none">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="mt-1 text-xs sm:text-sm font-display uppercase tracking-[0.2em] text-white/50">
              {unit.label}
            </div>
          </div>
          {i < units.length - 1 && (
            <span className="text-gradient-gold font-display text-2xl sm:text-4xl font-bold -mt-4">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
