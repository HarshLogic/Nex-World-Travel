import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Compass, Calendar, Clock, MapPin, CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { fetchDestinationBySlug, getDestinationImageUrl } from '../../../lib/api';

export default async function DestinationDetailPage({ params }) {
  const destination = await fetchDestinationBySlug(params.slug);

  if (!destination) {
    notFound();
  }

  return (
    <div className="py-8 md:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link href="/" className="hover:text-text-primary">Home</Link>
          <span>/</span>
          <Link href="/destinations" className="hover:text-text-primary">Destinations</Link>
          <span>/</span>
          <span className="text-accent-primary font-semibold">{destination.title}</span>
        </nav>

        {/* Hero Banner */}
        <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full rounded-4xl overflow-hidden shadow-card border border-border mb-12">
          <Image
            src={getDestinationImageUrl(destination)}
            alt={destination.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 text-white max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              {destination.region}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">
              {destination.title}
            </h1>
            <p className="text-sm sm:text-base text-white/90">
              {destination.tagline}
            </p>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Narrative & Highlights */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                About The Region
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {destination.description}
              </p>
            </div>

            {/* Highlights */}
            <div className="bg-surface-50 rounded-3xl p-6 sm:p-8 border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-primary" />
                <span>Curated Experiences & Sights</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {destination.highlights?.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-border">
                    <CheckCircle2 className="w-4 h-4 text-accent-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-text-secondary">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Cities */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3">
                Key Destinations & Hubs
              </h3>
              <div className="flex flex-wrap gap-2">
                {destination.popularCities?.map((city) => (
                  <span
                    key={city}
                    className="px-4 py-2 rounded-xl bg-surface-50 border border-border text-xs sm:text-sm font-semibold text-text-primary"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Trip Planning Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
              <h3 className="text-xl font-bold text-text-primary">
                Plan Your {destination.title} Tour
              </h3>

              <div className="space-y-3 text-xs text-text-secondary">
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Best Season:</span>
                  <strong className="text-text-primary">{destination.bestTimeToVisit}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Recommended Duration:</span>
                  <strong className="text-text-primary">{destination.idealDuration || '10 - 14 Days'}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span>Itinerary Style:</span>
                  <strong className="text-text-primary">100% Customized</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-accent-primary-light border border-accent-primary/20 text-xs text-accent-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Curated by licensed Abu Dhabi consultants</span>
              </div>

              <Link
                href={`/booking?destination=${encodeURIComponent(destination.title)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md transition-all active:scale-95"
              >
                <span>Request Itinerary Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

