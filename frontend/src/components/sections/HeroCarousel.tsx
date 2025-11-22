'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import type { HeroContent } from '@/data/homeContent';

interface HeroCarouselProps {
  slides: HeroContent[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ slides, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, autoPlayInterval]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/7] w-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {slide.image ? (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600" />
            )}
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/20 to-transparent" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="container mx-auto px-4 pb-6 sm:px-6 sm:pb-8 md:px-8 md:pb-12 lg:px-16 lg:pb-16">
          <div className="max-w-full sm:max-w-xl md:max-w-2xl space-y-2 sm:space-y-3 md:space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-2.5 py-1.5 sm:px-4 sm:py-2 text-white shadow-lg animate-fade-in-up">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                {currentSlide.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight text-white drop-shadow-2xl animate-fade-in-up delay-100">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed drop-shadow-lg animate-fade-in-up delay-200 max-w-full sm:max-w-md md:max-w-xl line-clamp-2 sm:line-clamp-3">
              {currentSlide.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 pt-1 sm:pt-2 animate-fade-in-up delay-300">
              <Link
                href={currentSlide.primaryCta.href}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 text-sm sm:text-base font-bold text-white shadow-2xl shadow-emerald-500/50 transition-all hover:scale-105 hover:shadow-emerald-500/70 text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {currentSlide.primaryCta.label}
                  <Icon name="arrow-left" size={16} className="transition-transform group-hover:-translate-x-1 hidden sm:inline" />
                </span>
              </Link>
              <Link
                href={currentSlide.secondaryCta.href}
                className="rounded-xl sm:rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-md px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 text-sm sm:text-base font-bold text-white transition-all hover:bg-white/20 hover:border-white/50 text-center"
              >
                {currentSlide.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 md:left-6 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md p-2 sm:p-3 md:p-4 text-white shadow-xl transition hover:scale-110 hover:bg-white/20 hidden sm:block"
        aria-label="Previous slide"
      >
        <Icon name="chevron-left" size={20} className="sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 md:right-6 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md p-2 sm:p-3 md:p-4 text-white shadow-xl transition hover:scale-110 hover:bg-white/20 hidden sm:block"
        aria-label="Next slide"
      >
        <Icon name="chevron-right" size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Progress Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-1.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8 sm:w-10 md:w-12 bg-white shadow-lg shadow-white/50' 
                : 'w-1 sm:w-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
