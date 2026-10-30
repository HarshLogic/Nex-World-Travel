'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Key, Lock, ArrowRight, Loader2, UserCheck } from 'lucide-react';
import { loginMember } from '../../../lib/api';

export default function MemberLoginPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!memberId.trim() || !password.trim()) {
      setError('Member ID and Password are required.');
      return;
    }
    setLoading(true);
    try {
      await loginMember(memberId, password);
      router.push('/member/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid Member ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-surface-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl sm:rounded-4xl border border-border shadow-card p-6 sm:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="relative h-11 w-44 mx-auto">
                <Image src="/images/logo.png" alt="Nex World Travel" fill sizes="176px" className="object-contain" priority />
              </div>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light text-accent-primary text-xs font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Member Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Member Login Portal
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Enter your Member ID and password to access your membership benefits.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Member ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. NEX-M-1001"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface-50 text-sm font-semibold uppercase tracking-wider text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                />
                <Key className="w-4 h-4 text-text-muted absolute right-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-text-muted mt-1">
                Log in using your registered Nex World Travel Member ID.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                />
                <Lock className="w-4 h-4 text-text-muted absolute right-3.5 top-3.5" />
              </div>
              <div className="flex items-center justify-end mt-1.5">
                <Link href="/forgot-password" className="text-xs font-semibold text-accent-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-accent-primary hover:bg-accent-primary-hover shadow-md shadow-accent-primary/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Member Portal</span>}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Need login assistance? Contact our Abu Dhabi office at{' '}
          <a href="tel:+97126395908" className="text-accent-primary font-semibold hover:underline">
            +971 2 639 5908
          </a>
        </p>
      </div>
    </div>
  );
}
