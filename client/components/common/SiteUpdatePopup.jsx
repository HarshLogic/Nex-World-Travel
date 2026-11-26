'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Sparkles, ArrowRight, Phone, Clock } from 'lucide-react';

export default function SiteUpdatePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Reveal popup shortly after initial mount when opening website
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-brand-navy/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-update-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-border overflow-hidden transition-all duration-300 transform scale-100 p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-brand-teal to-brand-navy" />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close update announcement"
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-brand-navy hover:bg-surface-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo & Status Indicator */}
        <div className="flex flex-col items-center mt-2 mb-4">
          <div className="relative h-10 w-44 mb-4">
            <Image
              src="/images/logo.png"
              alt="Nex World Travel & Tourism"
              fill
              sizes="176px"
              priority
              className="object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200 text-amber-800 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Notice • System Maintenance</span>
          </div>
        </div>

        {/* Main Heading */}
        <h2
          id="site-update-title"
          className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mb-2"
        >
          Website is currently Updating
        </h2>

        {/* Brand Slogan */}
        <div className="py-2.5 px-3.5 rounded-2xl bg-surface-50 border border-border/80 my-3">
          <p className="text-xs sm:text-sm font-bold text-brand-navy leading-snug">
            Dream Without Limits, <span className="text-brand-teal">Discover Endless Possibilities</span>, Explore Beyond Boundaries
          </p>
        </div>

        {/* Explanatory Message */}
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
          We are enhancing our digital experience with new destination packages, live activity bookings, and exclusive membership benefits. You may continue exploring our website while updates are underway.
        </p>

        {/* Quick Assistance Bar */}
        <div className="p-3 rounded-2xl bg-surface-50 border border-border flex items-center justify-between mb-6 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-brand-navy">
            <Clock className="w-3.5 h-3.5 text-brand-teal" />
            <span>Immediate Assistance</span>
          </div>
          <a
            href="https://wa.me/971585744687"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-bold text-brand-teal hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp Support</span>
          </a>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm text-white bg-brand-teal hover:bg-brand-teal-dark shadow-sm transition-all duration-200 active:scale-[0.99] group"
        >
          <span>Continue to Website</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
