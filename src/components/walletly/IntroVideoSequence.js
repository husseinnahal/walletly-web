// 'use client'

// import { AnimatePresence, motion } from 'framer-motion';
// import Image from 'next/image';
// import { useEffect, useRef, useState } from 'react';


// const floatingCoins = [
//   { left: "10%", size: 0.5, duration: 12, delay: 0, rotateDuration: 3 },
//   { left: "85%", size: 0.4, duration: 15, delay: 2, rotateDuration: 4 },
//   { left: "25%", size: 0.6, duration: 10, delay: 5, rotateDuration: 2.5 },
//   { left: "75%", size: 0.3, duration: 18, delay: 1, rotateDuration: 5 },
//   { left: "45%", size: 0.45, duration: 14, delay: 7, rotateDuration: 3.5 },
//   { left: "60%", size: 0.55, duration: 11, delay: 4, rotateDuration: 2 },
// ];

// export default function IntroVideoSequence({ children }) {
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [isFinished, setIsFinished] = useState(false)
//   const videoRef = useRef(null)

//   // Lock scrolling while the intro is active
//   useEffect(() => {
//     if (!isFinished) {
//       document.body.style.overflow = 'hidden'
//     } else {
//       document.body.style.overflow = 'unset'
//     }
//     return () => {
//       document.body.style.overflow = 'unset'
//     }
//   }, [isFinished])

//   const handlePlay = () => {
//     if (videoRef.current) {
//       videoRef.current.playbackRate = 1.3
//       videoRef.current.play()
//       setIsPlaying(true)
//     }
//   }

//   const handleVideoEnded = () => {
//     setIsFinished(true)
//   }

//   const [activePhrase, setActivePhrase] = useState("");

//   const phrases = [
//     { text: "Your financial world, simplified.", start: 0.5, end: 3.0 },
//     { text: "Intelligent insights for smart decisions.", start: 4.0, end: 6.5 },
//   ];

//   // Check the video progress to trigger the fade out 2 seconds early and handle timed phrases
//   const handleTimeUpdate = () => {
//     if (videoRef.current) {
//       const { currentTime, duration } = videoRef.current;
      
//       // Update active phrase based on current time
//       const current = phrases.find(p => currentTime >= p.start && currentTime <= p.end);
//       if (current) {
//         if (activePhrase !== current.text) setActivePhrase(current.text);
//       } else {
//         if (activePhrase !== "") setActivePhrase("");
//       }

//       // Trigger finish logic
//       if (!isFinished && duration && (duration - currentTime <= 3)) {
//         setIsFinished(true);
//       }
//     }
//   }

//   return (
//     <>
//       <AnimatePresence>
//         {!isFinished && (
//           <motion.div 
//             className="fixed inset-0 z-[100] bg-[#07090F] flex items-center justify-center overflow-hidden"
//             exit={{ opacity: 0 }}
//             transition={{ duration: 2, ease: "easeInOut" }}
//           >
//             <video
//               ref={videoRef}
//               src="/coin.mp4"
//               className="absolute inset-0 w-full h-full object-cover"
//               onEnded={handleVideoEnded}
//               onTimeUpdate={handleTimeUpdate}
//               playsInline
//               muted 
//             />

//             {/* Timed Phrases Overlay */}
//             <AnimatePresence mode="wait">
//               {activePhrase && (
//                 <motion.div
//                   key={activePhrase}
//                   initial={{ opacity: 0, x: -30 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 30 }}
//                   transition={{ duration: 0.8, ease: "easeOut" }}
//                   className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 z-40 text-left max-w-md md:max-w-xl px-6"
//                 >
//                   <p className="text-2xl md:text-4xl text-white font-bold tracking-tight drop-shadow-2xl leading-tight">
//                     {activePhrase}
//                   </p>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Project Name at Top - Visible during both cover and play */}
//             <motion.div 
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1, delay: 0.1 }}
//               className="absolute top-8 left-0 w-full text-center z-30"
//             >
//               <h1 className="text-3xl font-display font-bold tracking-tight text-white">
//                 Walletly
//               </h1>
//             </motion.div>

            
//             {/* The Cover Screen (Visible before playing) */}
//             <AnimatePresence>
//               {!isPlaying && (
//                 <motion.div
//                   className="absolute inset-0 z-20 flex flex-col items-center justify-center "
//                   exit={{ opacity: 0 }}
//                   transition={{ duration: 0.8 }}
//                 >
//                   {/* Background Image */}
//                   <Image 
//                     src="w.png" 
//                     alt="Sky Background" 
//                     fill
//                     className="object-conatin opacity-50 "
//                     priority
//                   />
                  
