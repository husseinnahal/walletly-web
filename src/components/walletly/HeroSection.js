'use client'

import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

/* ---- Background Particles (Floating Dots) ---- */
function Particles({ count = 50 }) {
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
      size: Math.random() * 2.5 + 0.8,
      delay: Math.random() * 6,
      dur: 6 + Math.random() * 8,
      hue: Math.random() > 0.5 ? "var(--primary)" : "var(--accent)",
    }));
  }, [count, mounted]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full opacity-60 animate-pulse-glow"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: d.hue,
            boxShadow: `0 0 ${8 + d.size * 4}px ${d.hue}`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---- 3D Interactive Hero Cards ---- */
function HeroVisual({ mx, my }) {
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [15, -15]), { stiffness: 100, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-20, 20]), { stiffness: 100, damping: 20 });

  const floatingVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: 0.6 + (i * 0.15), duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    })
  }

  return (
    <div className="relative aspect-square w-full max-w-[560px]" style={{ perspective: 1400 }}>
      {/* glow halo */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-primary/10 via-accent/10 to-transparent blur-3xl" />

      {/* rotating rings */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="animate-spin-slow h-[90%] w-[90%] rounded-full border border-dashed border-white/10" />
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="animate-spin-slow h-[70%] w-[70%] rounded-full border border-white/5" style={{ animationDirection: "reverse" }} />
      </div>

      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className="relative h-full w-full">
        {/* Main Card */}
        <motion.div custom={0} variants={floatingVariants} initial="hidden" animate="visible" className="absolute left-[12%] top-[22%] h-[56%] w-[76%] rounded-[28px] glass-strong ring-gradient overflow-hidden" style={{ transform: "translateZ(80px)" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-6">
            <div className="flex items-center justify-between"><span className="font-display text-[10px] uppercase tracking-[0.2em] text-white/50">Walletly • Black</span><div className="h-7 w-11 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-lg" /></div>
            <div><div className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1">Total Balance</div><div className="font-display text-4xl font-bold text-white">$24,890.50</div></div>
            <div className="flex items-center justify-between font-mono text-[11px] text-white/40 tracking-widest"><span>•••• 4242</span><span>12/29</span></div>
          </div>
        </motion.div>

        {/* Savings Card */}
        <motion.div custom={1} variants={floatingVariants} initial="hidden" animate="visible" className="absolute left-[4%] top-[44%] h-[40%] w-[58%] rounded-[24px] glass overflow-hidden animate-float" style={{ transform: "translateZ(40px) rotate(-8deg)" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
          <div className="relative h-full p-5 flex flex-col justify-between"><span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Savings</span><div className="text-2xl font-bold text-white">+$1,204</div></div>
        </motion.div>

        {/* Floating Notification */}
        <motion.div custom={2} variants={floatingVariants} initial="hidden" animate="visible" className="absolute right-[-2%] top-[10%] w-[62%] glass rounded-2xl p-4 animate-float-slow" style={{ transform: "translateZ(140px)" }}>
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div><div className="flex-1"><div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Income</div><div className="text-white text-[13px] font-bold">Salary received <span className="text-primary">+$5,400</span></div></div></div>
        </motion.div>

        {/* Mini Chart */}
        <motion.div custom={3} variants={floatingVariants} initial="hidden" animate="visible" className="absolute right-[-4%] bottom-[8%] w-[58%] glass rounded-2xl p-4 animate-float" style={{ transform: "translateZ(100px)" }}>
          <div className="mb-3 flex items-center justify-between"><div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Growth</div><div className="text-xs text-primary font-bold">+18.2%</div></div>
          <svg viewBox="0 0 200 60" className="h-14 w-full overflow-visible">
            <path d="M0,45 C20,30 40,50 60,35 C80,20 100,42 120,28 C140,14 160,30 200,10" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <path d="M0,45 C20,30 40,50 60,35 C80,20 100,42 120,28 C140,14 160,30 200,10 L200,60 L0,60 Z" fill="url(#chartGrad)" />
            <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs>
          </svg>
        </motion.div>

        {/* Coins */}
        <motion.div custom={4} variants={floatingVariants} initial="hidden" animate="visible" className="absolute left-[2%] top-[8%] h-16 w-16 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 shadow-[0_15px_40px_-10px_rgba(250,200,50,0.5)] border border-white/20 grid place-items-center" style={{ transform: "translateZ(160px)" }}><span className="font-display text-2xl text-amber-900/80">$</span></motion.div>
      </motion.div>
    </div>
  );
}

/* ---- Main Hero Section ---- */
export default function HeroSection() {
  const containerRef = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  
  // Parallax drifts for mouse
  const xText = useSpring(useTransform(mx, [-0.5, 0.5], [-15, 15]), { stiffness: 60, damping: 20 })
  const yText = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), { stiffness: 60, damping: 20 })
  const xOrb1 = useTransform(mx, [-0.5, 0.5], [40, -40])
  const yOrb1 = useTransform(my, [-0.5, 0.5], [30, -30])
  const xOrb2 = useTransform(mx, [-0.5, 0.5], [-50, 50])
  const yOrb2 = useTransform(my, [-0.5, 0.5], [-40, 40])

  const { scrollY } = useScroll()
  const yBg = useTransform(scrollY, [0, 500], [0, 100])
  const opacityBg = useTransform(scrollY, [0, 500], [1, 0.5])

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const resetMouse = () => {
    mx.set(0)
    my.set(0)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  }

  return (
    <section
      id="hero"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMouse}
      className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-[#07090F]"
      aria-label="Hero section"
    >
      {/* Background Lighting & FX */}
      <motion.div style={{ y: yBg, opacity: opacityBg }} className="absolute inset-0 pointer-events-none">
        <div className="grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FF87]/5 to-transparent pointer-events-none" />
        
        <motion.div 
          style={{ x: xOrb1, y: yOrb1 }}
          animate={{ opacity: [0.3, 0.4, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[0%] left-[-3%] w-[350px] h-[150px] lg:w-[500px] lg:h-[300px] rounded-[50%] bg-[#6be6b0] blur-[200px] pointer-events-none" 
        />
        <motion.div 
          style={{ x: xOrb2, y: yOrb2 }}
          animate={{ opacity: [0.6, 0.5, 0.6], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut",}}
          className="absolute top-[0%] right-[-3%] w-[350px] h-[150px] lg:w-[500px] lg:h-[300px] rounded-full bg-[#EA7108] blur-[200px] pointer-events-none" 
        />
      </motion.div>
      
      <Particles count={60} />

      <div className="max-w-7xl mx-auto px-6 w-full py-20 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Content */}
        <motion.div
          style={{ x: xText, y: yText }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.div variants={wordVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#00FF87]/20 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" />
            <span className="text-white/60 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">New • AI Insights 1.0 just landed</span>
          </motion.div>

          <motion.h1 
            variants={wordVariants}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tight"
          >
            {["Take", "control", "of", "your", "money", "with"].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1), duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-shimmer inline-block"
            >
              smart financial insights
            </motion.span>
          </motion.h1>

          <motion.p variants={wordVariants} className="mt-8 text-sm md:text-lg text-white/55 leading-relaxed max-w-lg">
            Walletly helps you track expenses, analyze spending patterns, and achieve your financial goals with powerful AI insights — beautifully simple.
          </motion.p>

          <motion.div variants={wordVariants} className="mt-10 flex flex-wrap gap-[9px] md:gap-5">
            <motion.a
              href="#download"
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0, 255, 135, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-full bg-[#6be6b0] text-[#07090F] text-sm font-medium transition-all duration-300"
            >
              Download App <ArrowRight className="w-3 h-3" />
            </motion.a>
            <motion.a
              href="#features"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
              className="flex items-center gap-3  px-4 md:px-6 py-3 rounded-full glass border border-white/[0.12] text-white font-medium text-sm transition-all duration-300 group"
            >
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#00FF87]/20 flex items-center justify-center group-hover:bg-[#4F94FF]/20 transition-colors">
                <Play className="w-3.5 h-3 fill-[#00FF87] text-[#00FF87]" />
              </div>
              Watch Demo
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Right Content - The 3D Interactive Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="relative hidden lg:flex items-center justify-center"
        >
          <HeroVisual mx={mx} my={my} />
        </motion.div>

      </div>
    </section>
  )
}
