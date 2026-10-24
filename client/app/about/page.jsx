import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Award, HeartHandshake, Compass, ArrowRight, Building, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'About Us | Nex World Travel & Tourism Abu Dhabi',
  description: 'Learn about Nex World Travel & Tourism, our heritage in Abu Dhabi, affiliate network Club Nexa, and our mission to curate modern, tailor-made global journeys.',
};

export default function AboutPage() {
  return (
    <div className="py-12 md:py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent-primary-light border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Our Story</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
            Elevating Global Travel From Abu Dhabi to the World
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            At Nex World Travel & Tourism, we turn your travel aspirations into extraordinary experiences. Founded in Abu Dhabi, we combine local warmth with next-generation travel technology.
          </p>
        </div>

        {/* Narrative & Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Who We Are
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Nex World Travel & Tourism is a team of passionate explorers and certified travel designers based in the United Arab Emirates. Established in Abu Dhabi in 2024, our mission is to leverage modern technology and deep destination knowledge to deliver seamless, safe, and truly enriching vacations.
            </p>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              From family getaways to private honeymoon retreats and corporate expeditions, our consultants handle every logistical nuance with precision. We pride ourselves on listening intently, providing honest guidance, and remaining with our travelers at every step of their journey.
            </p>

            <div className="p-4 rounded-2xl bg-surface-50 border border-border flex items-center gap-3">
              <Award className="w-6 h-6 text-accent-primary flex-shrink-0" />
              <p className="text-xs sm:text-sm text-text-primary font-medium">
                Official Travel Partner for <strong>Lulu Events 2025</strong>, managing premier travel and delegate logistics across the region.
              </p>
            </div>
          </div>

          {/* Sister Company Showcase */}
          <div className="bg-surface-50 rounded-3xl p-8 border border-border shadow-card space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-secondary">
              Strategic Partnership & Heritage
            </span>
            <div className="relative h-12 w-48">
              <Image
                src="/images/club-nexa-logo.png"
                alt="Club Nexa Logo"
                fill
                sizes="192px"
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold text-text-primary">
              Club Nexa — Nexa Holidays & Resorts Pvt. Ltd
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Established in 2015, Club Nexa represents our established sister entity and affiliate vacation network. Together, we blend a decade of hospitality leadership with modern digital travel coordination, offering our clients privileged resort access and bespoke lifestyle privileges worldwide.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Established presence with branch locations across India & UAE</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Direct relationships with premier airlines and luxury resort chains</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Thousands of memorable journeys orchestrated since 2015</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3 Core Values */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Our Guiding Principles
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Everything we build centers on transparency, guest comfort, and authentic global connection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-50 rounded-3xl p-7 border border-border">
              <div className="w-12 h-12 rounded-2xl bg-white text-accent-primary flex items-center justify-center border border-border mb-4 shadow-subtle">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Tailored Itineraries
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                No rigid schedules or crowded bus tours. Every itinerary is built from scratch around your dates, pace, budget, and personal passions.
              </p>
            </div>

            <div className="bg-surface-50 rounded-3xl p-7 border border-border">
              <div className="w-12 h-12 rounded-2xl bg-white text-accent-secondary flex items-center justify-center border border-border mb-4 shadow-subtle">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Human Connection
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                You speak directly to experienced consultants who know the destinations intimately and advocate for you before, during, and after your trip.
              </p>
            </div>

            <div className="bg-surface-50 rounded-3xl p-7 border border-border">
              <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center border border-border mb-4 shadow-subtle">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Safety & Peace of Mind
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Comprehensive visa support, vetted accommodations, licensed local guides, and emergency travel insurance coverage on every journey.
              </p>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="rounded-3xl bg-surface-50 border border-border p-8 sm:p-12 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-3">
            Ready to Plan Your Next Journey?
          </h3>
          <p className="text-sm text-text-secondary max-w-xl mx-auto mb-6">
            Speak with an authorized consultant at our Abu Dhabi office to craft an itinerary that fits your desires.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/booking"
              className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md transition-all"
            >
              Start Custom Trip Planning
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full text-sm font-semibold text-text-primary bg-white hover:bg-surface-100 border border-border transition-all"
            >
              Contact Travel Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

