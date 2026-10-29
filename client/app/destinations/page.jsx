'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Sparkles, MapPin, Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { destinationsData } from '../../data/destinations';
import { fetchDestinations, getDestinationImageUrl } from '../../lib/api';

const REGIONS = ['All', 'Asia', 'Europe', 'Africa', 'Australia', 'Middle East / UAE'];

export default function DestinationsPage() {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [destinations, setDestinations] = useState(destinationsData);

  useEffect(() => {
    fetchDestinations()
      .then((data) => {
        if (data && data.length > 0) setDestinations(data);
      })
      .catch(() => {});
  }, []);

  const published = destinations.filter((d) => d.publicationStatus !== 'draft' && !d.isDeleted);
  const filteredDestinations =
    selectedRegion === 'All'
      ? published
      : published.filter((d) => d.region?.toLowerCase() === selectedRegion.toLowerCase());

  return (
    <div className="py-12 md:py-20 bg-surface-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Continents & Sanctuaries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Discover Global Horizons
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-3">
            Every traveler has distinct dreams. Explore our primary geographical destinations—carefully designed with bespoke itineraries, private guides, and hand-selected luxury accommodations.
          </p>

          {/* Region Filter Pills */}
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

        {/* Destination Listing */}
        <div className="space-y-12">
          {filteredDestinations.map((dest, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <div
                key={dest.id || dest._id || dest.slug}
                id={dest.id || dest.slug}
                className="bg-white rounded-4xl border border-border shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Photo Column */}
                  <div className={`lg:col-span-6 relative aspect-[16/10] lg:aspect-auto lg:min-h-[420px] ${isReversed ? 'lg:order-2' : ''}`}>
                    <Image
                      src={getDestinationImageUrl(dest)}
                      alt={dest.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-text-primary shadow-sm">
                        {dest.region}
                      </span>
                    </div>
                  </div>

                  {/* Editorial Details Column */}
                  <div className={`lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between ${isReversed ? 'lg:order-1' : ''}`}>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-accent-primary" />
                          Best time: <strong className="text-text-primary font-medium">{dest.bestTimeToVisit}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-accent-secondary" />
                          Ideal: <strong className="text-text-primary font-medium">{dest.idealDuration}</strong>
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
                        {dest.title}
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold text-accent-primary mb-3">
                        {dest.tagline}
                      </p>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                        {dest.description}
                      </p>

                      {/* Highlights */}
                      <div className="mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-2.5">
                          Signature Highlights:
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {dest.highlights.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent-secondary flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Popular Cities */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-6">
                        <span className="text-xs font-semibold text-text-primary mr-1">Popular Hubs:</span>
                        {dest.popularCities.map((city) => (
                          <span
                            key={city}
                            className="px-2.5 py-1 rounded-lg bg-surface-50 border border-border text-[11px] font-medium text-text-secondary"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                      <Link
                        href={`/destinations/${dest.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-primary hover:text-accent-primary-hover"
                      >
                        <span>View Destination Guide</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/booking?destination=${encodeURIComponent(dest.title)}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm transition-all"
                      >
                        <span>Plan Trip to {dest.title}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

