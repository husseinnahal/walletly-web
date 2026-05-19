'use client'

import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import Image from 'next/image'

const nav = [
  {
    heading: 'Product',
    links: ['Features', 'Security', 'how it works', 'Integrations', 'Mobile App'],
  },
  {
    heading: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Compliance'],
  },
  {
    heading: 'Support',
    links: ['Help Center', 'Contact Us', 'Status', 'API Docs', 'Community'],
  },
]

const socialLinks = [
  { icon: Wallet, label: 'Twitter', href: '#' },
  { icon: Wallet, label: 'GitHub', href: '#' },
  { icon: Wallet, label: 'LinkedIn', href: '#' },
  { icon: Wallet, label: 'Instagram', href: '#' },
]

export default function Footer() {
  return (
    <footer className="relative bg-[#07090F] overflow-hidden border-t border-white/[0.06]">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF87]/30 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-40 bg-gradient-to-b from-[#00FF87]/4 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Top section */}
        <div className="py-16 grid md:grid-cols-[280px_1fr] gap-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <a href="#" className="flex items-center gap-2 mb-4 group">
                <Image src={"/logo.png"} width={100} height={100} alt='logofooter' className="w-5 h-5 text-[#07090F]" strokeWidth={2.5} />
              <span className="text-white font-bold text-xl">Walletly</span>
            </a>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              The smart way to track, manage, and grow your finances. AI-powered insights for every financial decision.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-xl glass border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Nav columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-8"
          >
            {nav.map((col) => (
              <div key={col.heading}>
                <p className="text-white/70 font-semibold text-sm mb-4">{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-white/35 text-sm hover:text-white/70 transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="py-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} Walletly, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" />
            <span className="text-white/30 text-xs">All systems operational</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
