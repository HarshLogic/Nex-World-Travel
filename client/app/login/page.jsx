'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserCheck, Shield, Briefcase, Lock, Key, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { loginMember, loginStaff } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('member'); // 'member' | 'master_head' | 'employee'

  // Member form state
  const [memberId, setMemberId] = useState('');
  const [memberPassword, setMemberPassword] = useState('');

  // Staff form state
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!memberId.trim() || !memberPassword.trim()) {
      setError('Please provide both Member ID and Password.');
      return;
    }
    setLoading(true);
    try {
      await loginMember(memberId, memberPassword);
      router.push('/member/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!staffEmail.trim() || !staffPassword.trim()) {
      setError('Please provide both Email Address and Password.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginStaff(staffEmail, staffPassword);
      if (data.user.role === 'master_head') {
        router.push('/admin/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid staff credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setError('');
    if (role === 'member') {
      setActiveTab('member');
      setMemberId('NEX-M-1001');
      setMemberPassword('MemberPassword2026!');
    } else if (role === 'master_head') {
      setActiveTab('master_head');
      setStaffEmail('admin@nexworldtravel.com');
      setStaffPassword('AdminPassword2026!');
    } else if (role === 'employee') {
      setActiveTab('employee');
      setStaffEmail('staff@nexworldtravel.com');
      setStaffPassword('StaffPassword2026!');
    }
  };

  return (
    <div className="py-12 md:py-20 bg-surface-50 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto px-4 sm:px-6">
        {/* Card */}
        <div className="bg-white rounded-3xl sm:rounded-4xl border border-border shadow-card p-5 sm:p-10">
          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="relative h-11 w-44 mx-auto">
                <Image
                  src="/images/logo.png"
                  alt="Nex World Travel"
                  fill
                  sizes="176px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Portal Access Gateway
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Select your authorization role to enter your dedicated management space.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 sm:p-1.5 bg-surface-50 rounded-2xl border border-border mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('member'); setError(''); }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                activeTab === 'member'
                  ? 'bg-white text-accent-primary shadow-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Member</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('master_head'); setError(''); }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                activeTab === 'master_head'
                  ? 'bg-white text-accent-primary shadow-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Master Head</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('employee'); setError(''); }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                activeTab === 'employee'
                  ? 'bg-white text-accent-primary shadow-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>Employee</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium mb-5">
              {error}
            </div>
          )}

          {/* Form: Member Login */}
          {activeTab === 'member' && (
            <form onSubmit={handleMemberSubmit} className="space-y-4">
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
                  Log in using your registered Nex World Travel Member ID (no email required).
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
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Access Member Portal</span>}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* Form: Staff / Master Head Login */}
          {(activeTab === 'master_head' || activeTab === 'employee') && (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  {activeTab === 'master_head' ? 'Master Head Email' : 'Staff Email Address'}
                </label>
                <input
                  type="email"
                  required
                  placeholder={activeTab === 'master_head' ? 'admin@nexworldtravel.com' : 'staff@nexworldtravel.com'}
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-surface-50 text-sm text-text-primary focus:bg-white focus:border-accent-primary focus:outline-none"
                />
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
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
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
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>
                    {activeTab === 'master_head' ? 'Access Master Head Portal' : 'Access Employee Portal'}
                  </span>
                )}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* Demo Quick-Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-border">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
              Demo Quick-Fill Credentials:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('member')}
                className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-accent-primary-light hover:text-accent-primary border border-border font-medium transition-colors"
              >
                Gold Member (NEX-M-1001)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('master_head')}
                className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-accent-primary-light hover:text-accent-primary border border-border font-medium transition-colors"
              >
                Master Head (Admin)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('employee')}
                className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-accent-primary-light hover:text-accent-primary border border-border font-medium transition-colors"
              >
                Staff (Employee)
              </button>
            </div>
          </div>
        </div>

        {/* Support Help */}
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

