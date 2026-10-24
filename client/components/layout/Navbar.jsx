'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Compass, Menu, X, ArrowUpRight, Globe2, PhoneCall } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Holiday Packages', href: '/packages' },
  { label: 'Activities', href: '/activities' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-subtle border-b border-border py-3.5'
            : 'bg-white/80 backdrop-blur-sm border-b border-border/50 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-11 w-44 sm:h-12 sm:w-52 transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/images/logo.png"
                  alt="Nex World Travel & Tourism"
                  fill
                  sizes="(max-width: 640px) 176px, 208px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-surface-50/80 p-1.5 rounded-full border border-border">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-accent-primary shadow-subtle font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right CTAs */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="tel:+97126395908"
                className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-accent-primary transition-colors py-2 px-3 rounded-lg hover:bg-surface-50"
              >
                <PhoneCall className="w-3.5 h-3.5 text-accent-secondary" />
                <span>+971 2 639 5908</span>
              </a>

              <Link
                href="/booking"
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm transition-all duration-200 active:scale-95"
              >
                <span>Plan Your Journey</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-accent-primary rounded-full shadow-sm"
              >
                Plan Trip
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="p-2 text-text-primary hover:text-accent-primary rounded-xl border border-border bg-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-border shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 space-y-2">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-accent-primary-light text-accent-primary font-semibold'
                        : 'text-text-primary hover:bg-surface-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 mt-2 border-t border-border flex flex-col gap-3">
                <a
                  href="tel:+97126395908"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary bg-surface-50 rounded-xl"
                >
                  <PhoneCall className="w-4 h-4 text-accent-secondary" />
                  <span>Call Head Office: +971 2 639 5908</span>
                </a>
                <Link
                  href="/booking"
                  className="w-full text-center py-3 rounded-xl font-semibold text-white bg-accent-primary shadow-sm"
                >
                  Book Your Journey
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      {/* Spacer so page content begins below fixed navbar */}
      <div className="h-20 sm:h-24" />
    </>
  );
}

