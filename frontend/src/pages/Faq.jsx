import React from 'react'
import FAQ from '../components/Faq'
import HeroSection from '../components/AboutUs/HeroSection'
export default function Faq() {
  return (
    <div className='mt-16 xl:mt-24'>
      <HeroSection faq />
        <FAQ/>
    </div>
  )
}
