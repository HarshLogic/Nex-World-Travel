'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, Sparkles } from 'lucide-react';

export default function SearchPanel() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [category, setCategory] = useState('All Categories');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.append('region', destination);
    if (category && category !== 'All Categories') params.append('category', category);
    if (travelDate) params.append('date', travelDate);
    if (travelers) params.append('travelers', travelers);

    router.push(`/packages?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_16px_40px_-6px_rgba(16,42,67,0.14),0_2px_8px_rgba(16,42,67,0.04)] border border-border hover:border-brand-teal/40 transition-all duration-300"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Destination Field */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-surface-50 border border-border hover:bg-white hover:border-brand-teal/50 transition-all">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              <MapPin className="w-3.5 h-3.5 text-brand-teal" />
              <span>Destination</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-brand-navy focus:outline-none cursor-pointer"
            >
              <option value="">Any Region</option>
              <option value="Asia">Asia (Tokyo, Bali, Bangkok)</option>
              <option value="Europe">Europe (Paris, Rome, Barcelona)</option>
              <option value="Africa">Africa (Serengeti, Safaris)</option>
              <option value="Australia">Australia (Sydney, Reef)</option>
              <option value="Middle East / UAE">UAE (Abu Dhabi & Dubai)</option>
            </select>
          </div>

          {/* Travel Date */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-surface-50 border border-border hover:bg-white hover:border-brand-teal/50 transition-all">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              <Calendar className="w-3.5 h-3.5 text-brand-teal" />
              <span>Departure Month</span>
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-brand-navy focus:outline-none cursor-pointer"
            />
          </div>

          {/* Travelers */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-surface-50 border border-border hover:bg-white hover:border-brand-teal/50 transition-all">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              <Users className="w-3.5 h-3.5 text-brand-teal" />
              <span>Travelers</span>
            </label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-brand-navy focus:outline-none cursor-pointer"
            >
              <option value="1">1 Solo Traveler</option>
              <option value="2">2 Travelers (Couple / Duo)</option>
              <option value="3">3 - 4 Travelers (Family / Friends)</option>
              <option value="5">5+ Group Journey</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white bg-brand-teal hover:bg-brand-teal-dark shadow-sm transition-all duration-200 active:scale-95 group"
            >
              <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Search Journeys</span>
            </button>
          </div>
        </div>

        {/* Quick filter pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3.5 mt-3.5 border-t border-border/70 text-xs text-text-secondary">
          <span className="font-bold text-brand-navy flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            Popular:
          </span>
          {['Europe Elegance', 'Bali & Tokyo', 'UAE Desert VIP', 'Cruise Voyages'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (tag.includes('Europe')) setDestination('Europe');
                else if (tag.includes('Tokyo')) setDestination('Asia');
                else if (tag.includes('UAE')) setDestination('Middle East / UAE');
                else router.push('/packages');
              }}
              className="px-3 py-1 rounded-full bg-surface-50 hover:bg-brand-teal-light hover:text-brand-teal border border-border text-text-secondary font-medium transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
