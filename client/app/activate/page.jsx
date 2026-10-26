'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, ArrowRight, Loader2, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { activateAccount, verifySecurityToken } from '../../lib/api';

function ActivateAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Activation token is missing from the link.');
      setVerifying(false);
      return;
    }

    verifySecurityToken(token)
      .then((data) => {
        setTokenInfo(data);
      })
      .catch((err) => {
        setError(err.message || 'Invalid or expired invitation token.');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await activateAccount(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Account activation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin mx-auto mb-2" />
        <p className="text-xs text-text-secondary">Verifying staff invitation...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h2 className="text-base font-bold">Account Activated!</h2>
          <p>Your staff account is now active and your password has been securely saved.</p>
        </div>
        <Link
          href="/employee/login"
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-bold shadow-xs hover:bg-accent-primary-hover transition-colors"
        >
          <span>Sign In to Employee Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-accent-primary-light text-accent-primary flex items-center justify-center mx-auto mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-text-primary">Activate Your Staff Account</h1>
        {tokenInfo && (
          <p className="text-xs text-text-secondary">
            Welcome, <strong>{tokenInfo.name || tokenInfo.email}</strong>! Please choose your private password to activate your access.
          </p>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {token && !error ? (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-secondary mb-1">
              Create Your Password (minimum 8 characters) *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-secondary mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md shadow-accent-primary/20 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Activate Staff Account</span>}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      ) : (
        <div className="text-center pt-2">
          <Link
            href="/employee/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:underline"
          >
            Return to Employee Sign In
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
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
            Authorized Personnel Invitation
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-border shadow-card">
          <Suspense fallback={<div className="text-center py-8 text-xs text-text-secondary">Verifying invitation...</div>}>
            <ActivateAccountForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

