'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight, PhoneCall, User, Shield, MapPin, Sparkles } from 'lucide-react';
import { getAuthUser } from '../../lib/auth';

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
  const [authUser, setAuthUser] = useState(null);
  const pathname = usePathname();
  const drawerRef = useRef(null);
  const isAdminOrStaff = (pathname || '').startsWith('/admin') || (pathname || '').startsWith('/employee');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update auth status and close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAuthUser(getAuthUser());
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const getPortalInfo = () => {
    if (!authUser) {
      return {
        href: '/login',
        fullLabel: 'Member / Staff Portal',
        shortLabel: 'Portal',
        badge: null,
        icon: User,
      };
    }
    if (authUser.role === 'master_head') {
      return {
        href: '/admin/dashboard',
        fullLabel: 'Master Admin',
        shortLabel: 'Admin',
        badge: 'Admin',
        icon: Shield,
      };
    }
    if (authUser.role === 'employee') {
      return {
        href: '/employee/dashboard',
        fullLabel: 'Staff Portal',
        shortLabel: 'Staff',
        badge: 'Staff',
        icon: Shield,
      };
    }
    return {
      href: '/member/dashboard',
      fullLabel: 'Member Portal',
      shortLabel: 'Member',
      badge: authUser.memberId || 'Member',
      icon: User,
    };
  };

  const portal = getPortalInfo();
  const PortalIcon = portal.icon;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-subtle border-b border-border py-3'
            : 'bg-white/90 backdrop-blur-sm border-b border-border/60 py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 lg:gap-4">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded-lg"
              aria-label="Nex World Travel & Tourism Homepage"
            >
              <div className="relative h-10 w-36 sm:h-11 sm:w-44 xl:h-12 xl:w-52 transition-transform duration-200 group-hover:scale-[1.02]">
                <Image
                  src="/images/logo.png"
                  alt="Nex World Travel & Tourism"
                  fill
                  sizes="(max-width: 640px) 144px, (max-width: 1280px) 176px, 208px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation Capsule */}
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-surface-50/90 p-1 xl:p-1.5 rounded-full border border-border shadow-2xs shrink-0"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-full text-xs xl:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
                      isActive
                        ? 'bg-white text-accent-primary shadow-subtle'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/70'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right CTAs Desktop Container */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
              {/* Member / Staff Portal Link */}
              <Link
                href={portal.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary hover:text-accent-primary transition-all py-2 px-3 rounded-full hover:bg-surface-50 border border-border shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                title={portal.fullLabel}
              >
                <PortalIcon className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                <span className="hidden xl:inline">{portal.fullLabel}</span>
                <span className="inline xl:hidden">{portal.shortLabel}</span>
                {portal.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-primary-light text-accent-primary shrink-0">
                    {portal.badge}
                  </span>
                )}
              </Link>

              {/* Direct Phone Link */}
              <a
                href="tel:+97126395908"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent-primary transition-colors py-2 px-2.5 xl:px-3 rounded-full hover:bg-surface-50 shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                title="Call Nex World Travel Abu Dhabi: +971 2 639 5908"
              >
                <PhoneCall className="w-3.5 h-3.5 text-accent-secondary shrink-0" />
                <span className="font-mono text-xs">+971 2 639 5908</span>
              </a>

              {/* Plan Your Journey CTA Button - Hidden on Admin/Staff Dashboards */}
              {!isAdminOrStaff && (
                <Link
                  href="/booking"
                  className="group relative inline-flex items-center gap-1.5 px-4 py-2 xl:px-5 xl:py-2.5 rounded-full text-xs xl:text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary"
                >
                  <span>Plan Your Journey</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
            </div>

            {/* Mobile Header Elements */}
            <div className="flex lg:hidden items-center gap-2 sm:gap-3">
              {!isAdminOrStaff && (
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-full shadow-sm whitespace-nowrap active:scale-95 transition-all"
                >
                  <span>Plan Trip</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border bg-white text-text-primary hover:text-accent-primary hover:bg-surface-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-text-primary" />
                ) : (
                  <Menu className="w-5 h-5 text-text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Accessible Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Mobile Navigation Drawer */}
      <aside
        id="mobile-navigation-drawer"
        ref={drawerRef}
        aria-label="Mobile Navigation Menu"
        aria-hidden={!mobileMenuOpen}
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col lg:hidden transform transition-transform duration-300 ease-out motion-reduce:transition-none ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center"
          >
            <div className="relative h-9 w-36">
              <Image
                src="/images/logo.png"
                alt="Nex World Travel"
                fill
                sizes="144px"
                className="object-contain object-left"
              />
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border hover:bg-surface-50 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 px-3">
              Explore Destinations & Services
            </span>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-accent-primary-light text-accent-primary font-bold shadow-2xs'
                      : 'text-text-primary hover:bg-surface-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-accent-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Member & Staff Portal Entry */}
          <div className="pt-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 px-3">
              Authorized Access
            </span>
            <Link
              href={portal.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border text-sm font-semibold text-text-primary bg-surface-50 hover:bg-white hover:border-accent-primary/50 hover:shadow-subtle transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent-primary-light text-accent-primary">
                  <PortalIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-text-primary">{portal.fullLabel}</span>
                  <span className="block text-[11px] text-text-secondary">
                    {authUser ? `Role: ${authUser.role}` : 'Login with credentials'}
                  </span>
                </div>
              </div>
              {portal.badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-primary-light text-accent-primary">
                  {portal.badge}
                </span>
              )}
            </Link>
          </div>

          {/* Phone Contact & Booking Consultation */}
          <div className="pt-2 space-y-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1 px-3">
              Direct Travel Consultation
            </span>
            <a
              href="tel:+97126395908"
              className="flex items-center gap-3 p-3.5 bg-surface-50 hover:bg-white hover:border-accent-primary/40 border border-border rounded-2xl transition-all"
            >
              <div className="p-2.5 rounded-xl bg-accent-secondary-light text-accent-secondary shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-text-primary font-mono">+971 2 639 5908</span>
                <span className="block text-[11px] text-text-secondary">Head Office Desk • Abu Dhabi</span>
              </div>
            </a>

            {!isAdminOrStaff && (
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md shadow-accent-primary/20 transition-all active:scale-95"
              >
                <span>Plan Your Journey</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Location & Partner Note */}
          <div className="pt-4 border-t border-border/80 text-[11px] text-text-secondary space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-text-primary">
              <MapPin className="w-3.5 h-3.5 text-accent-primary" />
              <span>Bin Hamooda Tower, Abu Dhabi, UAE</span>
            </div>
            <p className="text-text-muted">
              Official Partner for Lulu Events • Affiliated with Club Nexa
            </p>
          </div>
        </div>
      </aside>

      {/* Spacer so page content begins neatly below fixed header */}
      <div className="h-18 sm:h-20 xl:h-22" />
    </>
  );
}
