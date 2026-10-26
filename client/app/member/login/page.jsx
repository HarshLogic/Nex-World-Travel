'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Key, Lock, ArrowRight, Loader2, Sparkles, UserCheck } from 'lucide-react';
import { loginMember } from '../../../lib/api';

export default function MemberLoginPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState('NEX-M-1001');
  const [password, setPassword] = useState('MemberPassword2026!');
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
    <div className="py-16 md:py-24 bg-surface-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-4xl border border-border shadow-card p-8 sm:p-10">
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
            <h1 className="text-2xl font-bold text-text-primary">Member Login</h1>
            <p className="text-xs text-text-secondary mt-1">
              Enter your Member ID and password to access your benefits.
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

          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-xs text-text-muted">
            <Link href="/login" className="hover:text-accent-primary transition-colors">
              Staff or Admin Login &rarr;
            </Link>
            <a href="tel:+97126395908" className="hover:text-text-primary">
              Forgot ID?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

