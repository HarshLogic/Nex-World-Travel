import Image from 'next/image';
import { Plane, Building2, Handshake } from 'lucide-react';
import { partnersData } from '../../data/partners';

export default function PartnersSection() {
  return (
    <section className="py-16 bg-surface-50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border text-xs font-semibold text-text-secondary mb-2">
            <Handshake className="w-3.5 h-3.5 text-accent-primary" />
            <span>Trusted Global Network</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
            Aviation & Hospitality Partners
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Collaborating with premier airlines, hotel chains, and leisure groups to guarantee premium comfort at every milestone.
          </p>
        </div>

        {/* Logos Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-subtle">
          <div className="flex flex-wrap items-center justify-around gap-8 sm:gap-12">
            {/* Club Nexa Sister */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary mb-2">
                Sister Network
              </span>
              <div className="relative h-9 w-32 grayscale hover:grayscale-0 transition-all opacity-85 hover:opacity-100">
                <Image
                  src={partnersData.sisterCompany.logo}
                  alt={partnersData.sisterCompany.name}
                  fill
                  sizes="128px"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Airlines */}
            {partnersData.airlines.map((airline) => (
              <div key={airline.name} className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1">
                  <Plane className="w-3 h-3" />
                  Airline
                </span>
                <div className="relative h-8 w-28 grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100">
                  <Image
                    src={airline.logo}
                    alt={airline.name}
                    fill
                    sizes="112px"
                    className="object-contain"
                  />
                </div>
              </div>
            ))}

            {/* Hospitality */}
            {partnersData.hospitality.map((hotel) => (
              <div key={hotel.name} className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Hospitality
                </span>
                <div className="relative h-8 w-28 grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100">
                  <Image
                    src={hotel.logo}
                    alt={hotel.name}
                    fill
                    sizes="112px"
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