//                   {/* Dark gradient overlay to blend the sky */}
//                   {/* <div className="absolute inset-0 bg-000000b8 pointer-events-none" /> */}

//                   {/* Floating Background Coins */}
//                   {floatingCoins.map((coin, i) => (
//                     <motion.div
//                       key={i}
//                       className="absolute z-20 pointer-events-none opacity-80 drop-shadow-[0_0_15px_rgba(250,204,21,0.2)]"
//                       initial={{ 
//                         top: "110%", 
//                         left: coin.left,
//                         scale: coin.size,
//                         rotateY: 0
//                       }}
//                       animate={{ 
//                         top: "-20%",
//                         rotateY: 360,
//                       }}
//                       transition={{
//                         top: { repeat: Infinity, duration: coin.duration, ease: "linear", delay: coin.delay },
//                         rotateY: { repeat: Infinity, duration: coin.rotateDuration, ease: "linear" }
//                       }}
//                     >
//                       <div className="relative w-24 h-24 blur-[2px]">
//                         <Image 
//                           src="/coin.png"
//                           alt="Floating Coin"
//                           fill
//                           className="object-contain"
//                         />
//                       </div>
//                     </motion.div>
//                   ))}


//                   {/* Center Content: Coin + Phrase + Button */}
//                   <div className="relative z-30 flex flex-col items-center top-10">
//                     {/* 3D Spinning Coin Image */}
//                     <div
//                       className="relative w-48 h-48 flex items-center justify-center drop-shadow-[0_0_40px_rgba(250,204,21,0.6)]"
//                     >
//                       <Image 
//                         src="/coin.gif"
//                         alt="Walletly Coin"
//                         fill
//                         className="scale-200"
//                       />
//                     </div>
                    
//                     {/* Phrase under the coin */}
//                     <motion.div 
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.8, delay: 0.5 }}
//                       className="mt-8 text-center max-w-lg px-4 drop-shadow-md"
//                     >
//                       <p className="text-white text-lg md:text-xl font-bold tracking-wide">
//                         Empower your financial future
//                       </p>
//                       <p className="mt-4 text-white/70 text-sm leading-relaxed font-light">
//                         Take full control of your money. Track your assets, manage your budget, and achieve your saving goals with intelligent, AI-powered insights.
//                       </p>
//                     </motion.div>

//                     {/* Start Button */}
//                     <motion.button
//                       onClick={handlePlay}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       transition={{ duration: 0.5, delay: 0.7 }}
//                       className="mt-10 px-12 py-4 bg-white text-yellow-500 font-bold text-sm rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all uppercase font-bold tracking-[0.2em]"
//                     >
//                       Start
//                     </motion.button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Skip Button (Appears while playing) */}
//             <AnimatePresence>
//               {isPlaying && (
//                  <motion.button 
//                    initial={{ opacity: 0 }}
//                    animate={{ opacity: 1 }}
//                    exit={{ opacity: 0 }}
//                    transition={{ delay: 1 }}
//                    onClick={handleVideoEnded}
//                    className="absolute bottom-10 right-10 text-white/40 hover:text-white transition-colors z-30 text-xs tracking-[0.2em] uppercase font-semibold"
//                  >
//                    Skip Intro
//                  </motion.button>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* The actual page content, revealed when the video ends */}
//       {children}
//     </>
//   )
// }



'use client'

import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

