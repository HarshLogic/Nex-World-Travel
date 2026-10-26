'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  FileEdit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  Eye,
  LogOut,
  X,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  fetchChangeRequests,
  approveChangeRequest,
  rejectChangeRequest,
  fetchAdminMemberDetail,
} from '../../../lib/api';
import { getAuthUser, clearAuth } from '../../../lib/auth';

export default function AdminApprovalsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Requests state
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Pending');

  // Inspect Member Dossier
  const [inspectedMember, setInspectedMember] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // Reject Modal
  const [rejectModalTarget, setRejectModalTarget] = useState(null);
  const [decisionNote, setDecisionNote] = useState('');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const user = getAuthUser();
    if (!user || user.role !== 'master_head') {
      router.push('/admin/login');
      return;
    }
    setCurrentUser(user);
    loadRequests();
  }, [router]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchChangeRequests();
      setRequests(data || []);
    } catch (err) {
      triggerToast(err.message || 'Failed to load change requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, memberId) => {
    setActionLoading(true);
    try {
      await approveChangeRequest(id);
      triggerToast(`Request approved! Changes applied to Member ${memberId || ''}.`);
      loadRequests();
    } catch (err) {
      triggerToast(err.message || 'Failed to approve request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalTarget) return;
    setActionLoading(true);
    try {
      await rejectChangeRequest(
        rejectModalTarget.id || rejectModalTarget._id || rejectModalTarget.requestId,
        decisionNote.trim() || 'Declined by Master Head administrator.'
      );
      triggerToast('Change request has been rejected.');
      setRejectModalTarget(null);
      setDecisionNote('');
      loadRequests();
    } catch (err) {
      triggerToast(err.message || 'Failed to reject request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInspectMember = async (memberId) => {
    if (!memberId) return;
    setMemberLoading(true);
    try {
      const res = await fetchAdminMemberDetail(memberId);
      setInspectedMember(res.member || res);
    } catch (err) {
      triggerToast(err.message || 'Failed to fetch member details', 'error');
    } finally {
      setMemberLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'All') return true;
    return r.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-text-secondary">Loading Master Head Approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-text-primary flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium transition-all ${
            toastType === 'error'
              ? 'bg-red-600 text-white shadow-red-500/20'
              : 'bg-emerald-600 text-white shadow-emerald-500/20'
          }`}
        >
          {toastType === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 rounded-xl border border-border hover:bg-surface-50 text-text-secondary hover:text-text-primary">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-9 w-36">
                <Image
                  src="/images/logo.png"
                  alt="Nex World Travel"
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <span className="hidden sm:inline-block h-5 w-[1px] bg-border" />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Package Change Approvals Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold text-accent-primary hover:underline"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                clearAuth();
                router.push('/login');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl border border-border"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#172033] to-[#243352] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-300 mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Governance & Authorization Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Membership Package Approvals
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Employees can propose member plan amendments, bonus room nights, or tier adjustments, but all protected package and financial changes require Master Head review before taking effect.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-white/10 p-4 rounded-2xl border border-white/10 shrink-0">
            <span className="text-xs text-white/70">Awaiting Decision</span>
            <div className="text-3xl font-black text-amber-300">{pendingCount}</div>
            <span className="text-[11px] text-white/60">Requests Pending</span>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
          {[
            { id: 'Pending', label: `Pending Approvals (${pendingCount})` },
            { id: 'Approved', label: 'Approved' },
            { id: 'Rejected', label: 'Rejected' },
            { id: 'All', label: 'All Requests' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-text-primary text-white shadow-xs'
                  : 'bg-white text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((cr) => {
            const memberId = cr.memberProfileId?.memberId || cr.targetId || 'NEX-M';
            const isPending = cr.status === 'Pending';

            return (
              <div
                key={cr.id || cr._id || cr.requestId}
                className={`bg-white rounded-3xl border p-6 shadow-xs transition-all ${
                  isPending ? 'border-amber-300 ring-2 ring-amber-50' : 'border-border'
                }`}
              >
                {/* Card Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-accent-primary bg-accent-primary-light px-3 py-1 rounded-full">
                      Member ID: {memberId}
                    </span>
                    <button
                      onClick={() => handleInspectMember(memberId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-accent-primary"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Dossier</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        cr.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : cr.status === 'Rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {cr.status}
                    </span>
                    <span className="text-xs text-text-tertiary flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(cr.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submitter & Proposal Details */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-text-secondary gap-2">
                  <div>
                    <span className="font-semibold text-text-primary">Submitted By:</span>{' '}
                    {cr.employeeId?.name || cr.employeeName || 'Staff Specialist'} (
                    {cr.employeeId?.email || cr.employeeEmail || 'staff@nexworldtravel.com'})
                  </div>
                  <div className="font-semibold text-accent-primary">
                    Change Action: {cr.changeType || 'Membership Plan Modification'}
                  </div>
                </div>

                {/* Side-by-Side Diff View Box */}
                <div className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200">
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-red-200/60">
                      <span className="text-[11px] font-black text-red-800 uppercase tracking-wider">
                        Current Values (Active)
                      </span>
                      <span className="text-[10px] text-red-600 font-semibold">Live in Portal</span>
                    </div>
                    <pre className="font-mono text-xs text-red-950 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(cr.currentValues || cr.currentValue || {}, null, 2)}
                    </pre>
                  </div>

                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-emerald-200/60">
                      <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                        Proposed Changes (Requested)
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Requires Approval</span>
                    </div>
                    <pre className="font-mono text-xs text-emerald-950 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(cr.proposedChanges || cr.proposedValue || {}, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Employee's Justification */}
                <div className="text-xs bg-surface-50 p-3.5 rounded-2xl border border-border space-y-1">
                  <span className="font-bold text-text-primary block">Staff Rationale / Business Justification:</span>
                  <p className="text-text-secondary italic">"{cr.reason || 'No justification entered'}"</p>
                </div>

                {/* Reviewer Feedback if already decided */}
                {cr.reviewNotes && (
                  <div className="mt-3 text-xs bg-slate-100 p-3 rounded-2xl text-text-secondary border border-slate-200">
                    <span className="font-bold text-text-primary">Master Head Decision Note:</span>{' '}
                    {cr.reviewNotes} (Reviewed by {cr.reviewedBy || 'Master Head'})
                  </div>
                )}

                {/* Action Bar for Pending Requests */}
                {isPending && (
                  <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-text-tertiary">
                      Approval validates the proposed values, updates the member profile, and commits an audit log entry.
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => {
                          setRejectModalTarget(cr);
                          setDecisionNote('');
                        }}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                      >
                        Reject Request
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleApprove(cr.id || cr._id || cr.requestId, memberId)}
                        className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Apply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="bg-white rounded-3xl border border-border p-12 text-center text-text-tertiary text-xs space-y-2">
              <FileCheck className="w-8 h-8 text-text-tertiary mx-auto opacity-50" />
              <p className="font-semibold text-text-secondary">No change requests found in this view.</p>
              <p>When staff members propose member plan changes, they will appear here for your review.</p>
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-text-primary">Reject Change Request</h3>
              <button
                onClick={() => setRejectModalTarget(null)}
                className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary">
              Provide feedback for the staff specialist explaining why this requested change was declined:
            </p>

            <textarea
              rows={3}
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="e.g. Contract renewal amendment required before applying extra room nights..."
              className="w-full p-3 text-xs rounded-xl border border-border focus:border-red-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalTarget(null)}
                className="px-4 py-2 text-xs text-text-secondary hover:bg-surface-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50"
              >
                {actionLoading ? 'Declining...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspected Member Dossier Modal */}
      {inspectedMember && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">
                  {inspectedMember.registeredName || inspectedMember.userId?.name}
                </h3>
                <span className="font-mono text-xs font-bold text-accent-primary bg-accent-primary-light px-2.5 py-0.5 rounded-full">
                  {inspectedMember.memberId}
                </span>
              </div>
              <button
                onClick={() => setInspectedMember(null)}
                className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-surface-50 p-4 rounded-2xl border border-border">
              <div>
                <span className="text-text-tertiary">Package Tier</span>
                <p className="font-bold text-text-primary mt-0.5">{inspectedMember.packageType}</p>
              </div>
              <div>
                <span className="text-text-tertiary">Available Nights</span>
                <p className="font-bold text-accent-primary mt-0.5">
                  {inspectedMember.nightsAvailable} Nights Remaining
                </p>
              </div>
              <div>
                <span className="text-text-tertiary">Travel Card Benefit</span>
                <p className="font-bold text-emerald-600 mt-0.5">
                  {inspectedMember.travelCardBenefit ? 'Included' : 'None'}
                </p>
              </div>
              <div>
                <span className="text-text-tertiary">Outstanding Balance</span>
                <p className="font-bold text-red-600 mt-0.5">
                  ${inspectedMember.outstandingBalance?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="text-xs">
              <span className="font-semibold text-text-secondary block mb-1">Contract Extra Offers:</span>
              <p className="bg-surface-50 p-3 rounded-xl border border-border text-text-primary">
                {inspectedMember.extraOffers || 'Standard package amenities apply.'}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setInspectedMember(null)}
                className="px-4 py-2 bg-text-primary text-white text-xs font-bold rounded-xl"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

