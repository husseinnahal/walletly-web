'use client'

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import Image from "next/image";

const features = [
  { 
    id: "Transactions", 
    title: "Transaction Tracking", 
    desc: "Every transaction auto-categorized the moment it happens — no more spreadsheets, no more guessing.",
    image: "/tran.jpeg" 
  },
  { 
    id: "budget", 
    title: "Budget Planning", 
    desc: "Set monthly intentions, get gentle nudges, and let Walletly rebalance categories so you never overspend.",
      image: "/budget.jpeg" 
    },
    { 
    id: "ai", 
    title: "AI Financial Insights", 
    desc: "A private financial advisor in your pocket — proactive tips tailored to how you actually live.",
    image: "/ai.jpeg" 
  },
  { 
    id: "goals", 
    title: "Savings Goals", 
    desc: "From a dream trip to an emergency fund, watch every milestone fill in real time with auto-stash.",
    image: "/save.jpeg" 
  },

];

function Phone({ screen }) {
  const activeFeature = features.find(f => f.id === screen);
  
  return (
    <div className="relative mx-auto h-[600px] w-[300px]">
      {/* Dynamic Background Glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          className="absolute -inset-10 rounded-[60px] blur-3xl"
          style={{ 
            background: screen === 'Transactions' ? '#6be6b0' : '#EA7108' 
          }}
        />
      </AnimatePresence>

      {/* Phone Body */}
      <div className="relative h-full w-full rounded-[48px] border border-white/10 bg-[#0D1018] p-3 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
        <div className="absolute left-1/2 top-3 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
        
        <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full"
            >
              {activeFeature?.image && (
                <Image 
                  src={activeFeature.image} 
                  alt={activeFeature.title}
                  width={100}
                  height={100}
                  className="h-full w-full object-cover"
                />
              )}
              
              {/* Overlay Glass for realism */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Glossy Reflection */}
        <div className="absolute inset-0 pointer-events-none rounded-[48px] bg-gradient-to-tr from-white/5 to-transparent opacity-50" />
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const ref = useRef(null);
  const [active, setActive] = useState("Transactions");
  
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: ["start start", "end end"] 
  });

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const idx = Math.min(features.length - 1, Math.floor(v * features.length));
      setActive(features[idx].id);
    });
    return () => unsub();
  }, [scrollYProgress]);

  return (
    <section id="features" ref={ref} className="relative bg-[#07090F] h-auto lg:h-[400vh]">
      {/* Desktop Sticky View */}
      <div className="hidden lg:block sticky top-0 h-screen w-full overflow-hidden">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 bg-hero opacity-30" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090F] via-transparent to-[#07090F]" />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1fr_0.8fr]">
          
          {/* Left Side: Content */}
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-[#6be6b0] border border-[#6be6b0]/20"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#6be6b0] shadow-[0_0_10px_#6be6b0]" />
              Powerful Features
            </motion.div>
            
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl mb-8">
              Everything you need, <br />
              <span className="text-shimmer">none of the noise.</span>
            </h2>

            <div className="space-y-3">
              {features.map((f) => {
                const isActive = f.id === active;
                return (
                  <motion.div
                    key={f.id}
                    animate={{ 
                      opacity: isActive ? 1 : 0.3, 
                      x: isActive ? 10 : 0,
                      scale: isActive ? 1.02 : 1
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`relative rounded-2xl border p-4 transition-colors duration-500 ${
                      isActive 
                        ? "glass-strong border-white/20 shadow-2xl" 
                        : "border-transparent"
                    }`}
                  >
                    {/* Active Indicator Line */}
                    {isActive && (
                      <motion.div 
                        layoutId="active-line"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-[#6be6b0] rounded-full shadow-[0_0_15px_#6be6b0]"
                      />
                    )}
                    
                    <h3 className="font-display text-xl font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed max-w-md">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Sticky Phone Visual */}
          <div className="relative perspective-1000">
            <motion.div
              animate={{ 
                rotateY: active === "Transactions" ? 5 : -5,
                rotateX: 2
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Phone screen={active} />
            </motion.div>

            {/* Extra decorative elements */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#EA7108]/10 rounded-full blur-[100px] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Stacked View */}
      <div className="lg:hidden relative z-10 px-6 py-24 space-y-16">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-[#6be6b0] border border-[#6be6b0]/20"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#6be6b0] shadow-[0_0_10px_#6be6b0]" />
            Powerful Features
          </motion.div>
          <h2 className="font-display text-3xl font-bold leading-tight text-white mb-6">
            Everything you need, <br />
            <span className="text-shimmer">none of the noise.</span>
          </h2>
        </div>

        <div className="space-y-12">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="glass-strong rounded-[40px] p-8 border border-white/10 relative overflow-hidden group"
            >
              {/* Background Accent */}
              <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-colors duration-700 ${
                i % 2 === 0 ? 'bg-[#6be6b0]' : 'bg-[#EA7108]'
              }`} />

              <div className="relative z-10">
                <h3 className="font-display text-2xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-10 max-w-sm">{f.desc}</p>
                
                <div className="relative mx-auto w-full max-w-[280px]">
                  <div className="aspect-[9/19] rounded-[40px] border border-white/10 bg-[#0D1018] p-2.5 shadow-2xl overflow-hidden">
                    <div className="relative h-full w-full rounded-[32px] overflow-hidden bg-black">
                      <Image 
                        src={f.image} 
                        alt={f.title}
                        width={300}
                        height={600}
                        className="h-full w-full object-cover opacity-90"
                      />
                    </div>
                  </div>
                  {/* Floating badge for extra flare */}
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 glass px-4 py-2 rounded-2xl border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest shadow-xl">
                    Live Status
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
