'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Compass, Sparkles, ShieldCheck, MapPin } from 'lucide-react';
import SearchPanel from './SearchPanel';

export default function HeroSection() {
  return (
    <section className="relative w-full">
      {/* Full-Width Hero Background Banner */}
      <div className="relative w-full overflow-hidden bg-brand-navy min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] flex flex-col justify-between">
        {/* Full-Width Background Photograph */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Nex World Travel - Breathtaking Global Adventures"
            fill
            sizes="100vw"
            priority
            className="object-cover object-center transition-transform duration-1000 scale-[1.01]"
          />
          {/* Professional Subtle Navy Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#091C30]/85 via-[#102A43]/70 to-[#091C30]/90" />
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        </div>

        {/* Content Container Over Background */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-12 pb-14 sm:pb-20 w-full flex-1 flex flex-col justify-between">
          <div>
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-subtle text-[11px] sm:text-xs font-semibold text-white max-w-full">
                <span className="flex h-2 w-2 rounded-full bg-brand-teal-light animate-pulse shrink-0" />
                <MapPin className="w-3.5 h-3.5 text-brand-teal-light shrink-0" />
                <span className="truncate">Nex World Travel & Tourism • Abu Dhabi</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-950/60 backdrop-blur-md border border-amber-400/40 text-[11px] sm:text-xs font-semibold text-amber-200 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Official Travel Partner for Lulu Events in 2025 (Summer Carnival and Shopathon)</span>
              </div>
            </div>

            {/* Editorial Headline */}
            <div className="text-center max-w-5xl mx-auto mb-8 sm:mb-10 px-2 sm:px-0">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6 drop-shadow-sm">
                Dream Without Limits,{' '}
                <span className="text-brand-teal-light">
                  Discover Endless Possibilities,
                </span>{' '}
                Explore Beyond Boundaries
              </h1>
              <p className="text-base sm:text-xl text-slate-100/95 leading-relaxed max-w-2xl mx-auto font-normal drop-shadow-xs">
                Discover extraordinary destinations, thoughtfully curated holidays, and unforgettable experiences crafted around your unique rhythm.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 w-full max-w-md sm:max-w-none mx-auto">
                <Link
                  href="/destinations"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white bg-brand-teal hover:bg-brand-teal-dark shadow-md transition-all duration-200 active:scale-95 group"
                >
                  <span>Explore Destinations</span>
                  <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
                </Link>

                <Link
                  href="/booking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 shadow-subtle transition-all duration-200 group"
                >
                  <span>Plan Your Journey</span>
                  <ArrowUpRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Sanctuary & Curated Regions Bar */}
          <div className="pt-6 sm:pt-8 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-white">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-2">
                Featured Sanctuary
              </span>
              <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
                Unveiling World Wonders with Personalized Elegance
              </h3>
              <p className="text-xs sm:text-sm text-slate-200/90 max-w-lg mt-1 font-medium">
                Asia • Europe • Africa • Australia • United Arab Emirates
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-teal-light shrink-0" />
              <span>Tailored Consultation & Direct Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Journey Search Panel Overlapping Hero */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 lg:-mt-14 mb-8 sm:mb-12">
        <SearchPanel />
      </div>
    </section>
  );
}
