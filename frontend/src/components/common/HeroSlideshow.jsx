import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    image: '/banner1-1razA4xw.jpeg',
    title: 'Project Monitoring',
    subtitle: 'Central Sector Infrastructure Projects Costing Rs. 150 crore & above'
  },
  {
    image: '/banner2-AZrNp54C.png',
    title: 'Early Warning Intelligence',
    subtitle: 'Predictive Trajectory Analytics & Non-Linear Risk Detection'
  },
  {
    image: '/banner3-BkFJVKqW.png',
    title: 'National Infrastructure Pipeline',
    subtitle: 'Real-Time Multi-Sector Flash Report Telemetry across 28 States & UTs'
  },
  {
    image: '/banner4-BesNf3Ns.png',
    title: 'Decision-Support Platform',
    subtitle: 'MoSPI IPMD Continuous Flash Report Monitoring & Milestone Tracking'
  }
];

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div
      className="relative w-full h-80 sm:h-96 lg:h-[460px] rounded-2xl overflow-hidden shadow-md border border-[#C8DAEB] group select-none bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Crossfade */}
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
          style={{ transition: 'opacity 1s ease-in-out, transform 6s ease-out' }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle Ambient Contrast Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-black/25 to-slate-950/40" />
        </div>
      ))}

      {/* Center Transparent Banner Typography */}
      <div className="absolute inset-0 flex items-center justify-center p-6 z-10 pointer-events-none">
        <div className="w-full max-w-4xl text-center px-4 py-6 transform transition-all duration-500">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-widest text-[#13A8E0] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {SLIDES[currentIndex].title}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white font-semibold tracking-wider mt-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] max-w-2xl mx-auto">
            {SLIDES[currentIndex].subtitle}
          </p>
        </div>
      </div>

      {/* Navigation Arrow Left */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all shadow-md z-20 hover:scale-105"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Navigation Arrow Right */}
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all shadow-md z-20 hover:scale-105"
      >
        <ChevronRight size={22} />
      </button>

      {/* Bottom Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2.5 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-7 h-2.5 bg-[#13A8E0] shadow-md shadow-sky-500/50'
                : 'w-2.5 h-2.5 bg-white/60 hover:bg-white/90'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
