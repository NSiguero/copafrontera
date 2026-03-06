'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface CountdownProps {
  targetDate?: string
}

export function Countdown({ targetDate }: CountdownProps) {
  const t = useTranslations('home.countdown')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!targetDate) return

    const target = new Date(targetDate).getTime()

    const update = () => {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (!mounted || !targetDate) return null

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
