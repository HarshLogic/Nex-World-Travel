'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Compass, Sparkles, ShieldCheck, MapPin } from 'lucide-react';
import SearchPanel from './SearchPanel';

export default function HeroSection() {
  return (
    <section className="relative pt-6 pb-20 md:pb-28 overflow-hidden tech-grid-bg">
      {/* Decorative futuristic subtle background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white border border-border shadow-subtle text-[11px] sm:text-xs font-semibold text-text-primary max-w-full">
            <span className="flex h-2 w-2 rounded-full bg-accent-secondary animate-pulse shrink-0" />
            <MapPin className="w-3.5 h-3.5 text-accent-primary shrink-0" />
            <span className="truncate">Nex World Travel & Tourism • Abu Dhabi</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] sm:text-xs font-semibold text-amber-800 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Official Travel Partner for Lulu Events in 2025 (Summer Carnival and Shopathon)</span>
          </div>
        </div>

        {/* Editorial Headline */}
        <div className="text-center max-w-5xl mx-auto mb-10 px-2 sm:px-0">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6">
            Dream Without Limits.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-indigo-600 to-accent-secondary">
              Discover Endless Possibilities.
            </span>{' '}
            Explore Beyond Boundaries
          </h1>
          <p className="text-base sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Discover extraordinary destinations, thoughtfully curated holidays, and unforgettable experiences crafted around your unique rhythm.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 w-full max-w-md sm:max-w-none mx-auto">
            <Link
              href="/destinations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-lg shadow-accent-primary/25 transition-all duration-200 active:scale-95 group"
            >
              <span>Explore Destinations</span>
              <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
            </Link>

            <Link
              href="/booking"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-text-primary bg-white hover:bg-surface-50 border border-border shadow-subtle hover:border-accent-primary/40 transition-all duration-200 group"
            >
              <span>Plan Your Journey</span>
              <ArrowUpRight className="w-4 h-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Hero Photograph Showcase Card */}
        <div className="relative w-full max-w-5xl mx-auto mb-10 rounded-3xl overflow-hidden shadow-card border border-border group">
          <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full">
            <Image
              src="/images/hero.jpg"
              alt="Nex World Travel - Breathtaking Global Adventures"
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              priority
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {/* Soft modern gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-white">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-2">
                  Featured Sanctuary
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">Unveiling World Wonders with Personalized Elegance</h3>
                <p className="text-xs sm:text-sm text-white/80 max-w-lg mt-1">
                  Asia • Europe • Africa • Australia • United Arab Emirates
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-accent-secondary" />
                <span>Tailored Consultation & Direct Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Panel Docked */}
        <SearchPanel />
      </div>
    </section>
  );
}

