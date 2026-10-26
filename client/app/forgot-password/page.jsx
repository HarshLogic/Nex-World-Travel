'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, Loader2, CheckCircle2, Shield, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to submit password reset request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block relative h-12 w-48 mb-3">
            <Image
              src="/images/logo.png"
              alt="Nex World Travel"
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </Link>
          <p className="text-xs text-text-tertiary">
            Secure Account Password Recovery
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-border shadow-card space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-accent-primary-light text-accent-primary flex items-center justify-center mx-auto mb-2">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">Forgot Your Password?</h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              Enter your registered staff or administrator email address below to receive password reset instructions.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-4 text-center animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Instructions Dispatched</p>
                <p>
                  If an active account exists for <strong>{email}</strong>, a secure password reset link has been dispatched to your inbox.
                </p>
              </div>
              <p className="text-xs text-text-tertiary">
                The link is valid for 1 hour. Please check your spam folder if it doesn't appear.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:underline pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-secondary mb-1">
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@nexworldtravel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md shadow-accent-primary/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Instructions</span>}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-text-secondary hover:text-accent-primary text-xs font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

