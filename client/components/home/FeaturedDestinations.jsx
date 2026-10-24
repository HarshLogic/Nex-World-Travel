import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass, Sparkles, MapPin } from 'lucide-react';
import { destinationsData } from '../../data/destinations';

export default function FeaturedDestinations() {
  return (
    <section className="py-20 bg-surface-50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>World Horizons</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Dream & Top Destinations
            </h2>
            <p className="text-text-secondary text-base max-w-xl mt-2">
              Explore hand-picked regions curated by Nex World Travel, blending iconic cultural monuments with luxurious modern tranquility.
            </p>
          </div>

          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-primary hover:text-accent-primary-hover group self-start md:self-auto"
          >
            <span>Browse All Destination Guides</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Asymmetrical Grid of Destination Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinationsData.map((dest, idx) => {
            const isLarge = idx === 0 || idx === 3;
            return (
              <div
                key={dest.id}
                className={`group relative bg-white rounded-3xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col ${
                  isLarge ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={dest.thumbnail}
                    alt={`${dest.title} - Nex World Travel`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-text-primary shadow-sm">
                      {dest.region}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-bold tracking-tight">{dest.title}</h3>
                    <p className="text-xs text-white/85 line-clamp-1 mt-0.5">{dest.tagline}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {dest.popularCities.slice(0, 3).map((city) => (
                        <span
                          key={city}
                          className="px-2.5 py-1 rounded-lg bg-surface-50 text-[11px] font-medium text-text-secondary border border-border"
                        >
                          {city}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                      {dest.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-text-muted">Best Time: <strong className="text-text-primary font-medium">{dest.bestTimeToVisit}</strong></span>
                    <Link
                      href={`/destinations/${dest.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-accent-primary hover:text-accent-primary-hover group-hover:underline"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
