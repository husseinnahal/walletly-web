'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/* ──────────────────────────────────────────────
   OPTIMIZED CONFIG
   ────────────────────────────────────────────── */
const COIN_SIZE = 40
const GAP = 3
const TITLE_DELAY = 1800
const MIN_DISPLAY = 4200
const STAGGER_ROWS = 0.03
const EXIT_STAGGER = 0.02
const EXIT_DURATION = 1500

/* ──────────────────────────────────────────────
   CANVAS COIN GRID
   ────────────────────────────────────────────── */

function useCoinGrid(canvasRef, coinImgRef, phase) {
  const rafRef = useRef(null)
  const gridRef = useRef([])
  const startTimeRef = useRef(0)
  const drainTimeRef = useRef(0)

  useEffect(() => {
    if (phase === 'done') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: true,
    })

    const dpr = 1

    const W = window.innerWidth
    const H = window.innerHeight

    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const step = COIN_SIZE + GAP
    const cols = Math.ceil(W / step) + 1
    const rows = Math.ceil(H / step) + 1

    const offsetX = (W - cols * step) / 2
    const offsetY = (H - rows * step) / 2

    if (gridRef.current.length === 0) {
      const coins = []

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const xShift = r % 2 === 0 ? 0 : step * 0.5

          coins.push({
            x: offsetX + c * step + xShift,
            y: offsetY + r * step,

            startY:
              offsetY + r * step - H - Math.random() * 150,

            row: r,

            size:
              COIN_SIZE * (0.92 + Math.random() * 0.08),

            rotation: Math.random() * 360,

            opacity: 0.6 + Math.random() * 0.3,

            fillDelay:
              (rows - r) * STAGGER_ROWS * 1000 +
              Math.random() * 80,

            drainDelay:
              r * EXIT_STAGGER * 1000 +
              Math.random() * 50,

            exitY:
              H + Math.random() * 300,
          })
        }
      }

      gridRef.current = coins
      startTimeRef.current = performance.now()
    }

    if (phase === 'draining' && !drainTimeRef.current) {
      drainTimeRef.current = performance.now()
    }

    const img = coinImgRef.current

    const render = (now) => {
      ctx.clearRect(0, 0, W, H)

      const fillElapsed = now - startTimeRef.current
      const drainElapsed = now - drainTimeRef.current

      for (const coin of gridRef.current) {
        let currentY = coin.y
        let alpha = coin.opacity

        /* ───── FILLING ───── */
        if (phase === 'filling' || phase === 'titleIn') {
          if (fillElapsed < coin.fillDelay) continue

          const t =
            (fillElapsed - coin.fillDelay) / 600

          const progress = Math.min(1, t)

          const eased = 1 - Math.pow(1 - progress, 2)

          currentY =
            coin.startY +
            (coin.y - coin.startY) * eased

          alpha = coin.opacity * progress
        }

        /* ───── DRAINING ───── */
        if (phase === 'draining') {
          if (drainElapsed < coin.drainDelay) {
            currentY = coin.y
          } else {
            const t =
              (drainElapsed - coin.drainDelay) / 550

            const progress = Math.min(1, t)

            const eased = progress * progress

            currentY =
              coin.y +
              (coin.exitY - coin.y) * eased

            alpha = coin.opacity * (1 - progress)
          }
        }

        ctx.save()

        ctx.globalAlpha = Math.max(alpha, 0)

        ctx.translate(
          coin.x + coin.size / 2,
          currentY + coin.size / 2
        )

        ctx.rotate((coin.rotation * Math.PI) / 180)

        if (img?.complete) {
          ctx.drawImage(
            img,
            -coin.size / 2,
            -coin.size / 2,
            coin.size,
            coin.size
          )
        }

        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [phase, canvasRef, coinImgRef])
}

/* ──────────────────────────────────────────────
   SPLASH SCREEN
   ────────────────────────────────────────────── */

export default function SplashOpener({ onFinish }) {
  const [phase, setPhase] = useState('filling')
  const [show, setShow] = useState(true)

  const canvasRef = useRef(null)
  const coinImgRef = useRef(null)

  useCoinGrid(canvasRef, coinImgRef, phase)

  /* Title show */
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('titleIn')
    }, TITLE_DELAY)

    return () => clearTimeout(t)
  }, [])

  /* Drain start */
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('draining')
    }, MIN_DISPLAY)

    return () => clearTimeout(t)
  }, [])

  /* Remove splash */
  useEffect(() => {
    if (phase !== 'draining') return

    const t = setTimeout(() => {
      setShow(false)
      onFinish?.()
    }, EXIT_DURATION)

    return () => clearTimeout(t)
  }, [phase, onFinish])

  const handleSkip = () => {
    setPhase('draining')
  }

  return (
    <>
      {/* hidden image preload */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={coinImgRef}
        src="/coin.png"
        alt=""
        style={{ display: 'none' }}
      />

      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 z-[300] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: '#07090F',
              willChange: 'opacity',
            }}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(250,204,21,0.05), transparent 60%)',
              }}
            />

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 z-[2]"
            />

            {/* Vignette */}
            <div
              className="absolute inset-0 z-[3] pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.65) 100%)',
              }}
            />

            {/* TITLE */}
            <AnimatePresence>
              {phase === 'titleIn' && (
                <motion.div
                  className="absolute inset-0 z-[10] flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center p-8 bg-[#07090F]/5 backdrop-blur  rounded-lg " >
                    <motion.h1
                      initial={{
                        opacity: 0,
                        y: 30,
                        scale: 0.9,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -20,
                      }}
                      transition={{
                        duration: 0.9,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white"
                      style={{
                        fontFamily:
                          "'Outfit', sans-serif",
                        willChange:
                          'transform, opacity',
                      }}
                    >
                      Walletly
                    </motion.h1>

                    <motion.p
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.4,
                        duration: 0.6,
                      }}
                      className="mt-5 text-white/45 uppercase tracking-[0.3em] text-xs sm:text-sm"
                    >
                      Your Money, Simplified
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}