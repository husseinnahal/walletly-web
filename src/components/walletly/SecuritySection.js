'use client'

import { motion } from 'framer-motion'
import { Shield, Bell, Lock, Cloud } from 'lucide-react'

const securityFeatures = [
  {
    icon: Shield,
    color: '#00FF87',
    title: 'Secure Authentication',
    description:
      'Protected login and account verification systems help keep your Walletly account safe and secure.',
  },
  {
    icon: Bell,
    color: '#4F94FF',
    title: 'Real-Time Alerts',
    description: 'Get instant notifications for every transaction and suspicious activity the moment it happens.',
  },
  {
    icon: Lock,
    color: '#C084FC',
    title: 'Encrypted Data Protection',
    description:
      'Your financial information and personal data are securely encrypted to protect your privacy.',
  },
  {
    icon: Cloud,
    color: '#FFB347',
    title: 'Secure Cloud Storage',
    description:
      'Your data is safely stored and synced across devices so you can access Walletly anytime, anywhere.',
  },
]

function EncryptedLine({ top, delay }) {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px overflow-hidden"
      style={{ top }}
    >
      <motion.div
        className="h-full"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,135,0.3) 40%, rgba(79,148,255,0.4) 60%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3 + delay, repeat: Infinity, delay, ease: 'linear' }}
      />
    </motion.div>
  )
}

export default function SecuritySection() {
  return (
    <section id="security" className="relative py-32 bg-[#07090F] overflow-hidden">
      {/* Background encrypted lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[15, 30, 50, 65, 80].map((top, i) => (
          <EncryptedLine key={top} top={`${top}%`} delay={i * 0.6} />
        ))}
        <div className="absolute inset-0 bg-grid opacity-50" />
        {/* Glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#4F94FF]/5 blur-[140px]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#00FF87]/5 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-[#4F94FF] text-sm font-medium tracking-widest uppercase mb-4">Security</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white text-balance max-w-3xl mx-auto">
            Bank-Level Security For
            <span className="gradient-text"> Every Transaction</span>
          </h2>
          <p className="mt-6 text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Your financial data is protected by the same standards used by the worlds largest banks. No compromises.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-12 items-center">
          {/* Left cards */}
          <div className="space-y-5">
            {securityFeatures.slice(0, 2).map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  className="glass-strong rounded-2xl p-5 group cursor-default"
                  style={{ borderColor: `${f.color}22` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:shadow-lg"
                      style={{
                        backgroundColor: f.color + '18',
                        boxShadow: `0 0 0 1px ${f.color}22`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                      <p className="text-white/50 text-xs leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Center shield */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center lg:px-8"
          >
            <div className="relative">
              {/* Outer ring */}
              <div className="w-48 h-48 rounded-full border border-[#00FF87]/10 animate-glow-pulse flex items-center justify-center">
                {/* Mid ring */}
                <div className="w-36 h-36 rounded-full border border-[#00FF87]/20 flex items-center justify-center">
                  {/* Inner */}
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center neon-glow"
                    style={{
                      background: 'radial-gradient(circle, rgba(0,255,135,0.15) 0%, rgba(0,255,135,0.05) 70%)',
                      border: '1px solid rgba(0,255,135,0.3)',
                    }}
                  >
                    <Shield className="w-10 h-10 text-[#00FF87]" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Orbiting dot */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-full h-full"
                style={{ marginLeft: '-50%', marginTop: '-50%' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#00FF87] neon-glow"
                />
              </motion.div>

              {/* Reversed orbiting dot */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-36 h-36"
                style={{ marginLeft: '-72px', marginTop: '-72px' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              >
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#4F94FF] electric-glow"
                />
              </motion.div>

              {/* Verified badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#00FF87] text-[#07090F] text-[9px] font-black whitespace-nowrap shadow-lg">
                VERIFIED SECURE
              </div>
            </div>
          </motion.div>

          {/* Right cards */}
          <div className="space-y-5">
            {securityFeatures.slice(2, 4).map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: -6, transition: { duration: 0.2 } }}
                  className="glass-strong rounded-2xl p-5 group cursor-default"
                  style={{ borderColor: `${f.color}22` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: f.color + '18',
                        boxShadow: `0 0 0 1px ${f.color}22`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                      <p className="text-white/50 text-xs leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 hidden sm:flex flex-wrap justify-center gap-6"
        >
          {['Secure User Authentication','Encrypted Financial Data','Protected Cloud Storage','Real-Time Security Monitoring','Private & Safe Experience'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/[0.08]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF87]" />
              <span className="text-white/60 text-xs">{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
