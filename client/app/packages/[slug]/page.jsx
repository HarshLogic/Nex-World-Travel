import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Calendar, Clock, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { fetchPackageBySlug } from '../../../lib/api';

export default async function PackageDetailPage({ params }) {
  const pkg = await fetchPackageBySlug(params.slug);

  if (!pkg) {
    notFound();
  }

  return (
    <div className="py-8 md:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link href="/" className="hover:text-text-primary">Home</Link>
          <span>/</span>
          <Link href="/packages" className="hover:text-text-primary">Holiday Packages</Link>
          <span>/</span>
          <span className="text-accent-primary font-semibold">{pkg.title}</span>
        </nav>

        {/* Hero Card */}
        <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full rounded-4xl overflow-hidden shadow-card border border-border mb-12">
          <Image
            src={pkg.imageUrl}
            alt={pkg.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 text-white max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                {pkg.region}
              </span>
              <span className="px-3 py-1 rounded-full bg-accent-primary text-white text-xs font-semibold">
                {pkg.durationDays} Days / {pkg.durationNights} Nights
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">
              {pkg.title}
            </h1>
            <p className="text-sm sm:text-base text-white/90">
              {pkg.tagline}
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Overview and Day-by-day Itinerary */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Grand Tour Overview
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {pkg.overview}
              </p>
            </div>

            {/* Inclusions */}
            <div className="bg-surface-50 rounded-3xl p-6 sm:p-8 border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-primary" />
                <span>What’s Included in this Experience</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.includes?.map((inc) => (
                  <li key={inc} className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border border-border">
                    <CheckCircle2 className="w-4 h-4 text-accent-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-text-secondary">{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Day by Day Itinerary */}
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-6">
                Sample Day-by-Day Journey
              </h3>
              <div className="space-y-4">
                {pkg.itinerarySummary?.map((item) => (
                  <div
                    key={item.day}
                    className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-surface-50/50 hover:bg-surface-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-accent-primary-light text-accent-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                      Day {item.day}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-text-primary mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Planning Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
              <h3 className="text-xl font-bold text-text-primary">
                Book This Package
              </h3>

              <div className="p-4 rounded-2xl bg-surface-50 border border-border space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Duration:</span>
                  <strong className="text-text-primary">{pkg.durationDays} Days / {pkg.durationNights} Nights</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Destinations:</span>
                  <strong className="text-text-primary">{pkg.destination}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Itinerary:</span>
                  <strong className="text-accent-primary">Fully Customizable</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>Zero obligation enquiry. Tailor dates, hotels, and flight preferences.</span>
              </div>

              <Link
                href={`/booking?package=${encodeURIComponent(pkg.title)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md transition-all active:scale-95"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

