'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserCheck,
  CreditCard,
  Calendar,
  Moon,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  LogOut,
  AlertCircle,
  FileText,
  DollarSign,
  PlusCircle,
  Loader2,
  BadgeAlert,
  HelpCircle,
} from 'lucide-react';
import {
  fetchMemberProfile,
  acknowledgeMemberTerms,
  submitMemberRequest,
  fetchMyMemberRequests,
  submitBookingEnquiry,
} from '../../../lib/api';
import { getAuthUser, clearAuth } from '../../../lib/auth';
import AvailabilityCalendar from '../../../components/member/AvailabilityCalendar';

const REQUEST_TYPES = [
  'Booking Assistance',
  'Benefits & Available Nights',
  'Plan Upgrade / Change',
  'Payment & EMI Question',
  'Personal Information Update',
  'Membership & Plan Inquiry',
  'Other Support Enquiry',
];

const TIER_CONFIG = {
  Titanium: {
    icon: '💎',
    badge: 'bg-slate-900 text-slate-100 border border-slate-700',
    headerBadge: 'bg-slate-900 text-slate-100 border border-slate-700',
    card: 'bg-gradient-to-br from-slate-900/5 via-white to-slate-800/10 border-slate-300',
    textColor: 'text-slate-900',
  },
  'Platinum+': {
    icon: '✨',
    badge: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
    headerBadge: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    card: 'bg-gradient-to-br from-indigo-50/70 via-white to-indigo-100/40 border-indigo-200',
    textColor: 'text-indigo-900',
  },
  Platinum: {
    icon: '⭐',
    badge: 'bg-slate-200 text-slate-800 border border-slate-300',
    headerBadge: 'bg-slate-200 text-slate-800 border border-slate-300',
    card: 'bg-gradient-to-br from-slate-100/60 via-white to-slate-200/40 border-slate-200',
    textColor: 'text-slate-800',
  },
  'Gold Plus': {
    icon: '👑',
    badge: 'bg-amber-200 text-amber-900 border border-amber-400',
    headerBadge: 'bg-amber-200 text-amber-900 border border-amber-400',
    card: 'bg-gradient-to-br from-amber-100/60 via-white to-amber-200/40 border-amber-300',
    textColor: 'text-amber-900',
  },
  Gold: {
    icon: '👑',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300',
    headerBadge: 'bg-amber-100 text-amber-800 border border-amber-300',
    card: 'bg-gradient-to-br from-amber-50/70 via-white to-amber-100/40 border-amber-200',
    textColor: 'text-amber-800',
  },
  'Silver Plus': {
    icon: '🎖️',
    badge: 'bg-zinc-200 text-zinc-800 border border-zinc-300',
    headerBadge: 'bg-zinc-200 text-zinc-800 border border-zinc-300',
    card: 'bg-gradient-to-br from-zinc-100/60 via-white to-zinc-200/40 border-zinc-200',
    textColor: 'text-zinc-800',
  },
  Silver: {
    icon: '🥈',
    badge: 'bg-slate-100 text-slate-700 border border-slate-200',
    headerBadge: 'bg-slate-100 text-slate-700 border border-slate-200',
    card: 'bg-white border-border',
    textColor: 'text-slate-700',
  },
};

