import Link from 'next/link';
import { ArrowUpRight, Sparkles, MessageSquare, ShieldCheck, Compass } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-4xl bg-gradient-to-br from-accent-primary-light via-white to-accent-secondary-light border border-border p-8 sm:p-14 md:p-16 overflow-hidden shadow-card text-center max-w-5xl mx-auto">
          {/* Subtle decorative glow circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-border shadow-subtle text-xs font-semibold text-accent-primary mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Travel Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-tight mb-4">
              Let’s Plan a Journey That Feels Like Yours.
            </h2>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8">
              Tell us what you love, from preferred dates to must-see landmarks. Our Abu Dhabi travel specialists will craft a tailored holiday plan with clear guidance and personalized care.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
              <Link
                href="/booking"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm sm:text-base font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-lg shadow-accent-primary/25 transition-all duration-200 active:scale-95 group"
              >
                <span>Start Planning Your Journey</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm sm:text-base font-semibold text-text-primary bg-white hover:bg-surface-50 border border-border shadow-subtle transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4 text-text-secondary" />
                <span>Contact Travel Desk</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-border/60 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-accent-secondary" />
                100% Free Consultation
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Compass className="w-4 h-4 text-accent-primary" />
                No Booking Fees Upfront
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Dedicated Travel Specialist
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

