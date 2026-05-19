'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function ScrollVideoSequence({ children }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  
  // Track scroll progress through this 400vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Fade out the video in the last 20% of the scroll sequence to smoothly reveal the Hero Section
  const videoOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0])

  useEffect(() => {
    let animationFrameId;
    
    // Smooth video scrubbing based on scroll position
    const render = () => {
      if (videoRef.current && !isNaN(videoRef.current.duration)) {
        // Get the current scroll progress (0 to 1)
        const progress = scrollYProgress.get();
        
        // Map scroll progress to video time
        // We only scrub up to the end of the video
        const targetTime = progress * videoRef.current.duration;
        
        // Update video frame
        videoRef.current.currentTime = targetTime;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    // Make sure the video is loaded so we have a duration
    if (videoRef.current) {
        // Force the video to load its metadata so we know the duration
        videoRef.current.load();
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [scrollYProgress])

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] bg-[#07090F]">
      
      {/* 
        This is the sticky container. As you scroll down the 400vh, 
        this stays pinned to the screen. 
      */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        
        {/* 
          1. The Hero Section (children) sits in the background. 
          It will be revealed when the video fades out.
        */}
        <div className="absolute inset-0 w-full h-full">
          {children}
        </div>

        {/* 
          2. The Video overlay sits on top. 
          Its opacity decreases to 0 at the end of the scroll.
        */}
        <motion.div 
          className="absolute inset-0 w-full h-full bg-[#07090F] z-10 pointer-events-none"
          style={{ opacity: videoOpacity }}
        >
          <video
            ref={videoRef}
            src="/coin.mp4"
            className="w-full h-full object-cover"
            preload="auto"
            muted
            playsInline
          />
          {/* Subtle gradient overlay to blend it with the dark theme */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090F]/20 via-transparent to-[#07090F]/80" />
        </motion.div>
        
      </div>

    </div>
  )
}