export default function MemberDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Terms state
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsSubmitting, setTermsSubmitting] = useState(false);

  // Support request form modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('Booking Assistance');
  const [requestSubject, setRequestSubject] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState('');
  const [formValidationErr, setFormValidationErr] = useState('');

  // Standard Booking Request Format fields
  const [bookingFields, setBookingFields] = useState({
    memberName: '',
    spouseName: '',
    kidsAges: '',
    checkInDate: '',
    checkOutDate: '',
    destination: '',
    guestsCount: 2,
  });

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchMemberProfile();
      setData(result);
      setTermsAgreed(result.member.termsAccepted);
      if (result.member?.registeredName) {
        setBookingFields((prev) => ({
          ...prev,
          memberName: result.member.registeredName,
        }));
      }
      const reqList = await fetchMyMemberRequests();
      setRequests(reqList);
    } catch (err) {
      setError(err.message || 'Please log in to access your member dashboard.');
      router.push('/member/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const handleTermsSubmit = async () => {
    setTermsSubmitting(true);
    try {
      await acknowledgeMemberTerms();
      setTermsAgreed(true);
      await loadMemberData();
    } catch (err) {
      alert(err.message || 'Failed to acknowledge terms.');
    } finally {
      setTermsSubmitting(false);
    }
  };

  const handleCalendarSelectPeriod = (plan) => {
    const checkIn = new Date(plan.startDate).toISOString().split('T')[0];
    const checkOut = new Date(plan.endDate).toISOString().split('T')[0];
    setRequestType('Booking Assistance');
    setRequestSubject(`Booking Request: ${plan.title} (${plan.destination})`);
    setBookingFields({
      memberName: data?.member?.registeredName || '',
      spouseName: '',
      kidsAges: '',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      destination: plan.destination,
      guestsCount: 2,
    });
    setRequestMessage(`Booking request for ${plan.title} in ${plan.destination}. Configured available dates: ${checkIn} to ${checkOut}.`);
    setFormValidationErr('');
    setShowRequestModal(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setFormValidationErr('');

    if (requestType === 'Booking Assistance') {
      if (!bookingFields.memberName.trim()) {
        setFormValidationErr('Member Name is mandatory.');
        return;
      }
      if (!bookingFields.destination.trim()) {
        setFormValidationErr('Destination / Location is mandatory.');
        return;
      }
      if (!bookingFields.checkInDate || !bookingFields.checkOutDate) {
        setFormValidationErr('Both Check-in and Check-out dates are required.');
        return;
      }
      const cIn = new Date(bookingFields.checkInDate);
      const cOut = new Date(bookingFields.checkOutDate);
      if (cOut <= cIn) {
        setFormValidationErr('Check-out date must be strictly after Check-in date.');
        return;
      }
      if (!bookingFields.guestsCount || Number(bookingFields.guestsCount) < 1) {
        setFormValidationErr('Number of guests (PAX) must be a positive number.');
        return;
      }

      setRequestSubmitting(true);
      setRequestSuccessMsg('');

      try {
        const payload = {
          memberName: bookingFields.memberName.trim(),
          spouseName: bookingFields.spouseName?.trim() || '',
          kidsAges: bookingFields.kidsAges?.trim() || '',
          checkInDate: bookingFields.checkInDate,
          checkOutDate: bookingFields.checkOutDate,
          destination: bookingFields.destination.trim(),
          destinationOrPackage: bookingFields.destination.trim(),
          guestsCount: Number(bookingFields.guestsCount),
          email: data?.member?.email || 'member@nexworldtravel.com',
          phone: data?.member?.phone || '+97126395908',
          activitiesRequired: requestMessage || 'Member holiday booking request',
          notes: requestMessage,
        };

        const res = await submitBookingEnquiry(payload);

        // Also record under member requests for dashboard tracking
        await submitMemberRequest({
          requestType: 'Booking Assistance',
          subject: `Booking Request: ${bookingFields.destination} (Ref: ${res.data?.referenceNumber || res.data?.enquiryNumber || 'NWT'})`,
          message: `Standard Booking Request:\n- Member Name: ${bookingFields.memberName}\n- Spouse Name: ${bookingFields.spouseName || 'N/A'}\n- Kids & Ages: ${bookingFields.kidsAges || 'None'}\n- Check-in Date: ${bookingFields.checkInDate}\n- Check-out Date: ${bookingFields.checkOutDate}\n- Destination: ${bookingFields.destination}\n- Guests (PAX): ${bookingFields.guestsCount}\n\nAdditional Notes: ${requestMessage || 'Standard Request'}`,
        });

        setRequestSuccessMsg(
          res.closingMessage ||
            'Once your request is received, our Reservations Team will check availability and assist you accordingly.'
        );

        const updatedReqs = await fetchMyMemberRequests();
        setRequests(updatedReqs);
        setTimeout(() => {
          setShowRequestModal(false);
          setRequestSuccessMsg('');
        }, 5000);
      } catch (err) {
        setFormValidationErr(err.message || 'Failed to submit booking request.');
      } finally {
        setRequestSubmitting(false);
      }
      return;
    }

    if (!requestSubject.trim() || !requestMessage.trim()) return;
    setRequestSubmitting(true);
    setRequestSuccessMsg('');
    try {
      const res = await submitMemberRequest({
        requestType,
        subject: requestSubject,
        message: requestMessage,
      });
      setRequestSuccessMsg(res.message);
      setRequestSubject('');
      setRequestMessage('');
      const updatedReqs = await fetchMyMemberRequests();
      setRequests(updatedReqs);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccessMsg('');
      }, 3500);
    } catch (err) {
      alert(err.message || 'Failed to submit request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary mb-3" />
        <p className="text-sm font-semibold text-text-secondary">Loading your membership portfolio...</p>
      </div>
    );
  }

  if (!data?.member) {
    return null;
  }

  const { member, payments = [], terms } = data;
  const currentTierStyle = TIER_CONFIG[member.packageType] || {
    icon: '⭐',
    badge: 'bg-slate-100 text-slate-800 border border-slate-300',
    headerBadge: 'bg-slate-100 text-slate-800 border border-slate-300',
    card: 'bg-white border-border',
    textColor: 'text-text-primary',
  };

  return (
    <div className="py-8 md:py-14 bg-surface-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Member Header */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-border shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-sm shrink-0 ${currentTierStyle.badge}`}>
              {currentTierStyle.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent-primary-light text-accent-primary shrink-0">
                  {member.memberId}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                  member.membershipStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {member.membershipStatus} Membership
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${currentTierStyle.badge}`}>
                  Tier: {member.packageType}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-text-primary break-words">
                {member.registeredName}
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Member since {new Date(member.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto">
            <button
              onClick={() => {
                setRequestType('Booking Assistance');
                setFormValidationErr('');
                setShowRequestModal(true);
              }}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Booking / Support Request</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-text-secondary bg-surface-50 hover:bg-red-50 hover:text-red-700 border border-border transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* SECTION A: Membership Overview Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Package Type Card */}
          <div className={`rounded-3xl p-6 border shadow-card transition-all ${currentTierStyle.card}`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Package Type
            </span>
            <div className="flex items-center justify-between mt-2">
              <h3 className={`text-2xl font-black ${currentTierStyle.textColor}`}>
                {member.packageType} Tier
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${currentTierStyle.badge}`}>
                {currentTierStyle.icon} {member.packageType}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-3">
              Tenure Period: <strong className="text-text-primary">{member.tenurePeriod}</strong>
            </p>
          </div>

          {/* Available Nights Card */}
          <div className="bg-white rounded-3xl p-6 border border-border shadow-card">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Available Nights
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-accent-primary">
                {member.availableNights}
              </span>
              <span className="text-xs text-text-secondary font-medium">Nights Remaining</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-3">
              <Moon className="w-3.5 h-3.5 text-accent-secondary" />
              <span>Ready for holiday booking redemption</span>
            </div>
          </div>

          {/* Travel Card Benefit Indicator (Section 4.B) */}
          <div className="bg-white rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Travel Card Privilege
              </span>
              <div className="mt-2.5">
                {member.travelCardBenefit ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-sm shadow-subtle">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Travel Card: YES (Active)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 font-bold text-sm shadow-subtle">
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <span>Travel Card: NO (Standard)</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-text-secondary mt-3 leading-tight">
              {member.travelCardBenefit
                ? 'VIP lounges, priority check-in, and exclusive resort discount privileges enabled.'
                : 'Standard membership entitlement. Inquire with support to upgrade.'}
            </p>
          </div>

          {/* Product Price & Purchase Date */}
          <div className="bg-white rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Product Value
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-text-primary mt-2">
                AED {Number(member.productPrice).toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Enrolled: {new Date(member.purchaseDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Extra Offers Callout */}
        {member.extraOffers && (
          <div className="p-4 sm:p-5 rounded-3xl bg-accent-primary-light/60 border border-accent-primary/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-accent-primary uppercase tracking-wider">
                Special Extra Member Benefit
              </strong>
              <p className="text-xs sm:text-sm text-text-primary font-medium mt-0.5">
                {member.extraOffers}
              </p>
            </div>
          </div>
        )}

        {/* SECTION B: Available Trip & Plan Calendar */}
        <AvailabilityCalendar
          memberName={member.registeredName}
          memberId={member.memberId}
          onSelectPeriod={handleCalendarSelectPeriod}
        />

        {/* SECTION C: Amount and Payment Section */}
        <div className="bg-white rounded-4xl p-6 sm:p-8 border border-border shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Payment Summary & Financial Standing
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Transparent accounting of your membership product price, settled amounts, and EMI schedule.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
              member.paymentStatus === 'Fully Paid'
                ? 'bg-emerald-100 text-emerald-800'
                : member.paymentStatus === 'Overdue'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-accent-primary-light text-accent-primary'
            }`}>
              Status: {member.paymentStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="p-4 rounded-2xl bg-surface-50 border border-border">
              <span className="text-xs text-text-secondary font-medium">Total Product Price</span>
              <div className="text-xl sm:text-2xl font-bold text-text-primary mt-1">
                AED {Number(member.productPrice).toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-border">
              <span className="text-xs text-text-secondary font-medium">Total Amount Paid</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
                AED {Number(member.totalAmountPaid).toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-border">
              <span className="text-xs text-text-secondary font-medium">Outstanding Balance</span>
              <div className="text-xl sm:text-2xl font-bold text-text-primary mt-1">
                AED {Number(member.outstandingBalance).toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-border">
              <span className="text-xs text-text-secondary font-medium">Current Payable / Due</span>
              <div className={`text-xl sm:text-2xl font-bold mt-1 ${
                member.dueAmount > 0 ? 'text-amber-600' : 'text-text-primary'
              }`}>
                AED {Number(member.dueAmount || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* EMI Schedule if applicable */}
          {member.hasEMI && (
            <div className="p-5 rounded-2xl bg-surface-50 border border-border mb-8 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-accent-primary" />
                <span>Structured EMI Facility Details</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                <div>
                  <span className="text-text-secondary">Monthly Installment:</span>
                  <strong className="block text-text-primary text-sm font-bold">AED {member.emiAmount} / month</strong>
                </div>
                <div>
                  <span className="text-text-secondary">Tenure / Progress:</span>
                  <strong className="block text-text-primary text-sm font-bold">{member.emiPaidMonths} of {member.emiTenureMonths} installments completed</strong>
                </div>
                <div>
                  <span className="text-text-secondary">Next Installment Due Date:</span>
                  <strong className="block text-text-primary text-sm font-bold">
                    {member.nextEMIDueDate ? new Date(member.nextEMIDueDate).toLocaleDateString() : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Payment Transactions Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
              Payment & Settlement History ({payments.length})
            </h4>
            {payments.length === 0 ? (
              <p className="text-xs text-text-muted italic">No payment transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[550px] text-left text-xs border border-border rounded-2xl overflow-hidden">
                  <thead className="bg-surface-50 text-text-secondary font-semibold">
                    <tr>
                      <th className="p-3">Transaction ID</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => (
                      <tr key={p.transactionId} className="hover:bg-surface-50/50">
                        <td className="p-3 font-mono font-bold text-accent-primary">{p.transactionId}</td>
                        <td className="p-3 text-text-secondary">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="p-3 capitalize">{p.paymentType.replace('_', ' ')}</td>
                        <td className="p-3 text-text-secondary">{p.paymentMethod}</td>
                        <td className="p-3 text-text-muted">{p.referenceNumber || '—'}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          AED {Number(p.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SECTION D: Terms & Conditions Alert (Section 4.E) */}
        <div className="bg-white rounded-4xl p-6 sm:p-8 border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-bold text-text-primary">
              Membership Terms & Conditions Policy
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-text-muted">
              {terms?.version || 'v1.0-2026'}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto p-4 rounded-2xl bg-surface-50 border border-border text-xs text-text-secondary leading-relaxed space-y-2 whitespace-pre-line">
            {terms?.content}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={handleTermsSubmit}
                disabled={termsSubmitting}
                className="w-4 h-4 mt-0.5 rounded text-accent-primary border-border focus:ring-accent-primary"
              />
              <span className="text-xs text-text-primary font-medium">
                I have read, understood, and agreed to the official terms & conditions of Nex World Travel & Tourism.
              </span>
            </label>

            {member.termsAccepted && (
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Acknowledged on {new Date(member.termsAcceptedAt || member.purchaseDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* SECTION E: Member Requests and Notifications (Section 4.F) */}
        <div className="bg-white rounded-4xl p-6 sm:p-8 border border-border shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                My Service & Itinerary Requests
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Track status updates on booking redemptions, plan updates, or support inquiries.
              </p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 bg-surface-50 rounded-2xl border border-dashed border-border">
              <HelpCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-medium">You have not submitted any member requests yet.</p>
              <p className="text-[11px] text-text-muted mt-1">Need help planning a vacation or checking your night usage? Submit a request above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.requestReference}
                  className="p-4 rounded-2xl border border-border bg-surface-50/50 hover:bg-surface-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent-primary">{req.requestReference}</span>
                      <span className="text-[11px] font-semibold text-text-muted">• {req.requestType}</span>
                    </div>
                    <h4 className="text-sm font-bold text-text-primary">{req.subject}</h4>
                    <p className="text-xs text-text-secondary line-clamp-1">{req.message}</p>
                    {req.internalNotes?.length > 0 && (
                      <p className="text-[11px] text-accent-primary font-medium">
                        Staff Update: {req.internalNotes[req.internalNotes.length - 1].note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      req.status === 'Resolved' || req.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'Under Review'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Support / Booking Request Submission Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-border shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-text-primary mb-1">
              {requestType === 'Booking Assistance' ? 'Standard Booking Request' : 'Submit Membership Request'}
            </h3>
            <p className="text-xs text-text-secondary mb-5">
              {requestType === 'Booking Assistance'
                ? 'Submit your itinerary request to our Reservations Team.'
                : 'Our travel concierge will review your inquiry and follow up promptly.'}
            </p>

            {requestSuccessMsg ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold space-y-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Booking Request Saved</p>
                    <p className="text-xs font-normal text-emerald-800 mt-1 leading-relaxed">
                      {requestSuccessMsg}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                {formValidationErr && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formValidationErr}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Request Category
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => {
                      setRequestType(e.target.value);
                      setFormValidationErr('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-xs font-semibold text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                  >
                    {REQUEST_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {requestType === 'Booking Assistance' ? (
                  <div className="space-y-4">
                    {/* Standard Booking Request Format Message */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs">
                      <p className="font-semibold text-amber-900 mb-2">
                        To ensure a smooth and timely booking process, kindly submit your request in the below standard format:
                      </p>
                      <div className="bg-white/80 rounded-xl p-3 border border-amber-200/50">
                        <p className="font-bold uppercase tracking-wider text-amber-800 mb-1.5 text-[11px]">
                          Booking Request Format
                        </p>
                        <ul className="grid grid-cols-2 gap-1 text-[11px] text-text-secondary list-disc list-inside">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Member Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingFields.memberName}
                          onChange={(e) =>
                            setBookingFields({ ...bookingFields, memberName: e.target.value })
                          }
                          placeholder="Registered Member Name"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Spouse Name <span className="text-text-muted font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={bookingFields.spouseName}
                          onChange={(e) =>
                            setBookingFields({ ...bookingFields, spouseName: e.target.value })
                          }
                          placeholder="Spouse Name"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Kids &amp; Ages <span className="text-text-muted font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={bookingFields.kidsAges}
                          onChange={(e) =>
                            setBookingFields({ ...bookingFields, kidsAges: e.target.value })
                          }
                          placeholder="e.g. 2 kids (ages 4 and 9)"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Destination / Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingFields.destination}
                          onChange={(e) =>
                            setBookingFields({ ...bookingFields, destination: e.target.value })
                          }
                          placeholder="e.g. Switzerland / Maldives"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Check-in Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={bookingFields.checkInDate}
                          onChange={(e) =>
                            setBookingFields({ ...bookingFields, checkInDate: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Check-out Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={bookingFields.checkOutDate}
                          onChange={(e) =>
                            setBookingFields({ ...bookingFields, checkOutDate: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Number of Guests (PAX) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          required
                          value={bookingFields.guestsCount}
                          onChange={(e) =>
                            setBookingFields({ ...bookingFields, guestsCount: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Additional Requirements or Preferred Hotels <span className="text-text-muted font-normal">(Optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          placeholder="e.g. Need family adjoining rooms, airport pickup, vegetarian breakfast..."
                          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Standard Closing Message */}
                    <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-medium leading-relaxed">
                      &ldquo;Once your request is received, our Reservations Team will check availability and assist you accordingly.&rdquo;
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Subject Summary
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Plan inquiry, payment question, personal info update..."
                        value={requestSubject}
                        onChange={(e) => setRequestSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Details &amp; Message
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Please specify your question or request in detail..."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-50 text-xs text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none resize-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-surface-50 border border-border text-[11px] text-text-secondary flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent-primary flex-shrink-0" />
                      <span>Business commitment: Our team contacts you within 24 hours.</span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestModal(false);
                      setFormValidationErr('');
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestSubmitting}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover shadow-sm disabled:opacity-50"
                  >
                    {requestSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{requestType === 'Booking Assistance' ? 'Submit Booking Request' : 'Submit Request'}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

