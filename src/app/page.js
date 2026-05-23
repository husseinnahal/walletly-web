'use client'

import { useState, useCallback } from 'react'
import DownloadSection from '../components/walletly/DownloadSection'
import FeaturesSection from '../components/walletly/FeaturesSection'
import Footer from '../components/walletly/Footer'
import HeroSection from '../components/walletly/HeroSection'
import IntroVideoSequence from '../components/walletly/IntroVideoSequence'
import HowItWorksSection from '../components/walletly/HowItWorksSection'
import Navbar from '../components/walletly/Navbar'
import SecuritySection from '../components/walletly/SecuritySection'
import SplashOpener from '../components/walletly/SplashOpener'
import StatsMarquee from '../components/walletly/StatsMarquee'

export default function Home() {
  const [splashDone, setSplashDone] = useState(false)
  const handleSplashFinish = useCallback(() => setSplashDone(true), [])

  return (
    <>
      {/* Splash opener — coins fill the screen, then "Walletly" appears */}
      {!splashDone && <SplashOpener onFinish={handleSplashFinish} />}

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main>
          <IntroVideoSequence>
            <HeroSection />
          </IntroVideoSequence>
          <StatsMarquee />
          <FeaturesSection />
          <HowItWorksSection />
          <SecuritySection />
          {/* <TestimonialsSection /> */}
          <DownloadSection />
        </main>
        <Footer />
      </div>
    </>
  )
}
