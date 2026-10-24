import Link from 'next/link';
import Image from 'next/image';
import { Ship, Palette, Compass, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { servicesData } from '../../data/services';

const SERVICE_ICONS = {
  'cruise-service': Ship,
  'custom-holidays': Palette,
  'activities-entertainment': Compass,
  'travel-insurance-visa': ShieldCheck,
};

export default function ServicesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-secondary-light border border-accent-secondary/20 text-xs font-semibold text-accent-secondary mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dedicated Excellence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Our Travel Services
          </h2>
          <p className="text-text-secondary text-base mt-3 leading-relaxed">
            From bespoke international tours and ocean cruises to theme park ticketing and visa facilitation, we orchestrate seamless journeys backed by professional expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesData.map((service) => {
            const Icon = SERVICE_ICONS[service.id] || Compass;
            return (
              <div
                key={service.id}
                className="group bg-white rounded-3xl border border-border hover:border-accent-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Service Image with original photography */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-100">
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  <div className="absolute top-3.5 right-3.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm text-accent-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent-secondary">
                      {service.category}
                    </span>
                    <h3 className="text-lg font-bold text-text-primary mt-1 mb-2 group-hover:text-accent-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed mb-4">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-xs text-text-secondary">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-secondary flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/booking?service=${encodeURIComponent(service.title)}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-accent-primary bg-accent-primary-light hover:bg-accent-primary hover:text-white transition-all duration-200"
                  >
                    <span>{service.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
