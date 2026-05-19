'use client'

import { motion } from 'framer-motion'
import { LinkIcon, BarChart2, Brain, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: LinkIcon,
    color: '#4F94FF',
    title: 'Record Transactions',
    description:
      'Simply speak naturally and Walletly AI instantly understands, analyzes, and adds your expenses or income automatically.',
    detail: 'AI voice recognition with smart transaction analysis',
  },
  {
    number: '02',
    icon: BarChart2,
    color: '#00FF87',
    title: 'Track Spending',
    description:
      'Every transaction is automatically organized into clear categories so you always understand where your money goes.',
    detail: 'Real-time expense tracking and smart categorization',
  },
  {
    number: '03',
    icon: Brain,
    color: '#C084FC',
    title: 'Analyze Habits',
    description:
      'Walletly AI studies your financial behavior, identifies patterns, and delivers personalized insights to improve your spending habits.',
    detail: 'Advanced AI-powered financial intelligence',
  },
  {
    number: '04',
    icon: TrendingUp,
    color: '#FFB347',
    title: 'Grow Your Savings',
    description:
      'Set financial goals, manage budgets, and receive intelligent recommendations that help you save more every month.',
    detail: 'Smart savings optimization and goal tracking',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 bg-[#0D1018] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dots opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-[#C084FC] text-sm font-medium tracking-widest uppercase mb-4">How It Works</p>
          <h2 className="text-3xl md:text-5xl font-black text-white text-balance max-w-2xl mx-auto">
            Up and Running in
            <span className="gradient-text"> Under 3 Minutes</span>
          </h2>
          <p className="mt-5 text-white/50 text-lg max-w-lg mx-auto">
            Four simple steps to total financial clarity. No complicated setup, no learning curve.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-[#4F94FF]/30 via-[#00FF87]/30 to-[#FFB347]/30" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#4F94FF] via-[#00FF87] to-[#FFB347]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icon circle */}
                  <div className="relative mb-6">
                    {/* Glow */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ backgroundColor: step.color + '50', transform: 'scale(1.5)' }}
                    />
                    <div
                      className="relative w-[104px] h-[104px] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                      style={{
                        background: `radial-gradient(circle, ${step.color}18 0%, ${step.color}08 70%)`,
                        border: `1.5px solid ${step.color}30`,
                        boxShadow: `0 0 0 8px ${step.color}08`,
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: step.color }} />
                    </div>
                    {/* Step number */}
                    <div
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black"
                      style={{ backgroundColor: step.color, color: '#07090F' }}
                    >
                      {i + 1}
                    </div>
                  </div>

                  {/* Number label */}
                  <p className="text-white/20 text-xs font-mono tracking-widest mb-2">{step.number}</p>

                  {/* Title */}
                  <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>

                  {/* Description */}
                  <p className="text-white/50 text-sm leading-relaxed mb-4">{step.description}</p>

                  {/* Detail tag */}
                  <div
                    className="px-3 py-1 rounded-full text-[10px] font-medium"
                    style={{
                      backgroundColor: step.color + '12',
                      color: step.color,
                      border: `1px solid ${step.color}25`,
                    }}
                  >
                    {step.detail}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <a
            href="#download"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#6be6b0] text-[#07090F] font-bold hover:shadow-[0_0_30px_rgba(0,255,135,0.4)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started Free
          </a>
        </motion.div>
      </div>
    </section>
  )
}
