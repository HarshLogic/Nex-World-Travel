'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, Sparkles, Filter } from 'lucide-react';

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
        className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-border/80 hover:border-accent-primary/40 transition-all duration-300"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Destination Field */}
          <div className="p-3 rounded-2xl bg-surface-50 border border-border/60 hover:bg-white hover:border-accent-primary/50 transition-all">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              <MapPin className="w-3.5 h-3.5 text-accent-primary" />
              <span>Destination</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-text-primary focus:outline-none cursor-pointer"
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
          <div className="p-3 rounded-2xl bg-surface-50 border border-border/60 hover:bg-white hover:border-accent-primary/50 transition-all">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              <Calendar className="w-3.5 h-3.5 text-accent-primary" />
              <span>Departure Month</span>
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-text-primary focus:outline-none cursor-pointer"
            />
          </div>

          {/* Travelers */}
          <div className="p-3 rounded-2xl bg-surface-50 border border-border/60 hover:bg-white hover:border-accent-primary/50 transition-all">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              <Users className="w-3.5 h-3.5 text-accent-primary" />
              <span>Travelers</span>
            </label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-text-primary focus:outline-none cursor-pointer"
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
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md shadow-accent-primary/20 transition-all duration-200 active:scale-95 group"
            >
              <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Search Journeys</span>
            </button>
          </div>
        </div>

        {/* Quick filter pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-border/50 text-xs text-text-secondary">
          <span className="font-semibold text-text-primary flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
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
              className="px-3 py-1 rounded-full bg-surface-50 hover:bg-accent-primary-light hover:text-accent-primary border border-border transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
