import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Sparkles, Shield, Clock, Building, Users } from 'lucide-react';

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/nexworldtravel',
    label: 'Visit Nex World Travel on Facebook',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/nexworldtravel',
    label: 'Follow Nex World Travel on Instagram',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@nexworld.ae',
    label: 'Watch Nex World Travel on TikTok',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.05 1.04 1.92 2.04 2.27.65.23 1.36.27 2.04.14 1.05-.18 1.96-.86 2.4-1.81.25-.56.34-1.18.33-1.8.02-3.66-.01-7.33.01-11-.01-1.57.01-3.13-.01-4.7z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/nex-world-travel-tourism-llc-spc/',
    label: 'Connect with Nex World Travel on LinkedIn',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@nexworldtravel',
    label: 'Watch Nex World Travel on YouTube',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-surface-50 border-t border-border pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Corporate Affiliation */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-48">
                <Image
                  src="/images/logo.png"
                  alt="Nex World Travel & Tourism"
                  fill
                  sizes="192px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
              Nex World Travel & Tourism is a trusted travel agency headquartered in Abu Dhabi. We curate tailored global journeys, luxury escapes, flight reservations, and unforgettable activities across Asia, Europe, Africa, Australia, and the Middle East.
            </p>

            {/* Lulu Events Official Announcement */}
            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5 max-w-sm">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Official Travel Partner</strong>
                <span className="text-[11px] text-amber-800">
                  Official Travel Partner for Lulu Events in 2025 (Summer Carnival and Shopathon).
                </span>
              </div>
            </div>

            {/* Nex Group of Companies - Corporate Umbrella */}
            <div className="p-3.5 bg-white rounded-2xl border border-border shadow-subtle space-y-2 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-28 shrink-0">
                  <Image
                    src="/images/nex-group-logo.jpg"
                    alt="Nex Group of Companies"
                    fill
                    sizes="112px"
                    className="object-contain object-left"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-accent-primary block">
                    A Nex Group Company
                  </span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-8 h-8 rounded-full bg-white hover:bg-accent-primary hover:text-white border border-border flex items-center justify-center text-text-secondary transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Destinations */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase mb-4">
              Destinations
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link href="/destinations#asia" className="hover:text-accent-primary transition-colors">
                  Asia Discovery
                </Link>
              </li>
              <li>
                <Link href="/destinations#europe" className="hover:text-accent-primary transition-colors">
                  Europe Grand Tours
                </Link>
              </li>
              <li>
                <Link href="/destinations#africa" className="hover:text-accent-primary transition-colors">
                  Africa Safaris
                </Link>
              </li>
              <li>
                <Link href="/destinations#australia" className="hover:text-accent-primary transition-colors">
                  Australia Coastal
                </Link>
              </li>
              <li>
                <Link href="/destinations#uae" className="hover:text-accent-primary transition-colors">
                  Emirates & Dubai Luxury
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link href="/packages" className="hover:text-accent-primary transition-colors">
                  Holiday Packages
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-accent-primary transition-colors">
                  Activities & Visa
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent-primary transition-colors">
                  About Our Team
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-accent-primary transition-colors">
                  Trip Planning Consultation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent-primary transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li className="pt-2 mt-1 border-t border-border/60 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Member Portal</span>
                </Link>
                <Link
                  href="/employee/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors font-medium"
                >
                  <Users className="w-3.5 h-3.5 text-sky-500" />
                  <span>Employee Login</span>
                </Link>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors font-medium"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Offices & Consultation Hours */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase mb-3">
              Office Locations
            </h4>

            {/* Head Office UAE */}
            <div className="space-y-1.5 text-xs text-text-secondary">
              <strong className="block text-text-primary font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                <span>Branch Office (UAE)</span>
              </strong>
              <p className="text-[11px] leading-relaxed">
                Office 1203, 12th Floor, Bin Hamooda Tower, Khalifa Bin Zayed The First St (St 2), Al Danah Zone 1, Abu Dhabi, U.A.E.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-accent-secondary shrink-0" />
                <a href="tel:+97126395908" className="hover:text-text-primary font-medium">
                  +97126395908
                </a>
              </div>
            </div>


            {/* Headquarter Office India */}
            <div className="pt-3 border-t border-border/70 space-y-1.5 text-xs text-text-secondary">
              <strong className="block text-text-primary font-semibold flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Headquarter (IND)</span>
              </strong>
              <p className="text-[11px] leading-relaxed">
                Akshay Complex, 151/152/153, Dholepatil Road, near Ruby Hall, Sangamvadi, Pune, Maharashtra 411001, India
              </p>
            </div>

            {/* Consultation Hours */}
            <div className="pt-3 border-t border-border/70 space-y-1 text-xs text-text-secondary">
              <strong className="block text-text-primary font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                <span>Consultation Hours</span>
              </strong>
              <p className="text-[11px] text-text-secondary">Tuesday to Sunday: 11:00 AM – 07:00 PM</p>
              <p className="text-[11px] text-rose-600 font-semibold">Monday: Closed</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary text-center sm:text-left">
          <p>© {new Date().getFullYear()} Nex World Travel & Tourism LLC-SPC. A Nex Group Company. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-text-muted hover:text-accent-primary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Member Portal</span>
            </Link>
            <Link
              href="/employee/login"
              className="inline-flex items-center gap-1 text-text-muted hover:text-accent-primary transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-sky-500" />
              <span>Employee Login</span>
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-text-muted hover:text-accent-primary transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin Portal</span>
            </Link>
            <span>Nex-World Travel</span>
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified Agency Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