const floatingCoins = [
  { left: "10%", size: 0.5, duration: 12, delay: 0, rotateDuration: 3 },
  { left: "85%", size: 0.4, duration: 15, delay: 2, rotateDuration: 4 },
  { left: "25%", size: 0.6, duration: 10, delay: 5, rotateDuration: 2.5 },
  { left: "75%", size: 0.3, duration: 18, delay: 1, rotateDuration: 5 },
  { left: "45%", size: 0.45, duration: 14, delay: 7, rotateDuration: 3.5 },
  { left: "60%", size: 0.55, duration: 11, delay: 4, rotateDuration: 2 },
];
const FRAME_COUNT = 170

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

export default function IntroVideoSequence({ children }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const coverRef = useRef(null)
  const phrase1Ref = useRef(null)
  const phrase2Ref = useRef(null)
  const bgRef = useRef(null)
  const overlayRef = useRef(null)
  const [images, setImages] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Preload frames from the videoframs directory
  useEffect(() => {
    const loadedImages = []
    let loadedCount = 0

    const preloadImages = () => {
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new window.Image()
        const frameIndex = i.toString().padStart(3, '0')
        img.src = `/videoframs/ezgif-frame-${frameIndex}.jpg`
        img.onload = () => {
          loadedCount++
          if (loadedCount === FRAME_COUNT) {
            setImages(loadedImages)
            setIsLoaded(true)
          }
        }
        loadedImages[i - 1] = img
      }
    }

    preloadImages()
  }, [])

  useEffect(() => {
    if (!isLoaded || images.length === 0) return

    gsap.registerPlugin(ScrollTrigger)

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Drawing logic to maintain "cover" aspect ratio on canvas
    const renderFrame = (index) => {
      const img = images[index]
      if (!img) return

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const imgWidth = img.width
      const imgHeight = img.height

      const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight)
      const newWidth = imgWidth * ratio
      const newHeight = imgHeight * ratio
      const x = (canvasWidth - newWidth) / 2
      const y = (canvasHeight - newHeight) / 2

      context.clearRect(0, 0, canvasWidth, canvasHeight)
      context.drawImage(img, x, y, newWidth, newHeight)
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      renderFrame(0)
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    const playhead = { frame: 0 }

    // Primary Scroll Scrubbing Animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    })

    // Fade out the initial cover screen immediately as scrolling starts
    gsap.to(coverRef.current, {
      opacity: 0,
      pointerEvents: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "4% top",
        scrub: true,
      }
    })

    tl.to(playhead, {
      frame: FRAME_COUNT - 1,
      snap: 'frame',
      ease: 'none',
      onUpdate: () => renderFrame(Math.round(playhead.frame))
    })

    // Fade out the canvas as we approach the end of the scroll
    gsap.to(canvas, {
      opacity: 0,
      scrollTrigger: {
        trigger: containerRef.current,
        start: '70% top',
        end: 'bottom bottom',
        scrub: true,
      }
    })

    // Fade out the dynamic background along with the canvas to transition cleanly to HeroSection
    gsap.to(bgRef.current, {
      opacity: 0,
      scrollTrigger: {
        trigger: containerRef.current,
        start: '70% top',
        end: 'bottom bottom',
        scrub: true,
      }
    })

    // Fade out the dark overlay
    gsap.to(overlayRef.current, {
      opacity: 0,
      scrollTrigger: {
        trigger: containerRef.current,
        start: '70% top',
        end: 'bottom bottom',
        scrub: true,
      }
    })

    // Phrase 1: 10% -> 30%
    gsap.fromTo(phrase1Ref.current, 
      { opacity: 0, x: -50 },
      { 
        opacity: 1, x: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "5% top",
          end: "37% top",
          scrub: true,
        }
      }
    )
    gsap.to(phrase1Ref.current, {
      opacity: 0, x: 50,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "40% top",
        end: "50% top",
        scrub: true,
      }
    })

    // Phrase 2
    gsap.fromTo(phrase2Ref.current, 
      { opacity: 0, x: -50 },
      { 
        opacity: 1, x: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "45% top",
          end: "67% top",
          scrub: true,
        }
      }
    )
    gsap.to(phrase2Ref.current, {
      opacity: 0, x: 50,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "70% top",
        end: "74% top",
        scrub: true,
      }
    })



    return () => {
      window.removeEventListener('resize', resizeCanvas)
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [isLoaded, images])

  return (
    <div ref={containerRef} className="relative w-full h-[900vh] bg-[#07090F]">

      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        
        {/* The Frame Sequence Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full block z-10 pointer-events-none"
        />
 
        {/* Dynamic Animated Background (Visible during scroll sequence, fades out at end) */}
        <div ref={bgRef} className="absolute inset-0 pointer-events-none z-20">
          <div className="grid-bg" />
          {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FF87]/5 to-transparent pointer-events-none" /> */}
          
          <motion.div 
            animate={{ opacity: [0.3, 0.4, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[0%] left-[-3%] w-[500px] h-[300px] rounded-[50%] bg-[#6be6b0] blur-[200px] pointer-events-none" 
          />
          <motion.div 
            animate={{ opacity: [0.6, 0.5, 0.6], scale: [1.2, 1, 1.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut"}}
            className="absolute top-[0%] right-[-3%] w-[500px] h-[300px] rounded-full bg-[#EA7108] blur-[200px] pointer-events-none" 
          />
          <Particles count={60} />
        </div>

       {/* Dark overlay to ensure text readability if frames are bright, fades out at end */}
        <div ref={overlayRef} className="absolute inset-0 bg-black/40 pointer-events-none z-10" />

        {/* Initial Cover Screen - Fades out on scroll */}
        <div ref={coverRef} className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden">
          
          {/* Floating Coins Background */}
          {floatingCoins.map((coin, i) => (
            <motion.div
              key={i}
              className="absolute hidden md:block z-0"
              style={{ left: coin.left, top: "110%" }}
              animate={{
                y: ["0vh", "-120vh"],
              }}
              transition={{
                y: {
                  duration: coin.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: coin.delay,
                }
              }}
            >
              <Image
                src="/coin.gif"
                alt="Floating Coin"
                width={200 * coin.size}
                height={200 * coin.size}
                className="opacity-40 blur-[3px] pointer-events-none mix-blend-screen"
              />
            </motion.div>
          ))}

          <div className="relative w-55 h-55 flex items-center justify-center drop-shadow-[0_0_40px_rgba(250,204,21,0.6)] z-10">
            <Image 
              src="/coin.gif"
              alt="Walletly Coin"
              width={100}
              height={100}
              className="w-full h-full object-contain scale-[1.5] md:scale-[2]"
            />
          </div>
          <div className="mt-12 text-center max-w-sm px-4">
            <h3 className="text-white text-2xl sm:text-3xl font-bold tracking-wider">
              Welcome to Walletly
            </h3>
            <p className="mt-3 text-white/70 text-base leading-relaxed font-light">
              Scroll to discover the future of seamless wealth management.
            </p>
          </div>
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-center px-10 md:px-20">
          <div ref={phrase1Ref} className="opacity-0 max-w-3xl bg-[#07090F]/5 backdrop-blur-sm p-8 rounded-lg">
            <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tight leading-tight drop-shadow-2xl">
              Walletly
            </h2>
            <p className="text-xl md:text-3xl text-white/90 mt-4 font-medium tracking-wide drop-shadow-lg">
              Empower your financial future,<br/> Smart, Secure, Seamless.
            </p>
          </div>

          <div ref={phrase2Ref} className="opacity-0 absolute left-0 w-full flex justify-center bg-[#07090F]/5 backdrop-blur-sm p-8 rounded-lg">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight drop-shadow-2xl text-center px-6">
              Take full control of your money
            </h2>
          </div>

        </div>

        {/* Hero Section - Hidden behind the canvas and revealed at the end */}
        <div className="absolute inset-0 z-0">
           {children}
        </div>

      </div>
    </div>
  )
}

             