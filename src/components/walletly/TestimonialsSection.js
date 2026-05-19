'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

/* ---- Animated Counter ---- */
function AnimatedCounter({ value, suffix, prefix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

const stats = [
  { value: 150,  suffix: 'K+',  prefix: '',  label: 'Active Users',     color: '#00FF87' },
  { value: 20,   suffix: 'M+',  prefix: '$', label: 'Assets Managed',   color: '#4F94FF' },
  { value: 4.9,  suffix: '/5',  prefix: '',  label: 'App Store Rating',  color: '#FFB347' },
  { value: 99.9, suffix: '%',   prefix: '',  label: 'Uptime Guaranteed', color: '#C084FC' },
]

const testimonials = [
  {
    quote:
      'Walletly completely changed how I manage money. The AI tips helped me save an extra $500 per month just by cutting subscriptions I forgot about.',
    name: 'Sarah K.',
    title: 'Product Designer at Notion',
    rating: 5,
    color: '#00FF87',
    initials: 'SK',
    bg: 'linear-gradient(135deg, #00FF8744, #4F94FF33)',
  },
  {
    quote:
      'The analytics are mind-blowingly detailed. I finally understand exactly where my money goes every single month. Best finance app I\'ve ever used.',
    name: 'Marcus L.',
    title: 'Senior Software Engineer',
    rating: 5,
    color: '#4F94FF',
    initials: 'ML',
    bg: 'linear-gradient(135deg, #4F94FF44, #C084FC33)',
    featured: true,
  },
  {
    quote:
      'The UI is absolutely beautiful and every feature just works. I\'ve tried 10 finance apps and Walletly is on a completely different level.',
    name: 'Emma R.',
    title: 'Entrepreneur & Investor',
    rating: 5,
    color: '#FFB347',
    initials: 'ER',
    bg: 'linear-gradient(135deg, #FFB34744, #FF6B6B33)',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-32 bg-[#07090F] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#4F94FF]/5 blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-[#FFB347] text-sm font-medium tracking-widest uppercase mb-4">Loved by Users</p>
          <h2 className="text-4xl md:text-5xl font-black text-white text-balance max-w-2xl mx-auto">
            Real People, Real
            <span className="gradient-text"> Results</span>
          </h2>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="glass-strong rounded-2xl p-6 text-center group hover:-translate-y-1 transition-transform duration-300"
            >
              <p
                className="text-3xl md:text-4xl font-black mb-1"
                style={{ color: stat.color }}
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="text-white/50 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className={`relative glass rounded-2xl p-6 group ${
                t.featured
                  ? 'border border-[#4F94FF]/25 shadow-[0_0_40px_rgba(79,148,255,0.1)]'
                  : 'border border-white/[0.08]'
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#4F94FF] text-white text-[9px] font-bold tracking-wide">
                  MOST HELPFUL
                </div>
              )}

              {/* Quote icon */}
              <Quote className="w-6 h-6 text-white/10 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-[#FFB347] text-[#FFB347]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/70 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: t.bg }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.title}</p>
                </div>
              </div>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 50%, ${t.color}06, transparent 70%)` }}
              />
            </motion.div>
          ))}
        </div>

        {/* App Store ratings */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-8"
        >
          {[
            { store: 'App Store', rating: '4.9', count: '86K reviews' },
            { store: 'Google Play', rating: '4.8', count: '62K reviews' },
          ].map((s) => (
            <div key={s.store} className="flex items-center gap-3 glass rounded-2xl px-5 py-3">
              <div>
                <p className="text-white/40 text-[10px]">{s.store}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-sm">{s.rating}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#FFB347] text-[#FFB347]" />
                    ))}
                  </div>
                </div>
                <p className="text-white/30 text-[9px]">{s.count}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
