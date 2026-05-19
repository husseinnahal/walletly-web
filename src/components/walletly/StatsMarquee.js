'use client'

import { Shield, TrendingUp, Users, Star, Zap, Lock, BarChart2, DollarSign } from 'lucide-react'

const stats = [
  { icon: Users,      label: '150K+',    sub: 'Active Users',     color: '#00FF87' },
  { icon: DollarSign, label: '$20M+',    sub: 'Managed',          color: '#4F94FF' },
  { icon: Shield,     label: '99.9%',    sub: 'Secure',           color: '#00FF87' },
  { icon: Star,       label: '4.9/5',    sub: 'App Rating',       color: '#FFB347' },
  { icon: Zap,        label: 'AI',       sub: 'Powered Insights', color: '#4F94FF' },
  { icon: TrendingUp, label: '2x',       sub: 'Faster Savings',   color: '#00FF87' },
  { icon: BarChart2,  label: '50+',      sub: 'Finance Tools',    color: '#4F94FF' },
  { icon: Lock,       label: '256-bit',  sub: 'Encryption',       color: '#FFB347' },
]

// Duplicate for seamless loop
const items = [...stats, ...stats]

export default function StatsMarquee() {
  return (
    <section className="py-10 overflow-hidden border-y border-white/[0.06] bg-[#0D1018]/60 relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07090F] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07090F] to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <div
              key={i}
              className="inline-flex items-center gap-3 mx-8 shrink-0"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: item.color + '18' }}
              >
                <Icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white font-bold text-lg leading-none">{item.label}</span>
                <span className="text-white/40 text-sm">{item.sub}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20 ml-4" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
