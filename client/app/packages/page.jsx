'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { packagesData } from '../../data/packages';

const REGIONS = ['All', 'Europe', 'Asia', 'Australia', 'Middle East / UAE'];

function PackagesContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get('region') || 'All';

  const [selectedRegion, setSelectedRegion] = useState(initialRegion);

  useEffect(() => {
    const r = searchParams.get('region');
    if (r) setSelectedRegion(r);
  }, [searchParams]);

  const filtered = selectedRegion === 'All'
    ? packagesData
    : packagesData.filter((p) => p.region.toLowerCase().includes(selectedRegion.toLowerCase()));

  return (
    <div className="py-12 md:py-20 bg-surface-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Grand Itineraries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Tailor-Made Holiday Packages
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-3">
            Thoughtfully constructed journeys featuring luxury boutique stays, high-speed regional rail or private flights, skip-the-line iconic access, and personal concierges.
          </p>

          {/* Region Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  selectedRegion === region
                    ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/20'
                    : 'bg-white text-text-secondary hover:text-text-primary border border-border hover:border-accent-primary/30'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-4xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
            >
              {/* Photo */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-200">
                <Image
                  src={pkg.imageUrl}
                  alt={pkg.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-text-primary shadow-sm">
                    {pkg.region}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-accent-primary text-white text-xs font-bold shadow-sm">
                    {pkg.durationDays} Days / {pkg.durationNights} Nights
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-white/90 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-accent-secondary" />
                    <span className="font-semibold">{pkg.destination}</span>
                  </div>
                </div>
              </div>

              {/* Package Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">
                    {pkg.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-accent-primary mb-3">
                    {pkg.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                    {pkg.overview}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-2.5">
                      Included Luxuries:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pkg.includes.slice(0, 4).map((inc) => (
                        <li key={inc} className="flex items-start gap-2 text-xs text-text-secondary">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-secondary flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 border-t border-border flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="block text-[11px] text-text-muted">Pricing</span>
                    <span className="text-xs font-semibold text-text-primary">
                      {pkg.priceEstimateNote}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/packages/${pkg.slug}`}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-accent-primary hover:bg-accent-primary-light transition-colors"
                    >
                      View Itinerary
                    </Link>
                    <Link
                      href={`/booking?package=${encodeURIComponent(pkg.title)}`}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm transition-all"
                    >
                      <span>Enquire Package</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-text-secondary">Loading curated packages...</div>}>
      <PackagesContent />
    </Suspense>
  );
}
