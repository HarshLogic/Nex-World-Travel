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
    prefix: 'Mr.',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    stateProvince: '',
    nationality: 'United Arab Emirates',
    destinationOrPackage: '',
    travelDate: '',
    returnDate: '',
    adults: 2,
    children: 0,
    activitiesRequired: '',
    budgetRange: 'Flexible',
    notes: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Pre-fill fields if navigated from package, service, or destination
  useEffect(() => {
    const pkg = searchParams.get('package');
    const dest = searchParams.get('destination');
    const service = searchParams.get('service');
    const activity = searchParams.get('activity');

    if (pkg) {
      setFormData((prev) => ({ ...prev, destinationOrPackage: pkg }));
    } else if (dest) {
      setFormData((prev) => ({ ...prev, destinationOrPackage: `${dest} Discovery` }));
    } else if (service) {
      setFormData((prev) => ({ ...prev, destinationOrPackage: service }));
    }

    if (activity) {
      setFormData((prev) => ({
        ...prev,
        activitiesRequired: `Interested in: ${activity}`,
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email address is required';
    if (!formData.phone.trim() || formData.phone.length < 6) errs.phone = 'Valid contact phone number is required';
    if (!formData.streetAddress.trim()) errs.streetAddress = 'Street address is required';
    if (!formData.stateProvince.trim()) errs.stateProvince = 'State/Province is required';
    if (!formData.nationality.trim()) errs.nationality = 'Nationality is required';
    if (!formData.destinationOrPackage.trim()) errs.destinationOrPackage = 'Please specify your destination or package';
    if (!formData.travelDate) errs.travelDate = 'Travel departure date is required';
    if (Number(formData.adults) < 1) errs.adults = 'At least 1 adult traveler is required';
    if (!formData.activitiesRequired.trim()) errs.activitiesRequired = 'Please share your desired activities or preferences';
    if (!formData.consent) errs.consent = 'You must agree to the terms & conditions of Nex World Travel & Tourism';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await submitBookingEnquiry({
        ...formData,
        adults: Number(formData.adults),
        children: Number(formData.children || 0),
      });

      if (response.success) {
        setSubmitSuccess(response.data);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Submission failed. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-border shadow-card text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-accent-primary-light text-accent-primary text-xs font-semibold mb-3">
          Enquiry Registered
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          Your Travel Enquiry is Confirmed!
        </h3>

        <div className="bg-surface-50 rounded-2xl p-4 my-6 border border-border text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary">Enquiry Reference:</span>
            <span className="font-mono font-bold text-accent-primary text-sm">
              {submitSuccess.enquiryNumber}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary">Lead Traveler:</span>
            <span className="font-semibold text-text-primary">{submitSuccess.recipient}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary">Destination / Plan:</span>
            <span className="font-semibold text-text-primary">{submitSuccess.destination}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary">Target Travel Date:</span>
            <span className="font-semibold text-text-primary">{submitSuccess.travelDate}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary">Status:</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold uppercase text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Under Consultant Review
            </span>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mb-8">
          Thank you for choosing Nex World Travel & Tourism. A dedicated itinerary consultant from our Abu Dhabi headquarters will review your preferences and contact you via email or phone within 24 hours with a tailored proposal.
        </p>

        <button
          onClick={() => {
            setSubmitSuccess(null);
            setFormData({
              prefix: 'Mr.',
              firstName: '',
              middleName: '',
              lastName: '',
              email: '',
              phone: '',
              streetAddress: '',
              stateProvince: '',
              nationality: 'United Arab Emirates',
              destinationOrPackage: '',
              travelDate: '',
              returnDate: '',
              adults: 2,
              children: 0,
              activitiesRequired: '',
              budgetRange: 'Flexible',
              notes: '',
              consent: false,
            });
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm transition-all"
        >
          <span>Plan Another Trip</span>
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
      {/* General form error if any */}
      {errors.form && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Section 1: Lead Traveler Information */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <div className="w-7 h-7 rounded-full bg-accent-primary-light text-accent-primary text-xs font-bold flex items-center justify-center">
            1
          </div>
          <h3 className="text-base font-bold text-text-primary">Personal Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          {/* Prefix */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Prefix
            </label>
            <select
              name="prefix"
              value={formData.prefix}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
            >
              {PREFIX_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* First Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="e.g. Alexander"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.firstName
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.firstName && (
              <p className="text-[11px] text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Middle Name */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Middle Name
            </label>
            <input
              type="text"
              name="middleName"
              placeholder="(Optional)"
              value={formData.middleName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
            />
          </div>

          {/* Last Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="e.g. Wright"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.lastName
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.lastName && (
              <p className="text-[11px] text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="alexander@example.com"
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

          {/* Street Address */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="streetAddress"
              placeholder="Building / Villa, Street"
              value={formData.streetAddress}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.streetAddress
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.streetAddress && (
              <p className="text-[11px] text-red-500 mt-1">{errors.streetAddress}</p>
            )}
          </div>

          {/* State/Province */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              State / Province <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="stateProvince"
              placeholder="e.g. Abu Dhabi / Dubai"
              value={formData.stateProvince}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.stateProvince
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.stateProvince && (
              <p className="text-[11px] text-red-500 mt-1">{errors.stateProvince}</p>
            )}
          </div>

          {/* Nationality */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Nationality <span className="text-red-500">*</span>
            </label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
            >
              {POPULAR_NATIONALITIES.map((nat) => (
                <option key={nat} value={nat}>
                  {nat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Journey Preferences */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <div className="w-7 h-7 rounded-full bg-accent-primary-light text-accent-primary text-xs font-bold flex items-center justify-center">
            2
          </div>
          <h3 className="text-base font-bold text-text-primary">Journey Specifications</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          {/* Destination / Package Selection */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Destination or Travel Package <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="destinationOrPackage"
              list="package-suggestions"
              placeholder="Select from packages or type your custom dream destination"
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

          {/* Travel Date */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Departure Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.travelDate
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.travelDate && (
              <p className="text-[11px] text-red-500 mt-1">{errors.travelDate}</p>
            )}
          </div>

          {/* Return Date */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Approximate Return Date (Optional)
            </label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
            />
          </div>

          {/* Adults */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Adults (12+ years) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="adults"
              min="1"
              max="30"
              value={formData.adults}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                errors.adults
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.adults && (
              <p className="text-[11px] text-red-500 mt-1">{errors.adults}</p>
            )}
          </div>

          {/* Children */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Children (2 - 11 years)
            </label>
            <input
              type="number"
              name="children"
              min="0"
              max="20"
              value={formData.children}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
            />
          </div>

          {/* Activities Required */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Activities & Experience Requirements <span className="text-red-500">*</span>
            </label>
            <textarea
              name="activitiesRequired"
              rows={3}
              placeholder="e.g. VIP Desert Safari, Eiffel Tower dinner cruise, Mount Fuji day trip, private luxury airport transfers, vegetarian meal preferences..."
              value={formData.activitiesRequired}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none resize-none ${
                errors.activitiesRequired
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-border bg-surface-50 focus:border-accent-primary'
              }`}
            />
            {errors.activitiesRequired && (
              <p className="text-[11px] text-red-500 mt-1">{errors.activitiesRequired}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Consent and Submit */}
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
            I agree to the terms & conditions of <strong>Nex World Travel & Tourism</strong> and consent to receiving a tailored itinerary consultation from an authorized specialist.
          </span>
        </label>
        {errors.consent && (
          <p className="text-[11px] text-red-500 mt-1.5 pl-7">{errors.consent}</p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Consultant Enquiry • No Upfront Payment Required</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-lg shadow-accent-primary/25 disabled:opacity-50 transition-all duration-200 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Enquiry...</span>
              </>
            ) : (
              <>
                <span>Submit Journey Enquiry</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

