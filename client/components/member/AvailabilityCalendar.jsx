'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  CalendarCheck2,
  AlertTriangle,
} from 'lucide-react';
import { fetchAvailabilities } from '../../lib/api';

export default function AvailabilityCalendar({ onSelectPeriod, memberName, memberId }) {
  const router = useRouter();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadAvailabilities();
  }, [memberId]);

  const loadAvailabilities = async () => {
    setLoading(true);
    try {
      const params = memberId ? { memberId } : {};
      const data = await fetchAvailabilities(params);
      setAvailabilities(data);
      if (data.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load trip availability calendar.');
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // First day of current month and total days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Helper to format ISO date string YYYY-MM-DD
  const formatDateString = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Find matching availability for a specific day
  const getAvailabilityForDay = (dayNum) => {
    const dayDate = new Date(year, month, dayNum);
    dayDate.setHours(12, 0, 0, 0);
    const dayStr = formatDateString(dayDate);

    // Look for matching availability period
    return availabilities.filter((item) => {
      const start = new Date(item.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(item.endDate);
      end.setHours(23, 59, 59, 999);
      return dayDate >= start && dayDate <= end;
    });
  };

  const handleDayClick = (matchingList) => {
    if (matchingList && matchingList.length > 0) {
      setSelectedPlan(matchingList[0]);
    }
  };

  const handleBookPlan = (plan) => {
    if (onSelectPeriod) {
      onSelectPeriod(plan);
      return;
    }
    const checkIn = new Date(plan.startDate).toISOString().split('T')[0];
    const checkOut = new Date(plan.endDate).toISOString().split('T')[0];
    const dest = plan.destination || plan.destinationOrPlan || '';
    const query = new URLSearchParams({
      destination: dest,
      package: plan.title,
      checkIn,
      checkOut,
      startDate: checkIn,
      endDate: checkOut,
      ...(memberName ? { memberName } : {}),
    }).toString();

    router.push(`/booking?${query}`);
  };

  return (
    <div className="bg-white rounded-4xl p-6 sm:p-8 border border-border shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-text-primary">
              Available Trip &amp; Plan Calendar
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Database
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            View verified travel periods and available trip dates. Dates highlighted in <strong className="text-emerald-700">Green</strong> are open for reservation requests.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm border border-emerald-600 inline-block" />
            <span className="font-semibold text-emerald-800">Available Date (Green)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300 inline-block" />
            <span className="text-text-secondary">Unavailable / Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200 inline-block" />
            <span className="text-text-muted">Past Date</span>
          </div>
        </div>
      </div>

      {/* Month Navigation Bar */}
      <div className="flex items-center justify-between bg-surface-50 p-3 sm:p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white hover:bg-surface-100 border border-border text-text-primary transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white hover:bg-surface-100 border border-border text-text-primary transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-base sm:text-lg font-extrabold text-text-primary ml-2">
            {monthNames[month]} {year}
          </span>
        </div>

        <button
          onClick={goToToday}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-surface-100 border border-border text-text-secondary transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-[11px] font-bold text-text-muted uppercase tracking-wider py-1">
            {day}
          </div>
        ))}

        {/* Empty padding cells */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[50px] sm:min-h-[64px] rounded-2xl bg-surface-50/40 border border-transparent" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayDate = new Date(year, month, dayNum);
          dayDate.setHours(0, 0, 0, 0);

          const isPast = dayDate < today;
          const isToday = dayDate.getTime() === today.getTime();
          const matches = getAvailabilityForDay(dayNum);

          const hasAvailable = matches.some((m) => m.status === 'Available' || m.isAvailable === true || (m.isAvailable !== false && m.status !== 'Unavailable' && m.status !== 'Booked'));
          const hasUnavailable = !hasAvailable && matches.some((m) => m.status === 'Unavailable' || m.status === 'Booked' || m.isAvailable === false);

          let cellClass = 'bg-surface-50/70 text-text-primary border-border hover:bg-surface-100';

          if (isPast) {
            cellClass = 'bg-slate-50 text-slate-300 border-border/40 cursor-not-allowed opacity-60';
          } else if (hasAvailable) {
            // GREEN TO HIGHLIGHT AVAILABLE DATES
            cellClass = 'bg-emerald-500 text-white font-bold border-emerald-600 shadow-sm ring-2 ring-emerald-300 hover:bg-emerald-600 cursor-pointer transform hover:scale-[1.03] transition-all';
          } else if (hasUnavailable) {
            cellClass = 'bg-amber-50 text-amber-800 border-amber-200 line-through cursor-not-allowed opacity-80';
          }

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => {
                if (!isPast && matches.length > 0) {
                  handleDayClick(matches);
                }
              }}
              className={`min-h-[50px] sm:min-h-[64px] p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between transition-all ${cellClass}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isToday && !hasAvailable ? 'underline decoration-accent-primary decoration-2' : ''}`}>
                  {dayNum}
                </span>
                {isToday && (
                  <span className={`text-[9px] font-bold px-1 rounded ${hasAvailable ? 'bg-white/20 text-white' : 'bg-accent-primary-light text-accent-primary'}`}>
                    Today
                  </span>
                )}
              </div>

              {hasAvailable && (
                <div className="text-left mt-1">
                  <span className="text-[10px] sm:text-[11px] leading-tight block truncate font-medium text-emerald-100">
                    {matches[0].destination || matches[0].destinationOrPlan}
                  </span>
                </div>
              )}

              {hasUnavailable && (
                <div className="text-left mt-1">
                  <span className="text-[9px] leading-tight block truncate text-amber-700">
                    Booked
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Plan Details & Prefill Callout */}
      {selectedPlan && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50/70 via-surface-50 to-emerald-50/50 border border-emerald-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
                  Available for Booking
                </span>
                <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent-primary" />
                  {selectedPlan.destination}
                </span>
                {selectedPlan.planType && (
                  <span className="text-xs font-medium text-text-muted">
                    • {selectedPlan.planType}
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-text-primary">
                {selectedPlan.title}
              </h4>

              <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-0.5">
                <div>
                  Travel Period:{' '}
                  <strong className="text-text-primary">
                    {new Date(selectedPlan.startDate).toLocaleDateString()} &rarr; {new Date(selectedPlan.endDate).toLocaleDateString()}
                  </strong>
                </div>
                {selectedPlan.availableSlots !== undefined && (
                  <div>
                    Slots Remaining:{' '}
                    <strong className="text-emerald-700">
                      {selectedPlan.availableSlots} of {selectedPlan.totalSlots || selectedPlan.availableSlots}
                    </strong>
                  </div>
                )}
              </div>

              {selectedPlan.notes && (
                <p className="text-xs text-text-secondary pt-1 italic">
                  &ldquo;{selectedPlan.notes}&rdquo;
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 lg:self-center shrink-0">
              <button
                onClick={() => handleBookPlan(selectedPlan)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
              >
                <span>Reserve These Dates</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans Roster */}
      <div className="pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
          All Currently Configured Available Travel Periods ({availabilities.filter((a) => a.status === 'Available').length})
        </h4>
        {availabilities.length === 0 ? (
          <p className="text-xs text-text-muted italic">
            No travel periods are currently scheduled. Please contact reservations for bespoke bookings.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availabilities.map((item) => {
              const isSelected = selectedPlan?._id === item._id || selectedPlan?.id === item.id;
              const isAvailable = item.status === 'Available';

              return (
                <div
                  key={item._id || item.id}
                  onClick={() => setSelectedPlan(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200'
                      : 'border-border bg-white hover:bg-surface-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-text-primary line-clamp-1">
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-text-secondary flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-accent-primary shrink-0" />
                    <span>{item.destination}</span>
                  </div>

                  <div className="text-[11px] text-text-muted flex items-center justify-between pt-1 border-t border-border">
                    <span>
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </span>
                    {isAvailable && (
                      <span className="text-emerald-700 font-semibold">Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

