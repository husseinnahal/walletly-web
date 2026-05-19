'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-6 left-1/2 z-50 w-[min(1100px,92%)] -translate-x-1/2 transition-all duration-500 ${
        scrolled ? 'top-4' : 'top-8'
      }`}
    >
      <div 
        className={`glass-strong ring-gradient flex items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ${
          scrolled 
            ? 'bg-[#07090F]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10' 
            : 'bg-[#07090F]/40 backdrop-blur-md shadow-none border-transparent'
        }`}
      >
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2 group">
          {/*<span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_24px_rgba(0,255,135,0.4)] transition-all duration-300 group-hover:shadow-[0_0_32px_rgba(0,255,135,0.6)]">
                <span className="font-display text-sm font-black text-primary-foreground">W</span>
             </span> */}
          <Image src={"/logo.png"} alt="Walletly Logo" width={36} height={36} className="relative flex h-9 w-9 items-center justify-center  transition-all duration-300 "/>
          <span className="font-display text-base font-bold tracking-tight text-white">Walletly</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className="text-sm font-medium text-white/50 transition-all duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#download"
          className="rounded-full bg-[#6be6b0] px-5 py-2 text-sm font-bold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,135,0.4)] hover:scale-[1.03] active:scale-[0.98]"
        >
          Get app
        </a>
      </div>
    </motion.header>
  )
}
