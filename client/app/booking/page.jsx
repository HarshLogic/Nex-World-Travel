import { Suspense } from 'react';
import { Calendar, ShieldCheck, Clock, Sparkles, MapPin } from 'lucide-react';
import BookingForm from '../../components/booking/BookingForm';

export const metadata = {
  title: 'Plan Your Journey | Nex World Travel & Tourism',
  description: 'Submit your bespoke travel enquiry to our Abu Dhabi consultants. Tailored holiday planning across Asia, Europe, Africa, Australia, and the Middle East.',
};

export default function BookingPage() {
  return (
    <div className="py-12 md:py-20 bg-surface-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Itinerary Concierge</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Plan Your Journey With Us
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-3">
            Please share your travel specifications and preferences below. An authorized specialist from our Abu Dhabi headquarters will review your requirements and design a personalized holiday plan.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Direct Travel Agency Consultation
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-accent-primary" />
              Response within 24 Hours
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-accent-secondary" />
              Office 1203, Bin Hamooda Tower, Abu Dhabi
            </span>
          </div>
        </div>

        {/* Form wrapped in Suspense for search params */}
        <Suspense fallback={<div className="text-center py-12 text-sm text-text-secondary">Loading booking interface...</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
