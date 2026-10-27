import Link from 'next/link';
import Image from 'next/image';
import { Plane, Building2, Handshake, Sparkles, Briefcase, Award, ArrowRight } from 'lucide-react';
import { partnersData } from '../../data/partners';

export default function PartnersSection() {
  return (
    <section className="py-16 bg-surface-50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Official Travel Partner Announcement Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <Award className="w-8 h-8 text-amber-100" />
            </div>
            <div>
              <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white mb-1.5">
                Milestone Recognition
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Official Travel Partner for Lulu Events in 2025 (Summer Carnival and Shopathon)
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-2xl leading-relaxed">
                Trusted as the official travel partner managing experiential travel rewards, customer journey packages, and holiday celebrations for Lulu Group events.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 shadow-sm transition-all"
          >
            <span>Partner With Us</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Global Network Section */}
        <div>
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

        {/* Corporate Travel & Commercial Partnerships Pillar (B2B) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light text-accent-primary text-xs font-semibold">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Commercial & Corporate Travel Desk</span>
              </div>
              <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                Corporate Travel, MICE & Commercial Partnerships
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                We empower enterprise clients with turnkey corporate travel logistics, executive retreats, and commercial partnerships with top regional attractions (including Blackout Abu Dhabi and Prison Island), as well as major event sponsorships and corporate tie-ups.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-surface-50 border border-border text-xs text-text-secondary font-medium">
                  🏢 Corporate MICE Logistics
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-50 border border-border text-xs text-text-secondary font-medium">
                  🎟️ Local Attraction Tie-ups (Blackout, Prison Island)
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-50 border border-border text-xs text-text-secondary font-medium">
                  🌟 Event Sponsorships & Tie-ups
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-50 border border-border text-xs text-text-secondary font-medium">
                  ✈️ Group Incentive Travel
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact?subject=Corporate+Travel+and+Partnership"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm transition-all"
              >
                <Briefcase className="w-4 h-4" />
                <span>Inquire B2B Contract</span>
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-text-primary bg-surface-50 hover:bg-surface-100 border border-border transition-all"
              >
                <span>Plan Group Travel</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

