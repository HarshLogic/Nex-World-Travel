'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { submitBookingEnquiry } from '../../lib/api';

const PREFIX_OPTIONS = ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Miss', 'Dr.', 'Prof.'];

const POPULAR_NATIONALITIES = [
  'United Arab Emirates',
  'India',
  'United Kingdom',
  'United States of America (USA)',
  'Australia',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Kuwait',
  'Singapore',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Canada',
  'Japan',
  'China',
  'South Africa',
  'Other / Global Citizen',
];

const PACKAGES_OPTIONS = [
  'European Elegance & Grand Capitals (12 Days)',
  'Asian Wonders: Tokyo, Bali & Singapore (14 Days)',
  'Australian Coastal & Coral Expedition (10 Days)',
  'Emirates Grand Horizon & Desert Sanctuary (7 Days)',
  'Custom Bespoke Itinerary (Any Region)',
  'Luxury Cruise Voyage',
];

export default function BookingForm() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    memberName: '',
    spouseName: '',
    kidsAges: '',
    checkInDate: '',
    checkOutDate: '',
    destinationOrPackage: '',
    guestsCount: 2,
    // Contact & Details
    email: '',
    phone: '',
    prefix: 'Mr.',
    firstName: '',
    lastName: '',
    streetAddress: 'Abu Dhabi',
    stateProvince: 'Abu Dhabi',
    nationality: 'United Arab Emirates',
    travelDate: '',
    returnDate: '',
    adults: 2,
    children: 0,
    activitiesRequired: 'Holiday Reservation Booking',
    notes: '',
    consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Pre-fill fields if navigated from package, destination, or member calendar
  useEffect(() => {
    const pkg = searchParams.get('package');
    const dest = searchParams.get('destination');
    const service = searchParams.get('service');
    const checkIn = searchParams.get('checkIn') || searchParams.get('startDate');
    const checkOut = searchParams.get('checkOut') || searchParams.get('endDate');
    const memberNameParam = searchParams.get('memberName');

    setFormData((prev) => ({
      ...prev,
      destinationOrPackage: pkg || (dest ? `${dest} Discovery` : service || prev.destinationOrPackage),
      checkInDate: checkIn || prev.checkInDate,
      travelDate: checkIn || prev.travelDate,
      checkOutDate: checkOut || prev.checkOutDate,
      returnDate: checkOut || prev.returnDate,
      memberName: memberNameParam || prev.memberName,
    }));
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Keep checkInDate and travelDate synced
      if (name === 'checkInDate') updated.travelDate = value;
      if (name === 'checkOutDate') updated.returnDate = value;

      // Sync memberName with firstName/lastName
      if (name === 'memberName') {
        const parts = value.trim().split(/\s+/);
        updated.firstName = parts[0] || '';
        updated.lastName = parts.slice(1).join(' ') || 'Member';
      }

      // Sync guestsCount with adults
      if (name === 'guestsCount') {
        updated.adults = Number(value) > 0 ? Number(value) : 1;
      }

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.memberName.trim() && !formData.firstName.trim()) {
      errs.memberName = 'Member Name is required';
    }
    if (!formData.checkInDate && !formData.travelDate) {
      errs.checkInDate = 'Check-in date is required';
    }
    if (!formData.checkOutDate && !formData.returnDate) {
      errs.checkOutDate = 'Check-out date is required';
    }

    const checkIn = new Date(formData.checkInDate || formData.travelDate);
    const checkOut = new Date(formData.checkOutDate || formData.returnDate);
    if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
      if (checkOut <= checkIn) {
        errs.checkOutDate = 'Check-out date must be after check-in date';
      }
    }

    if (!formData.destinationOrPackage.trim()) {
      errs.destinationOrPackage = 'Destination / Location is required';
    }
    if (!formData.guestsCount || Number(formData.guestsCount) < 1) {
      errs.guestsCount = 'Number of guests (PAX) must be at least 1';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid email address is required for booking correspondence';
    }
    if (!formData.phone.trim() || formData.phone.length < 6) {
      errs.phone = 'Valid contact number is required';
    }
    if (!formData.consent) {
      errs.consent = 'You must acknowledge the booking policy';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        ...formData,
        memberName: formData.memberName || `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName || formData.memberName.split(/\s+/)[0] || 'Member',
        lastName: formData.lastName || formData.memberName.split(/\s+/).slice(1).join(' ') || 'Traveler',
        checkInDate: formData.checkInDate || formData.travelDate,
        checkOutDate: formData.checkOutDate || formData.returnDate,
        travelDate: formData.checkInDate || formData.travelDate,
        returnDate: formData.checkOutDate || formData.returnDate,
        guestsCount: Number(formData.guestsCount || formData.adults || 1),
        adults: Number(formData.guestsCount || formData.adults || 1),
        children: Number(formData.children || 0),
      };

      const response = await submitBookingEnquiry(payload);

      if (response.success) {
        setSubmitSuccess({
          ...response.data,
          closingMessage:
            response.closingMessage ||
            'Once your request is received, our Reservations Team will check availability and assist you accordingly.',
        });
      }
    } catch (err) {
      setErrors({ form: err.message || 'Submission failed. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-border shadow-card text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-accent-primary-light text-accent-primary text-xs font-semibold">
          Request Registered
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Booking Request Saved Successfully
        </h3>

        <div className="bg-surface-50 rounded-2xl p-5 border border-border text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-text-secondary font-semibold">Reference Number:</span>
            <span className="font-mono font-bold text-accent-primary text-sm">
              {submitSuccess.referenceNumber || submitSuccess.enquiryNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Member Name:</span>
            <span className="font-bold text-text-primary">{submitSuccess.recipient}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Destination / Location:</span>
            <span className="font-semibold text-text-primary">{submitSuccess.destination}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Check-in / Check-out:</span>
            <span className="font-semibold text-emerald-700">
              {submitSuccess.checkInDate || submitSuccess.travelDate} &rarr; {submitSuccess.checkOutDate || 'Confirmed by desk'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Guests (PAX):</span>
            <span className="font-semibold text-text-primary">{submitSuccess.guestsCount || 1} PAX</span>
          </div>
        </div>

        {/* Closing Standard Message */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold leading-relaxed">
          &ldquo;Once your request is received, our Reservations Team will check availability and assist you accordingly.&rdquo;
        </div>

        <button
          onClick={() => {
            setSubmitSuccess(null);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm transition-all"
        >
          <span>Submit Another Booking Request</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-card max-w-4xl mx-auto space-y-8"
    >
      {/* Standard Booking Request Format Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 sm:p-6 text-text-primary">
        <p className="text-sm font-semibold text-amber-900 mb-2">
          To ensure a smooth and timely booking process, kindly submit your request in the below standard format:
        </p>
        <div className="bg-white/80 rounded-xl p-3.5 border border-amber-200/50">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
            Booking Request Format
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-text-secondary list-disc list-inside">
            <li>Member Name</li>
            <li>Spouse Name</li>
            <li>Kids &amp; Ages</li>
            <li>Check-in Date</li>
            <li>Check-out Date</li>
            <li>Destination/Location</li>
            <li>Number of Guests (PAX)</li>
          </ul>
        </div>
      </div>

      {/* General form error if any */}
      {errors.form && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Section 1: Standard Booking Details */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <div className="w-7 h-7 rounded-full bg-accent-primary-light text-accent-primary text-xs font-bold flex items-center justify-center">
            1
          </div>
          <h3 className="text-base font-bold text-text-primary">Standard Booking Request Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          {/* Member Name */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Member Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="memberName"
              placeholder="e.g. Johnathan Davis"
              value={formData.memberName}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.memberName
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.memberName && (
              <p className="text-[11px] text-red-500 mt-1">{errors.memberName}</p>
            )}
          </div>

          {/* Spouse Name */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Spouse Name <span className="text-text-muted font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="spouseName"
              placeholder="e.g. Eleanor Davis"
              value={formData.spouseName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
            />
          </div>

          {/* Kids & Ages */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Kids &amp; Ages <span className="text-text-muted font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="kidsAges"
              placeholder="e.g. 2 kids (ages 5 and 9) or None"
              value={formData.kidsAges}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
            />
          </div>

          {/* Destination / Location */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Destination / Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="destinationOrPackage"
              list="package-suggestions"
              placeholder="e.g. Switzerland, Maldives, Paris, Dubai"
              value={formData.destinationOrPackage}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.destinationOrPackage
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            <datalist id="package-suggestions">
              {PACKAGES_OPTIONS.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
            {errors.destinationOrPackage && (
              <p className="text-[11px] text-red-500 mt-1">{errors.destinationOrPackage}</p>
            )}
          </div>

          {/* Check-in Date */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Check-in Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="checkInDate"
              value={formData.checkInDate}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.checkInDate
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.checkInDate && (
              <p className="text-[11px] text-red-500 mt-1">{errors.checkInDate}</p>
            )}
          </div>

          {/* Check-out Date */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Check-out Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="checkOutDate"
              value={formData.checkOutDate}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.checkOutDate
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.checkOutDate && (
              <p className="text-[11px] text-red-500 mt-1">{errors.checkOutDate}</p>
            )}
          </div>

          {/* Number of Guests (PAX) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Number of Guests (PAX) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="guestsCount"
              min="1"
              max="50"
              placeholder="e.g. 2"
              value={formData.guestsCount}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.guestsCount
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.guestsCount && (
              <p className="text-[11px] text-red-500 mt-1">{errors.guestsCount}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Contact & Travel Preferences */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <div className="w-7 h-7 rounded-full bg-accent-primary-light text-accent-primary text-xs font-bold flex items-center justify-center">
            2
          </div>
          <h3 className="text-base font-bold text-text-primary">Contact &amp; Additional Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          {/* Email */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="member@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.email
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Mobile Number (with country code) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="+971 50 123 4567"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.phone
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Special Requests */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Special Requests or Room Preferences <span className="text-text-muted font-normal">(Optional)</span>
            </label>
            <textarea
              name="activitiesRequired"
              rows={2}
              placeholder="e.g. King bed, non-smoking, airport pickup, dietary preferences, early check-in request..."
              value={formData.activitiesRequired}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Mandatory Closing Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold leading-relaxed">
        &ldquo;Once your request is received, our Reservations Team will check availability and assist you accordingly.&rdquo;
      </div>

      {/* Consent and Submit */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            className="w-4 h-4 mt-0.5 rounded text-accent-primary border-border focus:ring-accent-primary"
          />
          <span className="text-xs text-text-secondary leading-relaxed">
            I confirm the booking details provided above and understand that availability will be verified by the Reservations Team before booking confirmation.
          </span>
        </label>
        {errors.consent && (
          <p className="text-[11px] text-red-500 mt-1.5 pl-7">{errors.consent}</p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Assistance Request • Handled by reservation@nexworldtravel.com</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-lg shadow-accent-primary/25 disabled:opacity-50 transition-all duration-200 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <span>Submit Booking Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

