import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-50 border-t border-border pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
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

            <div className="flex items-center gap-2 pt-2 text-xs font-medium text-text-secondary">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-primary-light text-accent-primary font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Travel
              </span>
              <span>Official Travel Partner for Lulu Events</span>
            </div>

            {/* Club Nexa Sister Company Mention */}
            <div className="p-3.5 bg-white rounded-2xl border border-border flex items-center gap-3 max-w-sm">
              <div className="relative h-7 w-24 flex-shrink-0">
                <Image
                  src="/images/club-nexa-logo.png"
                  alt="Club Nexa"
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-text-secondary">
                Affiliated with <strong className="text-text-primary">Club Nexa</strong> (Nexa Holidays & Resorts, Est. 2015).
              </p>
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
                  Activities & Adventures
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
            </ul>
          </div>

          {/* Contact Office Info */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase mb-4">
              Head Office (UAE)
            </h4>
            <ul className="space-y-3 text-xs text-text-secondary">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                <span>
                  Office 1203, 12th Floor, Bin Hamooda Tower, Khalifa Bin Zayed The First St (St 2), Al Danah Zone 1, Abu Dhabi, U.A.E.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-secondary flex-shrink-0" />
                <a href="tel:+97126395908" className="hover:text-text-primary">
                  +971 2 639 5908 / +971 2 639 7786
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent-primary flex-shrink-0" />
                <a href="mailto:info@nexworldtravel.com" className="hover:text-text-primary">
                  info@nexworldtravel.com
                </a>
              </li>
            </ul>

            <div className="mt-5">
              <Link
                href="/booking"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary hover:text-accent-primary-hover"
              >
                <span>Request Itinerary Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} Nex World Travel & Tourism. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Next-Gen Travel Architecture</span>
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Agency Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

