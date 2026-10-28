'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Sparkles, ArrowRight, Phone, Mail, Clock } from 'lucide-react';

export default function SiteUpdatePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Reveal popup shortly after initial mount when opening website
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 250);

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-update-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-border overflow-hidden transition-all duration-300 transform scale-100 p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gradient Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-accent-primary to-accent-secondary" />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close update announcement"
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-100 transition-colors"
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

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
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
          className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2"
        >
          Website is currently Updating
        </h2>

        {/* Brand Slogan */}
        <div className="py-2 px-3 rounded-2xl bg-surface-50 border border-border/80 my-3">
          <p className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-indigo-600 to-accent-secondary leading-snug">
            Dream Without Limits, Discover Endless Possibilities, Explore Beyond Boundaries
          </p>
        </div>

        {/* Explanatory Message */}
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
          We are enhancing our digital experience with new destination packages, live activity bookings, and exclusive membership benefits. You may continue exploring our website while updates are underway.
        </p>

        {/* Quick Contact & Assistance Bar */}
        <div className="p-3.5 rounded-2xl bg-surface-50 border border-border text-left mb-6 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <Clock className="w-3.5 h-3.5 text-accent-primary" />
            <span>Direct Reservations & Support</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary">
            <a
              href="mailto:reservation@nexworldtravel.com"
              className="flex items-center gap-1.5 hover:text-accent-primary transition-colors truncate"
            >
              <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="truncate">reservation@nexworldtravel.com</span>
            </a>
            <a
              href="https://wa.me/971501234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-accent-primary transition-colors truncate"
            >
              <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>WhatsApp / Support</span>
            </a>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm text-white bg-accent-primary hover:bg-accent-primary-hover shadow-lg shadow-accent-primary/25 transition-all duration-200 active:scale-[0.99] group"
        >
          <span>Continue to Website</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

