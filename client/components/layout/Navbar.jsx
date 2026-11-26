'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight, PhoneCall, User, Shield, MapPin, Sparkles, Clock } from 'lucide-react';
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
      setScrolled(window.scrollY > 20);
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
        fullLabel: 'Member Portal',
        shortLabel: 'Member',
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
        fullLabel: 'Staff Specialist Portal',
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(16,42,67,0.08)] border-b border-border/80 py-2.5 sm:py-3'
            : 'bg-white/95 backdrop-blur-sm border-b border-border/60 py-3 sm:py-4'
        }`}
      >
        {/* Top Mini Utility Bar (Desktop only, subtle & informative) */}
        <div className="hidden xl:block border-b border-border/40 pb-2 mb-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] text-text-secondary">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-brand-navy font-medium">
                <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                <span>Bin Hamooda Tower, Abu Dhabi, U.A.E.</span>
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1.5 text-amber-800 font-semibold bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Official Travel Partner for Lulu Events in 2025</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-text-secondary">
                <Clock className="w-3 h-3 text-brand-teal" />
                <span>Tue – Sun: 11:00 AM – 07:00 PM (Mon Closed)</span>
              </span>
              <span className="text-border">•</span>
              <a
                href="tel:+97126395908"
                className="font-mono font-semibold text-brand-navy hover:text-brand-teal transition-colors flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3 text-brand-teal" />
                <span>+971-263-959-08</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 lg:gap-4">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-lg"
              aria-label="Nex World Travel & Tourism Homepage"
            >
              <div className="relative h-10 w-36 sm:h-11 sm:w-44 xl:h-12 xl:w-52 transition-transform duration-200 group-hover:scale-[1.01]">
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

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-surface-50 px-3 py-1.5 rounded-full border border-border/80 shadow-subtle shrink-0"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
                      isActive
                        ? 'bg-white text-brand-navy shadow-subtle border border-border/60'
                        : 'text-text-secondary hover:text-brand-navy hover:bg-white/60'
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:text-brand-teal transition-all py-2 px-3 xl:px-3.5 rounded-full hover:bg-surface-50 border border-border shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                title={portal.fullLabel}
              >
                <PortalIcon className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <span className="hidden xl:inline">{portal.fullLabel}</span>
                <span className="inline xl:hidden">{portal.shortLabel}</span>
                {portal.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-teal-light text-brand-teal shrink-0">
                    {portal.badge}
                  </span>
                )}
              </Link>

              {/* Direct Phone Link (for lg screens when top bar hidden) */}
              <a
                href="tel:+97126395908"
                className="inline-flex xl:hidden items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-teal transition-colors py-2 px-2.5 rounded-full hover:bg-surface-50 shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                title="Call Nex World Travel Abu Dhabi: +971-263-959-08"
              >
                <PhoneCall className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <span className="font-mono text-xs">+971-263-959-08</span>
              </a>

              {/* Plan Your Journey CTA Button - Hidden on Admin/Staff Dashboards */}
              {!isAdminOrStaff && (
                <Link
                  href="/booking"
                  className="group relative inline-flex items-center gap-1.5 px-4 py-2 xl:px-5 xl:py-2.5 rounded-full text-xs xl:text-sm font-semibold text-white bg-brand-teal hover:bg-brand-teal-dark shadow-sm transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-teal"
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
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal-dark rounded-full shadow-sm whitespace-nowrap active:scale-95 transition-all"
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
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border bg-white text-brand-navy hover:text-brand-teal hover:bg-surface-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-brand-navy" />
                ) : (
                  <Menu className="w-5 h-5 text-brand-navy" />
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
          className="fixed inset-0 bg-brand-navy/50 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
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
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border hover:bg-surface-50 text-text-secondary hover:text-brand-navy transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
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
                      ? 'bg-brand-teal-light text-brand-teal font-bold shadow-subtle'
                      : 'text-brand-navy hover:bg-surface-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-brand-teal" />
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
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border text-sm font-semibold text-brand-navy bg-surface-50 hover:bg-white hover:border-brand-teal/50 hover:shadow-subtle transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-teal-light text-brand-teal">
                  <PortalIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-brand-navy">{portal.fullLabel}</span>
                  <span className="block text-[11px] text-text-secondary">
                    {authUser ? `Role: ${authUser.role}` : 'Login with Member ID'}
                  </span>
                </div>
              </div>
              {portal.badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal-light text-brand-teal">
                  {portal.badge}
                </span>
              )}
            </Link>
            {!authUser && (
              <div className="flex items-center justify-between px-3 pt-2.5 text-xs text-text-muted">
                <Link
                  href="/employee/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-brand-teal font-medium transition-colors"
                >
                  Employee Login
                </Link>
                <span className="text-border">•</span>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-brand-teal font-medium transition-colors"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>

          {/* Phone Contact & Booking Consultation */}
          <div className="pt-2 space-y-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1 px-3">
              Direct Travel Consultation
            </span>
            <a
              href="tel:+97126395908"
              className="flex items-center gap-3 p-3.5 bg-surface-50 hover:bg-white hover:border-brand-teal/40 border border-border rounded-2xl transition-all"
            >
              <div className="p-2.5 rounded-xl bg-brand-teal-light text-brand-teal shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-brand-navy font-mono">+971-263-959-08</span>
                <span className="block text-[11px] text-text-secondary">Head Office Desk • Abu Dhabi</span>
              </div>
            </a>

            {!isAdminOrStaff && (
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white bg-brand-teal hover:bg-brand-teal-dark shadow-md transition-all active:scale-95"
              >
                <span>Plan Your Journey</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Location & Partner Note */}
          <div className="pt-4 border-t border-border/80 text-[11px] text-text-secondary space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
              <MapPin className="w-3.5 h-3.5 text-brand-teal" />
              <span>Bin Hamooda Tower, Abu Dhabi, UAE</span>
            </div>
            <p className="text-text-muted">
              Official Partner for Lulu Events • Affiliated with Club Nexa
            </p>
          </div>
        </div>
      </aside>

      {/* Spacer so page content begins neatly below fixed header */}
      <div className="h-[76px] sm:h-[84px] xl:h-[104px]" aria-hidden="true" />
    </>
  );
}
