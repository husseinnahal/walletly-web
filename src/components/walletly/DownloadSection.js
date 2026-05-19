'use client'

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import Image from 'next/image';

function Particles({ count = 40 }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const dots = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      dur: 8 + Math.random() * 10,
      hue: Math.random() > 0.5 ? "var(--primary)" : "var(--accent)",
    }));
  }, [count, mounted]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full opacity-40 animate-pulse-glow"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: d.hue,
            boxShadow: `0 0 ${10 + d.size * 5}px ${d.hue}`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

function PhoneMockupSmall({ tilt, children }) {
  return (
    <div
      className="w-[180px] h-[370px] rounded-[34px] overflow-hidden shadow-2xl flex-shrink-0 relative group"
      style={{
        border: '1.5px solid rgba(255,255,255,0.1)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        transform: tilt,
      }}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-xl z-30" />
      
      {/* Screen Glare */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] via-transparent to-transparent z-20 pointer-events-none" />
      
      {/* Content Container */}
      <div className="relative w-full h-full bg-[#0D1018]">
        {children}
      </div>

      {/* Outer Border Glow */}
      <div className="absolute inset-0 rounded-[34px] border border-white/5 pointer-events-none group-hover:border-white/20 transition-colors duration-500" />
    </div>
  )
}

export default function DownloadSection() {
  return (
    <section id="download" className="relative py-32 bg-[#07090F] overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#00FF87]/5 blur-[160px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#4F94FF]/8 blur-[120px] animate-pulse-slow" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090F] via-transparent to-[#07090F]" />
        
       <motion.div  className="absolute inset-0 pointer-events-none">
        {/* <div className="grid-bg" /> */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FF87]/5 to-transparent pointer-events-none" /> */}
        
        <motion.div 
          animate={{ opacity: [0.3, 0.4, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[0%] left-[-3%] w-[500px] h-[300px] rounded-[50%] bg-[#6be6b0] blur-[300px] pointer-events-none" 
        />
        <motion.div 
          animate={{ opacity: [0.8, 0.7, 0.8], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut",}}
          className="absolute top-[0%] right-[-3%] w-[500px] h-[300px] rounded-full bg-[#EA7108] blur-[300px] pointer-events-none" 
        />
      </motion.div>
        {/* Particles integrated here */}
        <Particles count={40} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Phone mockups with Images */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center items-center gap-2 md:gap-4 h-[400px] md:h-[500px]"
          >
            {/* Left Phone  */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <PhoneMockupSmall tilt="perspective(1000px) rotateY(15deg) rotateX(-5deg)">
                <Image 
                  src="/arena.jpeg"
                  alt="Savings App Screen"
                  className="w-full h-full object-cover"
                  width={600}
                  height={1200}
                />
              </PhoneMockupSmall>
            </motion.div>

            {/* Right Phone (Dashboard) */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="relative z-20 -ml-12 mt-12"
            >
              <PhoneMockupSmall tilt="perspective(1000px) rotateY(-15deg) rotateX(5deg) scale(1.1)">
                <Image 
                  src="/main.jpeg"
                  alt="Dashboard App Screen"
                  className="w-full h-full object-cover"
                  width={600}
                  height={1200}
                />
              </PhoneMockupSmall>
            </motion.div>
          </motion.div>

          {/* Right — CTA text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#00FF87]/20 mb-6">
              <Smartphone className="w-3.5 h-3.5 text-[#00FF87]" />
              <span className="text-[#00FF87] text-xs font-medium uppercase tracking-wider">Available on iOS & Android</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.05] text-balance mb-6">
              Start Managing Your
              <span className="gradient-text"> Money Smarter</span>
              <br />Today
            </h2>

            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Start your smarter financial journey with Walletly — designed to help you track spending, understand your habits, and grow your savings with the power of AI.
            </p>

            {/* App store buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
              {/* App Store */}
              <a
                href="#"
                className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-5 md:py-3.5 rounded-2xl glass-strong border border-white/[0.12] hover:border-white/25 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-white/50 text-[9px]">Download on the</p>
                  <p className="text-white font-bold text-sm">App Store</p>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="#"
                className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-5 md:py-3.5 rounded-2xl glass-strong border border-white/[0.12] hover:border-white/25 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4.09 4.09L12.5 12.5l-8.41 8.41A1 1 0 013 20V4a1 1 0 011.09.09z" fill="#4F94FF"/>
                  <path d="M4.09 4.09L12.5 12.5 17 8.02l-7.96-4.63a2 2 0 00-4.95.7z" fill="#00FF87"/>
                  <path d="M12.5 12.5l4.5-4.48 2.07 1.2a2 2 0 010 3.56l-2.07 1.2L12.5 12.5z" fill="#FFB347"/>
                  <path d="M12.5 12.5l-8.41 8.41A2 2 0 009.04 20.6L17 15.98 12.5 12.5z" fill="#FF6B6B"/>
                </svg>
                <div>
                  <p className="text-white/50 text-[9px]">Get it on</p>
                  <p className="text-white font-bold text-sm">Google Play</p>
                </div>
              </a>
            </div>

            {/* Features list */}
            <div className="flex flex-wrap gap-4">
              {['Free to download', 'No credit card', 'Cancel anytime', 'Privacy-first'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-white/40 text-xs font-medium uppercase tracking-wide">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87]" />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
