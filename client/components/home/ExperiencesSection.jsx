import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Clock, MapPin, Gauge, ArrowRight } from 'lucide-react';
import { activitiesData } from '../../data/activities';

export default function ExperiencesSection() {
  const featured = activitiesData.slice(0, 4);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Signature Experiences</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Featured Travel Experiences & Adventures
            </h2>
            <p className="text-text-secondary text-base max-w-xl mt-2">
              From adrenaline-charged desert dune safaris in Abu Dhabi to private Paris river cruises and Great Barrier Reef marine exploration.
            </p>
          </div>

          <Link
            href="/activities"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-primary hover:text-accent-primary-hover group self-start md:self-auto"
          >
            <span>View All Experiences</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Experience Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((item) => (
            <div
              key={item.id}
              className="group bg-surface-50 rounded-3xl overflow-hidden border border-border hover:border-accent-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-200">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-text-primary shadow-sm">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent-primary" />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-accent-secondary" />
                    <span>{item.duration}</span>
                  </span>

                  <Link
                    href={`/booking?activity=${encodeURIComponent(item.title)}`}
                    className="font-semibold text-accent-primary hover:text-accent-primary-hover"
                  >
                    Enquire
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

