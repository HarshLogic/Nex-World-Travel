'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Clock, MapPin, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { activitiesData } from '../../data/activities';

const CATEGORIES = [
  'All',
  'Desert & Safari',
  'Cultural & Heritage',
  'Water Sports & Marine',
  'Adventure & Adrenaline',
  'Theme Parks & Attractions',
];

export default function ActivitiesPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? activitiesData
    : activitiesData.filter((a) => a.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="py-12 md:py-20 bg-surface-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Excursions & Adrenaline</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Curated Activities & Entertainment
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-3">
            Enhance your vacation with hand-selected excursions. From thrilling Arabian desert safaris and iconic Paris dinner cruises to Great Barrier Reef marine dives and world-class Abu Dhabi theme parks.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/20'
                    : 'bg-white text-text-secondary hover:text-text-primary border border-border hover:border-accent-primary/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((activity) => (
            <div
              key={activity.id}
              className="group bg-white rounded-4xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-200">
                <Image
                  src={activity.imageUrl}
                  alt={activity.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-text-primary shadow-sm">
                    {activity.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-accent-secondary-light/95 backdrop-blur-md text-[11px] font-semibold text-accent-secondary border border-accent-secondary/30 shadow-sm">
                    {activity.intensity}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                    <MapPin className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                    <span className="line-clamp-1">{activity.location}</span>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-primary transition-colors mb-2.5">
                    {activity.title}
                  </h3>

                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {activity.description}
                  </p>

                  {/* Highlights */}
                  <div className="mb-4">
                    <ul className="space-y-1.5">
                      {activity.highlights?.slice(0, 3).map((hl) => (
                        <li key={hl} className="flex items-start gap-2 text-xs text-text-secondary">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-secondary flex-shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-accent-primary" />
                    <span>{activity.duration}</span>
                  </div>

                  <Link
                    href={`/booking?activity=${encodeURIComponent(activity.title)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover px-4 py-2 rounded-full shadow-sm transition-all"
                  >
                    <span>Enquire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
