'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Key,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  X,
  Shield,
  User,
} from 'lucide-react';
import { forgotPassword } from '../../lib/api';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const portalParam = searchParams.get('portal');
  const [mode, setMode] = useState(portalParam === 'staff' ? 'staff' : 'member');

  // Member 2-step state
  const [step, setStep] = useState(1);
  const [memberId, setMemberId] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [popupError, setPopupError] = useState(null);

  useEffect(() => {
    if (portalParam === 'staff') {
      setMode('staff');
    } else if (portalParam === 'member') {
      setMode('member');
    }
  }, [portalParam]);

  const resetFormState = (nextMode) => {
    setMode(nextMode);
    setStep(1);
    setMemberId('');
    setEmail('');
    setSubmitted(false);
    setPopupError(null);
  };

  const handleMemberStepOne = (e) => {
    e.preventDefault();
    const cleaned = memberId.trim();
    if (!cleaned) {
      setPopupError({
        title: 'Membership ID Required',
        message: 'Please enter your Membership ID and registered email address.',
      });
      return;
    }
    if (cleaned.length < 3 || cleaned.length > 30 || !/^[A-Za-z0-9\-_ ]+$/.test(cleaned)) {
      setPopupError({
        title: 'Invalid Membership ID Format',
        message: 'Please enter a valid Membership ID (3 to 30 characters, letters, numbers, or hyphens).',
      });
      return;
    }
    setPopupError(null);
    setStep(2);
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    const cleanedId = memberId.trim();
    const cleanedEmail = email.trim();

    if (!cleanedId || !cleanedEmail) {
      setPopupError({
        title: 'Missing Required Details',
        message: 'Please enter your Membership ID and registered email address.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      setPopupError({
        title: 'Invalid Email Address',
        message: 'Please enter a valid registered email address.',
      });
      return;
    }

    setPopupError(null);
    setLoading(true);
    try {
      const res = await forgotPassword(cleanedEmail, cleanedId);
      if (res && res.matched === false) {
        setPopupError({
          title: 'Email Verification Failed',
          message:
            'The entered email address is incorrect or not associated with this Membership ID. Please verify your registered email address or contact our Abu Dhabi travel desk at +971-263-959-08.',
        });
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setPopupError({
        title: 'Recovery Request Error',
        message: err.message || 'Unable to process password reset request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    const cleanedEmail = email.trim();
    if (!cleanedEmail) {
      setPopupError({
        title: 'Email Required',
        message: 'Please enter your registered staff or administrator email address.',
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      setPopupError({
        title: 'Invalid Email Address',
        message: 'Please enter a valid registered email address.',
      });
      return;
    }

    setPopupError(null);
    setLoading(true);
    try {
      await forgotPassword(cleanedEmail);
      setSubmitted(true);
    } catch (err) {
      setPopupError({
        title: 'Recovery Request Error',
        message: err.message || 'Unable to submit password reset request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4 py-12">
      {/* Error Popup Modal */}
      {popupError && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="error-popup-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPopupError(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2 id="error-popup-title" className="text-base font-bold text-text-primary">
                  {popupError.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPopupError(null)}
                aria-label="Close error message"
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">{popupError.message}</p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPopupError(null)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full">
        {/* Brand Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block relative h-12 w-48 mb-2">
            <Image
              src="/images/logo.png"
              alt="Nex World Travel"
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </Link>
          <p className="text-xs text-text-tertiary">Secure Account Password Recovery</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-border shadow-card space-y-6">
          {mode === 'member' ? (
            <>
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light text-accent-primary text-xs font-semibold mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Member Password Recovery</span>
                </div>
                <h1 className="text-xl font-bold text-text-primary">Forgot Your Password?</h1>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step === 1
                    ? 'Step 1 of 2: Enter your registered Membership ID to begin verification.'
                    : 'Step 2 of 2: Enter the email address registered with your membership.'}
                </p>
              </div>

              {/* Step Indicator */}
              {!submitted && (
                <div className="flex items-center justify-center gap-2 text-[11px] font-semibold">
                  <span
                    className={`px-2.5 py-1 rounded-full ${
                      step === 1
                        ? 'bg-accent-primary text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    1. Membership ID
                  </span>
                  <span className="text-border">&rarr;</span>
                  <span
                    className={`px-2.5 py-1 rounded-full ${
                      step === 2
                        ? 'bg-accent-primary text-white'
                        : 'bg-surface-100 text-text-muted'
                    }`}
                  >
                    2. Registered Email
                  </span>
                </div>
              )}

              {submitted ? (
                <div className="space-y-4 text-center animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="font-bold text-sm">Reset Link Dispatched</p>
                    <p>
                      If your provided membership details match our records for <strong>{memberId.toUpperCase()}</strong>, password reset instructions have been sent to <strong>{email}</strong>.
                    </p>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    The secure reset link is valid for 1 hour. Please check your spam folder or contact our travel desk at{' '}
                    <a href="tel:+97126395908" className="text-accent-primary font-semibold hover:underline">
                      +971-263-959-08
                    </a>
                    .
                  </p>
                  <Link
                    href="/member/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:underline pt-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Member Login</span>
                  </Link>
                </div>
              ) : step === 1 ? (
                <form onSubmit={handleMemberStepOne} noValidate className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">
                      Membership ID *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="e.g. NWT-TR-831 or NEX-M-1001"
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 pr-10 rounded-2xl border border-border bg-surface-50 text-sm font-semibold uppercase tracking-wider text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                      />
                      <Key className="w-4 h-4 text-text-muted absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md shadow-accent-primary/20 transition-all active:scale-95"
                  >
                    <span>Continue to Email Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMemberSubmit} noValidate className="space-y-4 text-xs">
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-50 border border-border">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">
                        Membership ID
                      </span>
                      <span className="font-mono font-bold text-text-primary text-xs">{memberId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-accent-primary hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">
                      Registered Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pr-10 rounded-2xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-text-muted absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md shadow-accent-primary/20 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <Link
                  href="/member/login"
                  className="inline-flex items-center gap-1 text-text-secondary hover:text-accent-primary font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Member Login</span>
                </Link>
                <button
                  type="button"
                  onClick={() => resetFormState('staff')}
                  className="hover:text-accent-primary font-medium transition-colors"
                >
                  Staff Recovery &rarr;
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Staff & Administrator Recovery</span>
                </div>
                <h1 className="text-xl font-bold text-text-primary">Forgot Your Password?</h1>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Enter your registered staff or administrator email address below to receive password reset instructions.
                </p>
              </div>

              {submitted ? (
                <div className="space-y-4 text-center animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="font-bold text-sm">Instructions Dispatched</p>
                    <p>
                      If an active staff account exists for <strong>{email}</strong>, a secure password reset link has been dispatched to your inbox.
                    </p>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    The link is valid for 1 hour. Please check your spam folder if it doesn't appear.
                  </p>
                  <Link
                    href="/employee/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:underline pt-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Staff Login</span>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleStaffSubmit} noValidate className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">
                      Registered Staff Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="name@nexworldtravel.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pr-10 rounded-2xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-text-muted absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md shadow-accent-primary/20 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Instructions</span>}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <Link
                  href="/employee/login"
                  className="inline-flex items-center gap-1 text-text-secondary hover:text-accent-primary font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Staff Login</span>
                </Link>
                <button
                  type="button"
                  onClick={() => resetFormState('member')}
                  className="hover:text-accent-primary font-medium transition-colors"
                >
                  Member Recovery &rarr;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
