'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { submitContactMessage } from '../../lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [ticketSuccess, setTicketSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      errs.fullName = 'Full name is required';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid email address is required';
    }
    if (!formData.subject.trim() || formData.subject.length < 3) {
      errs.subject = 'Subject is required (min 3 chars)';
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      errs.message = 'Message must be at least 10 characters long';
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
      const res = await submitContactMessage(formData);
      if (res.success) {
        setTicketSuccess(res.data);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to submit message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-surface-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Travel Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
            Connect With Nex Travel Experts
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-3">
            Whether you’re planning a bespoke global vacation, require corporate travel coordination, or have inquiries regarding our destination packages, we are here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Office Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-6">
              <h2 className="text-xl font-bold text-text-primary">
                Headquarters (Abu Dhabi)
              </h2>

              <div className="space-y-4 text-sm text-text-secondary">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-accent-primary-light text-accent-primary flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-text-primary font-semibold">Address</strong>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      Office 1203, 12th Floor, Bin Hamooda Tower, Khalifa Bin Zayed The First St (St 2), Al Danah Zone 1, Abu Dhabi, United Arab Emirates (U.A.E.)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-accent-secondary-light text-accent-secondary flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-text-primary font-semibold">Direct Telephone</strong>
                    <a href="tel:+97126395908" className="text-xs text-accent-primary hover:underline block mt-0.5">
                      +971 2 639 5908
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-accent-primary-light text-accent-primary flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-text-primary font-semibold">Email Desk</strong>
                    <div className="space-y-1 mt-0.5">
                      <div>
                        <span className="text-[11px] font-bold text-accent-primary uppercase tracking-wider block">Customer Care & Support:</span>
                        <a href="mailto:enquiry@nexworldtravel.com" className="text-xs text-text-secondary hover:text-accent-primary">
                          enquiry@nexworldtravel.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-surface-100 text-text-secondary flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-text-primary font-semibold">Consultation Hours</strong>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Tuesday to Sunday: 11:00 AM – 07:00 PM
                    </p>
                    <p className="text-xs text-rose-600 font-semibold">
                      Monday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Branch Office Card */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-text-primary font-semibold">Headoffice (India)</strong>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      Akshay Complex, 151/152/153, Dholepatil Road, near Ruby Hall, Sangamvadi, Pune, Maharashtra 411001, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-50 border border-border flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-text-secondary">
                  Licensed Tour Operator & Travel Management Company registered in Abu Dhabi, UAE.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-card">
              {ticketSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    Message Sent Successfully
                  </h3>
                  <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                    Thank you, <strong className="text-text-primary">{ticketSuccess.fullName}</strong>. Your enquiry ticket <span className="font-mono text-accent-primary font-semibold">{ticketSuccess.ticketNumber}</span> has been logged. Our travel consultants will respond shortly.
                  </p>
                  <button
                    onClick={() => {
                      setTicketSuccess(null);
                      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <h2 className="text-xl font-bold text-text-primary mb-1">
                    Send Us an Inquiry
                  </h2>
                  <p className="text-xs text-text-secondary mb-4">
                    Fill out the form below and an official travel consultant will contact you.
                  </p>

                  {errors.form && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errors.form}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="e.g. Sarah Jenkins"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                          errors.fullName
                            ? 'border-red-400 bg-red-50/50'
                            : 'border-border bg-surface-50 focus:border-accent-primary'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="sarah@example.com"
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

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+971 50 000 0000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        placeholder="e.g. Custom Paris & Rome Itinerary"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none ${
                          errors.subject
                            ? 'border-red-400 bg-red-50/50'
                            : 'border-border bg-surface-50 focus:border-accent-primary'
                        }`}
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.subject}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Message & Requirements <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Please share details about your trip ideas, dates, questions, or group requirements..."
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-text-primary focus:bg-white focus:outline-none resize-none ${
                        errors.message
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-border bg-surface-50 focus:border-accent-primary'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md shadow-accent-primary/20 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Inquiry Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

