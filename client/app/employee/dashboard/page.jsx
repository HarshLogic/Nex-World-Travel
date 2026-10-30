'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Shield,
  FileEdit,
  MapPin,
  CalendarCheck,
  MessageSquare,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit,
  Clock,
  Sparkles,
  Award,
  Send,
  Plus,
  RefreshCw,
  X,
  Lock,
  Download,
  Info,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  fetchCurrentUser,
  fetchAdminMembers,
  createAdminMember,
  createEmployeeChangeRequest,
  fetchMyChangeRequests,
  updateAdminMember,
  fetchAdminBookings,
  updateBookingStatus,
  addBookingNote,
  fetchAdminMemberRequests,
  updateMemberRequestStatus,
  fetchDestinations,
  createDestination,
  updateDestination,
  fetchAvailabilities,
} from '../../../lib/api';
import { getAuthUser, clearAuth } from '../../../lib/auth';
import { PERMISSION_OPTIONS, hasPermission } from '../../../lib/permissions';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Members state
  const [members, setMembers] = useState([]);
  const [membersPagination, setMembersPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPackageFilter, setMemberPackageFilter] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  // Change Request Modal state
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [crTargetMember, setCrTargetMember] = useState(null);
  const [crField, setCrField] = useState('nightsAvailable');
  const [crNewValue, setCrNewValue] = useState('');
  const [crReason, setCrReason] = useState('');

  // Add Member Modal state (when employee has create_member permission)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({
    memberId: `NEX-M-${Math.floor(2000 + Math.random() * 8000)}`,
    name: '',
    email: '',
    phone: '',
    address: '',
    password: 'Member123!',
    packageType: 'Gold',
    allottedNights: 14,
    usedNights: 0,
    nightsAvailable: 14,
    membershipStatus: 'Active',
    extraOffers: 'Airport Transfer, VIP Lounge, Travel Concierge',
    tenurePeriod: '3 Years',
    travelCardBenefit: true,
    purchaseDate: new Date().toISOString().split('T')[0],
    productPrice: 12500,
    initialPaidAmount: 5000,
    paymentMethod: 'Bank Transfer',
    paymentReference: '',
    hasEmi: true,
    emiAmount: 1250,
    emiFrequency: 'Monthly',
    nextEmiDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueAmount: 1250,
  });

  // Direct Edit Modal (if employee has edit_member_details permission)
  const [showDirectEditModal, setShowDirectEditModal] = useState(false);
  const [directEditForm, setDirectEditForm] = useState({});

  // My Change Requests state
  const [myChangeRequests, setMyChangeRequests] = useState([]);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingNoteText, setBookingNoteText] = useState('');

  // Member Support Requests state
  const [memberRequests, setMemberRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [mrNote, setMrNote] = useState('');

  // Destinations state
  const [destinations, setDestinations] = useState([]);

  // Trip Availability Calendar state
  const [availabilities, setAvailabilities] = useState([]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const hasPerm = (perm) => {
    return hasPermission(permissions, perm);
  };

  useEffect(() => {
    const user = getAuthUser();
    if (!user || (user.role !== 'employee' && user.role !== 'master_head')) {
      router.push('/employee/login');
      return;
    }
    setCurrentUser(user);
    if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
      setPermissions(user.permissions);
    }
    loadEmployeeSession();
  }, [router]);

  const loadEmployeeSession = async () => {
    setLoading(true);
    try {
      const freshUser = await fetchCurrentUser();
      if (freshUser) {
        setCurrentUser(freshUser);
        const perms = freshUser.permissions || [];
        setPermissions(perms);

        // Load accessible tabs
        const promises = [fetchMyChangeRequests().catch(() => [])];

        const canSeeMembers = hasPermission(perms, 'view_members') || hasPermission(perms, 'create_member');
        if (canSeeMembers) {
          promises.push(fetchAdminMembers({ page: 1, limit: 15 }).catch(() => ({ members: [], pagination: {} })));
        }
        if (hasPermission(perms, 'manage_bookings')) {
          promises.push(fetchAdminBookings().catch(() => []));
        }
        promises.push(fetchAdminMemberRequests().catch(() => []));
        if (hasPermission(perms, 'add_destinations') || hasPermission(perms, 'edit_destinations')) {
          promises.push(fetchDestinations().catch(() => []));
        }
        promises.push(fetchAvailabilities().catch(() => []));

        const results = await Promise.all(promises);
        setMyChangeRequests(results[0] || []);

        let idx = 1;
        if (canSeeMembers) {
          const memRes = results[idx++];
          setMembers(memRes?.members || []);
          if (memRes?.pagination) setMembersPagination(memRes.pagination);
        }
        if (hasPermission(perms, 'manage_bookings')) {
          setBookings(results[idx++] || []);
        }
        setMemberRequests(results[idx++] || []);
        if (perms.includes('add_destinations') || perms.includes('edit_destinations')) {
          setDestinations(results[idx++] || []);
        }
        setAvailabilities(results[idx++] || []);
      }
    } catch (err) {
      triggerToast(err.message || 'Error loading employee session', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings' && hasPerm('manage_bookings')) {
      fetchAdminBookings().then(setBookings).catch(() => {});
    }
  }, [activeTab]);

  const handleMembersSearch = async (page = 1, overrideFilters = null) => {
    try {
      const searchVal = overrideFilters && overrideFilters.search !== undefined ? overrideFilters.search : memberSearch.trim();
      const pkgVal = overrideFilters && overrideFilters.packageType !== undefined ? overrideFilters.packageType : memberPackageFilter;
      const statusVal = overrideFilters && overrideFilters.status !== undefined ? overrideFilters.status : memberStatusFilter;

      const params = { page, limit: 15 };
      if (searchVal) params.search = searchVal;
      if (pkgVal) params.packageType = pkgVal;
      if (statusVal) params.status = statusVal;

      const res = await fetchAdminMembers(params);
      setMembers(res.members || []);
      if (res.pagination) setMembersPagination(res.pagination);
    } catch (err) {
      triggerToast(err.message || 'Error searching members', 'error');
    }
  };

  const handleSignOut = () => {
    clearAuth();
    router.push('/login');
  };

  // Submit Change Request for Master Head approval
  const handleSubmitChangeRequest = async (e) => {
    e.preventDefault();
    if (!crTargetMember || !crReason.trim()) return;
    setActionLoading(true);
    try {
      const proposed = {};
      const current = {};

      if (crField === 'nightsAvailable') {
        proposed.nightsAvailable = Number(crNewValue);
        current.nightsAvailable = crTargetMember.nightsAvailable;
      } else if (crField === 'packageType') {
        proposed.packageType = crNewValue;
        current.packageType = crTargetMember.packageType;
      } else if (crField === 'membershipStatus') {
        proposed.membershipStatus = crNewValue;
        current.membershipStatus = crTargetMember.membershipStatus || 'Open';
      } else if (crField === 'travelCardBenefit') {
        proposed.travelCardBenefit = crNewValue === 'true' || crNewValue === 'yes';
        current.travelCardBenefit = crTargetMember.travelCardBenefit;
      } else if (crField === 'extraOffers') {
        proposed.extraOffers = crNewValue;
        current.extraOffers = crTargetMember.extraOffers;
      } else if (crField === 'tenurePeriod') {
        proposed.tenurePeriod = crNewValue;
        current.tenurePeriod = crTargetMember.tenurePeriod;
      } else if (crField === 'phone') {
        proposed.phone = crNewValue;
        current.phone = crTargetMember.phone;
      }

      await createEmployeeChangeRequest({
        memberProfileId: crTargetMember.id || crTargetMember._id,
        changeType: `Update ${crField}`,
        proposedChanges: proposed,
        currentValues: current,
        reason: crReason.trim(),
      });

      triggerToast('Change request submitted! Sent to Master Head for approval.');
      setShowChangeRequestModal(false);
      setCrReason('');
      setCrNewValue('');
      // Reload my change requests
      fetchMyChangeRequests().then(setMyChangeRequests).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to submit change request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Member by Employee with create_member permission
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        memberId: (addMemberForm.memberId || `NEX-M-${Math.floor(2000 + Math.random() * 8000)}`).trim().toUpperCase(),
        registeredName: addMemberForm.name.trim(),
        name: addMemberForm.name.trim(),
        email: addMemberForm.email.trim(),
        phone: addMemberForm.phone.trim(),
        initialPassword: addMemberForm.password || 'Member123!',
        password: addMemberForm.password || 'Member123!',
        packageType: addMemberForm.packageType,
        allottedNights: Number(addMemberForm.allottedNights || 14),
        usedNights: Number(addMemberForm.usedNights || 0),
        availableNights: Math.max(0, Number(addMemberForm.allottedNights || 14) - Number(addMemberForm.usedNights || 0)),
        nightsAvailable: Math.max(0, Number(addMemberForm.allottedNights || 14) - Number(addMemberForm.usedNights || 0)),
        membershipStatus: addMemberForm.membershipStatus || 'Active',
        paymentMethod: addMemberForm.paymentMethod || 'Bank Transfer',
        paymentReference: addMemberForm.paymentReference || '',
        extraOffers: addMemberForm.extraOffers,
        tenurePeriod: addMemberForm.tenurePeriod,
        travelCardBenefit: Boolean(addMemberForm.travelCardBenefit),
        purchaseDate: addMemberForm.purchaseDate || new Date().toISOString().split('T')[0],
        productPrice: Number(addMemberForm.productPrice || 12500),
        initialPaidAmount: Number(addMemberForm.initialPaidAmount || 0),
        hasEMI: Boolean(addMemberForm.hasEmi),
        emiAmount: Number(addMemberForm.emiAmount || 0),
        emiTenureMonths: 12,
        nextEMIDueDate: addMemberForm.nextEmiDueDate,
        emiDetails: {
          hasEmi: Boolean(addMemberForm.hasEmi),
          emiAmount: Number(addMemberForm.emiAmount || 0),
          frequency: addMemberForm.emiFrequency || 'Monthly',
          nextDueDate: addMemberForm.nextEmiDueDate,
          dueAmount: Number(addMemberForm.dueAmount || 0),
        },
      };

      const res = await createAdminMember(payload);
      const createdMember = res.member || res.profile;
      const createdId = createdMember?.memberId || payload.memberId;
      triggerToast(`Member ${createdId} registered successfully!`);
      setShowAddMemberModal(false);

      if (createdMember) {
        setMembers((prev) => [createdMember, ...prev.filter((m) => m.memberId !== createdMember.memberId)]);
        setMembersPagination((prev) => ({ ...prev, total: (prev.total || 0) + 1 }));
      }
      setMemberSearch('');
      setMemberStatusFilter('');
      handleMembersSearch(1, { search: '', packageType: '', status: '' });
    } catch (err) {
      triggerToast(err.message || 'Failed to register member', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Direct Member Edit Modal
  const handleOpenDirectEdit = (member) => {
    setSelectedMember(member);
    setDirectEditForm({
      memberId: member.memberId,
      registeredName: member.registeredName || member.name || member.userId?.name || '',
      email: member.email || member.userId?.email || '',
      phone: member.phone || '',
      address: member.address || '',
      packageType: member.packageType || 'Gold',
      membershipStatus: member.membershipStatus || 'Open',
      tenurePeriod: member.tenurePeriod || '3 Years',
      purchaseDate: member.purchaseDate ? member.purchaseDate.split('T')[0] : '',
      allottedNights: member.allottedNights ?? ((member.availableNights || 0) + (member.usedNights || 0)),
      availableNights: member.availableNights ?? member.nightsAvailable ?? 14,
      usedNights: member.usedNights || 0,
      travelCardBenefit: Boolean(member.travelCardBenefit),
      extraOffers: member.extraOffers || '',
      productPrice: Number(member.productPrice || 0),
      totalAmountPaid: Number(member.totalAmountPaid || 0),
      outstandingBalance: Number(member.outstandingBalance || 0),
      hasEMI: Boolean(member.hasEMI),
      emiAmount: Number(member.emiAmount || 0),
      emiTenureMonths: Number(member.emiTenureMonths || 12),
      nextEMIDueDate: member.nextEMIDueDate ? member.nextEMIDueDate.split('T')[0] : '',
      dueAmount: Number(member.dueAmount || 0),
      paymentStatus: member.paymentStatus || 'Up to Date',
    });
    setShowDirectEditModal(true);
  };

  // Direct Edit Submit (enforcing employee permissions)
  const handleDirectEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const payload = {};
      // Base contact & profile details (permitted by edit_member_details)
      if (hasPerm('edit_member_details')) {
        if (directEditForm.registeredName) {
          payload.registeredName = directEditForm.registeredName.trim();
          payload.name = directEditForm.registeredName.trim();
        }
        if (directEditForm.email) payload.email = directEditForm.email.trim();
        if (directEditForm.phone) payload.phone = directEditForm.phone.trim();
        if (directEditForm.address !== undefined) payload.address = directEditForm.address.trim();
      }

      // Status
      if (hasPerm('update_membership_status') || hasPerm('edit_member_details')) {
        if (directEditForm.membershipStatus) payload.membershipStatus = directEditForm.membershipStatus;
      }

      // Plans
      if (hasPerm('edit_membership_plans')) {
        payload.packageType = directEditForm.packageType;
        payload.allottedNights = Number(directEditForm.allottedNights);
        payload.availableNights = Number(directEditForm.availableNights);
        payload.tenurePeriod = directEditForm.tenurePeriod;
        payload.extraOffers = directEditForm.extraOffers;
        payload.travelCardBenefit = Boolean(directEditForm.travelCardBenefit);
        if (directEditForm.purchaseDate) payload.purchaseDate = directEditForm.purchaseDate;
      }

      // Financial
      if (hasPerm('update_financial_info')) {
        payload.productPrice = Number(directEditForm.productPrice);
        payload.totalAmountPaid = Number(directEditForm.totalAmountPaid);
        payload.outstandingBalance = Number(directEditForm.outstandingBalance);
        payload.paymentStatus = directEditForm.paymentStatus;
        payload.hasEMI = Boolean(directEditForm.hasEMI);
        payload.emiAmount = Number(directEditForm.emiAmount);
        payload.emiTenureMonths = Number(directEditForm.emiTenureMonths);
        payload.dueAmount = Number(directEditForm.dueAmount);
        if (directEditForm.nextEMIDueDate) payload.nextEMIDueDate = directEditForm.nextEMIDueDate;
      }

      const res = await updateAdminMember(selectedMember.memberId, payload);
      const updated = res.member || res.profile;
      triggerToast(`Member ${selectedMember.memberId} updated successfully.`);
      setShowDirectEditModal(false);
      if (updated) {
        setSelectedMember(updated);
        setMembers((prev) => prev.map((m) => (m.memberId === updated.memberId ? updated : m)));
      }
    } catch (err) {
      triggerToast(err.message || 'Direct edit failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Booking note
  const handleAddBookingNoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !bookingNoteText.trim()) return;
    try {
      const res = await addBookingNote(selectedBooking.id || selectedBooking._id, bookingNoteText.trim());
      triggerToast('Staff note recorded');
      setSelectedBooking(res.booking);
      setBookingNoteText('');
      fetchAdminBookings().then(setBookings).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to add note', 'error');
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      triggerToast(`Booking status set to ${status}`);
      fetchAdminBookings().then(setBookings).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to update booking status', 'error');
    }
  };

  // Member request ticket status
  const handleUpdateTicketStatus = async (id, status) => {
    try {
      await updateMemberRequestStatus(id, status, mrNote);
      triggerToast(`Ticket updated to ${status}`);
      setMrNote('');
      fetchAdminMemberRequests().then(setMemberRequests).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to update ticket', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-text-secondary">Loading Employee Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-text-primary flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium transition-all animate-in slide-in-from-bottom-3 ${
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Staff Specialist Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasPerm('create_member') && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-xs transition-colors"
                title="Register New Member"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Register New Member</span>
              </button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-text-primary">{currentUser?.name || 'Staff Member'}</p>
              <p className="text-[11px] text-text-tertiary">{currentUser?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl border border-border transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Employee Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none flex gap-1 border-t border-border/50 py-1.5 bg-white">
          {[
            { id: 'members', label: 'Members Directory', icon: Users, perm: ['view_members', 'create_member'] },
            {
              id: 'my-change-requests',
              label: `My Change Requests (${myChangeRequests.length})`,
              icon: FileEdit,
              perm: null,
            },
            {
              id: 'bookings',
              label: `Booking Enquiries (${bookings.length})`,
              icon: CalendarCheck,
              perm: 'manage_bookings',
            },
            {
              id: 'member-tickets',
              label: `Member Inquiries (${memberRequests.length})`,
              icon: MessageSquare,
              perm: null,
            },
            {
              id: 'permissions-info',
              label: 'My Assigned Privileges',
              icon: Shield,
              perm: null,
            },
            {
              id: 'availability',
              label: `Trip Calendar (${availabilities.length})`,
              icon: Calendar,
              perm: null,
            },
          ].map((tab) => {
            if (tab.perm) {
              const permsToCheck = Array.isArray(tab.perm) ? tab.perm : [tab.perm];
              if (!permsToCheck.some((p) => hasPerm(p))) return null;
            }
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-accent-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* ============================== TAB 1: MEMBERS DIRECTORY ============================== */}
        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Member Records Operations</h1>
                <p className="text-sm text-text-secondary">
                  Look up member accounts, inspect remaining room nights, review travel card status, and request
                  updates.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {hasPerm('create_member') && (
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register New Member</span>
                  </button>
                )}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-amber-800">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Package changes require Master Head approval</span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search Member ID, name, or phone..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMembersSearch(1)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-surface-50 rounded-xl border border-border focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={memberPackageFilter}
                  onChange={(e) => setMemberPackageFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-surface-50 rounded-xl border border-border text-text-secondary"
                >
                  <option value="">All Tiers (7 Tiers)</option>
                  <option value="Titanium">Titanium</option>
                  <option value="Platinum+">Platinum+</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold Plus">Gold Plus</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver Plus">Silver Plus</option>
                  <option value="Silver">Silver</option>
                </select>

                <select
                  value={memberStatusFilter}
                  onChange={(e) => setMemberStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-surface-50 rounded-xl border border-border text-text-secondary font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Hold">Hold</option>
                  <option value="Cancel">Cancel</option>
                </select>

                <button
                  onClick={() => handleMembersSearch(1)}
                  className="px-4 py-2 bg-text-primary text-white text-xs font-semibold rounded-xl hover:bg-black"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-xs">
                  <thead className="bg-surface-50 text-text-tertiary font-bold uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3.5 px-4">Member ID</th>
                      <th className="py-3.5 px-4">Registered Name</th>
                      <th className="py-3.5 px-4">Membership Status</th>
                      <th className="py-3.5 px-4">Tier</th>
                      <th className="py-3.5 px-4">Available Nights</th>
                      <th className="py-3.5 px-4">Travel Card</th>
                      <th className="py-3.5 px-4">Balance</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {members.map((m) => (
                      <tr key={m.memberId} className="hover:bg-surface-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-accent-primary">{m.memberId}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-text-primary">{m.registeredName || m.userId?.name}</div>
                          <div className="text-[11px] text-text-tertiary">{m.email || m.userId?.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              (m.membershipStatus || m.status) === 'Open' || (m.membershipStatus || m.status) === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : (m.membershipStatus || m.status) === 'Close'
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : (m.membershipStatus || m.status) === 'Deactive'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                (m.membershipStatus || m.status) === 'Open' || (m.membershipStatus || m.status) === 'Active'
                                  ? 'bg-emerald-500'
                                  : (m.membershipStatus || m.status) === 'Close'
                                  ? 'bg-slate-500'
                                  : (m.membershipStatus || m.status) === 'Deactive'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            {m.membershipStatus || m.status || 'Open'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              m.packageType === 'Gold'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <Award className="w-3 h-3" />
                            {m.packageType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-text-primary">{m.nightsAvailable ?? m.availableNights ?? 0} nights</td>
                        <td className="py-3.5 px-4">
                          {m.travelCardBenefit ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700">
                              <XCircle className="w-3 h-3 text-red-600" />
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-red-600">
                          AED {m.outstandingBalance?.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedMember(m)}
                              className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-accent-primary"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Permitted Member Edit */}
                            {hasPerm('edit_member_details') && (
                              <button
                                onClick={() => handleOpenDirectEdit(m)}
                                className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit Member Details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            {/* Request Package Change button for all staff */}
                            <button
                              onClick={() => {
                                setCrTargetMember(m);
                                setCrField('packageType');
                                setCrNewValue(m.packageType === 'Gold' ? 'Silver' : 'Gold');
                                setShowChangeRequestModal(true);
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs"
                            >
                              <FileEdit className="w-3 h-3 text-amber-600" />
                              <span>Request Package Change</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-text-tertiary">
                          No members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 bg-surface-50 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <div>
                  Showing {members.length} of {membersPagination.total} members (Page {membersPagination.page} of{' '}
                  {membersPagination.pages})
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={membersPagination.page <= 1}
                    onClick={() => handleMembersSearch(membersPagination.page - 1)}
                    className="p-1.5 rounded-lg border border-border bg-white disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={membersPagination.page >= membersPagination.pages}
                    onClick={() => handleMembersSearch(membersPagination.page + 1)}
                    className="p-1.5 rounded-lg border border-border bg-white disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Member View Drawer */}
        {selectedMember && !showChangeRequestModal && !showDirectEditModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-primary">
                    {selectedMember.registeredName || selectedMember.userId?.name}
                  </h3>
                  <span className="font-mono text-xs font-bold text-accent-primary bg-accent-primary-light px-2 py-0.5 rounded-full">
                    {selectedMember.memberId}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary">
                  {selectedMember.email || selectedMember.userId?.email} • {selectedMember.phone}
                </p>
                {selectedMember.address && (
                  <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-accent-primary shrink-0" /> {selectedMember.address}
                  </p>
                )}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-surface-50 p-4 rounded-2xl border border-border">
                <div>
                  <span className="text-text-tertiary">Tier</span>
                  <p className="font-bold text-text-primary mt-0.5">{selectedMember.packageType}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Available Nights</span>
                  <p className="font-bold text-accent-primary mt-0.5">{selectedMember.nightsAvailable} Nights</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Travel Card Benefit</span>
                  <p className="font-bold text-emerald-600 mt-0.5">
                    {selectedMember.travelCardBenefit ? 'Included' : 'None'}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Outstanding Balance</span>
                  <p className="font-bold text-red-600 mt-0.5">
                    AED {selectedMember.outstandingBalance?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Registration Timestamp</span>
                  <p className="font-semibold text-text-primary mt-0.5 text-[11px]">
                    {selectedMember.registrationDate || selectedMember.createdAt ? (
                      new Date(selectedMember.registrationDate || selectedMember.createdAt).toLocaleString('en-GB', {
                        timeZone: 'Asia/Dubai',
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) + ' (UAE)'
                    ) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="text-xs">
                <span className="font-semibold text-text-secondary block mb-1">Contract Perks:</span>
                <p className="bg-surface-50 p-3 rounded-xl border border-border text-text-primary">
                  {selectedMember.extraOffers || 'Standard package amenities apply.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                {hasPerm('edit_member_details') && (
                  <button
                    onClick={() => handleOpenDirectEdit(selectedMember)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Member Details</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setCrTargetMember(selectedMember);
                    setCrField('nightsAvailable');
                    setCrNewValue(selectedMember.nightsAvailable);
                    setShowChangeRequestModal(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>Request Package Change</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal (for authorized employees with create_member) */}
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Register New Member</h3>
                  <p className="text-xs text-text-secondary">
                    Create unique Member ID, configure package tier, and record initial membership contract.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-text-secondary">Member ID (Login Identifier) *</label>
                      <button
                        type="button"
                        onClick={() =>
                          setAddMemberForm((prev) => ({
                            ...prev,
                            memberId: `NEX-M-${Math.floor(2000 + Math.random() * 8000)}`,
                          }))
                        }
                        className="text-[10px] text-accent-primary hover:underline font-bold"
                      >
                        Auto-Generate ID
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NEX-M-2026"
                      value={addMemberForm.memberId}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, memberId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-mono font-bold uppercase focus:border-accent-primary"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-text-secondary">Initial Password *</label>
                      <span className="text-[10px] text-text-muted">Min 4 chars (Default: Member123!)</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Member123!"
                      value={addMemberForm.password}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Johnathan Davis"
                      value={addMemberForm.name}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={addMemberForm.email}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+971 50 123 4567"
                      value={addMemberForm.phone}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-50 p-3 rounded-2xl border border-border">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Membership Status *</label>
                    <select
                      value={addMemberForm.membershipStatus || 'Active'}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, membershipStatus: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-border font-bold text-accent-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="InActive">InActive</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Hold">Hold</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Package Tier *</label>
                    <select
                      value={addMemberForm.packageType}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, packageType: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-border font-bold"
                    >
                      <option value="Titanium">Titanium</option>
                      <option value="Platinum+">Platinum+</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Gold Plus">Gold Plus</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver Plus">Silver Plus</option>
                      <option value="Silver">Silver</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Travel Card Benefit *</label>
                    <select
                      value={addMemberForm.travelCardBenefit ? 'yes' : 'no'}
                      onChange={(e) =>
                        setAddMemberForm({ ...addMemberForm, travelCardBenefit: e.target.value === 'yes' })
                      }
                      className="w-full px-2.5 py-1.5 rounded-xl border border-border font-bold"
                    >
                      <option value="yes">Yes (Included)</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Tenure Period</label>
                    <input
                      type="text"
                      value={addMemberForm.tenurePeriod}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, tenurePeriod: e.target.value })}
                      placeholder="e.g. 3 Years"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-border"
                    />
                  </div>
                </div>

                {/* Night Entitlements Calculation Section */}
                <div className="bg-surface-50 p-3.5 rounded-2xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary flex items-center gap-1.5 text-xs">
                      <Calendar className="w-4 h-4 text-accent-primary" />
                      <span>Night Entitlements & Usage Calculation</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const allotted = Number(addMemberForm.allottedNights || 0);
                        const used = Number(addMemberForm.usedNights || 0);
                        const avail = Math.max(0, allotted - used);
                        setAddMemberForm((prev) => ({
                          ...prev,
                          nightsAvailable: avail,
                        }));
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-accent-primary text-white hover:bg-accent-primary-hover rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Calculate Used Nights</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Total Allotted Nights *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={addMemberForm.allottedNights}
                        onChange={(e) => {
                          const val = e.target.value;
                          const allotted = Number(val || 0);
                          const used = Number(addMemberForm.usedNights || 0);
                          setAddMemberForm({
                            ...addMemberForm,
                            allottedNights: val,
                            nightsAvailable: Math.max(0, allotted - used),
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-border font-bold text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Previously Used Nights</label>
                      <input
                        type="number"
                        min="0"
                        value={addMemberForm.usedNights}
                        onChange={(e) => {
                          const val = e.target.value;
                          const used = Number(val || 0);
                          const allotted = Number(addMemberForm.allottedNights || 0);
                          setAddMemberForm({
                            ...addMemberForm,
                            usedNights: val,
                            nightsAvailable: Math.max(0, allotted - used),
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-border font-bold text-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Remaining Available Nights</label>
                      <div className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs flex items-center justify-between ${
                        Number(addMemberForm.usedNights || 0) > Number(addMemberForm.allottedNights || 0)
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'bg-white border-border text-emerald-600'
                      }`}>
                        <span>{Math.max(0, Number(addMemberForm.allottedNights || 0) - Number(addMemberForm.usedNights || 0))} Nights</span>
                        <span className="text-[10px] text-text-tertiary">({addMemberForm.allottedNights || 0} - {addMemberForm.usedNights || 0})</span>
                      </div>
                    </div>
                  </div>
                  {Number(addMemberForm.usedNights || 0) > Number(addMemberForm.allottedNights || 0) && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Warning: Used nights exceed allotted nights! Available nights is capped at 0.</span>
                    </p>
                  )}
                </div>

                {/* Financial & Payment Method Details */}
                <div className="bg-surface-50 p-3.5 rounded-2xl border border-border space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Total Product Price (AED) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={addMemberForm.productPrice}
                        onChange={(e) => setAddMemberForm({ ...addMemberForm, productPrice: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-border font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Initial Down Payment (AED) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={addMemberForm.initialPaidAmount}
                        onChange={(e) => setAddMemberForm({ ...addMemberForm, initialPaidAmount: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-border text-emerald-600 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Estimated Balance</label>
                      <div className="px-2.5 py-1.5 rounded-xl bg-white border border-border font-bold text-red-600">
                        AED {Math.max(0, Number(addMemberForm.productPrice) - Number(addMemberForm.initialPaidAmount)).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {Number(addMemberForm.initialPaidAmount || 0) > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
                      <div>
                        <label className="block font-semibold text-text-secondary mb-1">Payment Method (Down Payment) *</label>
                        <select
                          value={addMemberForm.paymentMethod || 'Bank Transfer'}
                          onChange={(e) => setAddMemberForm({ ...addMemberForm, paymentMethod: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-border font-semibold text-text-primary"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="Card Machine / POS (Card Swipe)">Card Machine / POS (Card Swipe)</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Online Payment">Online Payment</option>
                          <option value="Payment Link">Payment Link</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-text-secondary mb-1">Payment Reference / Transaction ID</label>
                        <input
                          type="text"
                          placeholder="e.g. POS Slip # / Bank Ref / Cheque #"
                          value={addMemberForm.paymentReference || ''}
                          onChange={(e) => setAddMemberForm({ ...addMemberForm, paymentReference: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-border font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Extra Offers & Perks</label>
                  <input
                    type="text"
                    value={addMemberForm.extraOffers}
                    onChange={(e) => setAddMemberForm({ ...addMemberForm, extraOffers: e.target.value })}
                    placeholder="Airport Transfer, VIP Lounge, Travel Concierge"
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-4 py-2 text-text-secondary hover:bg-surface-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {actionLoading ? 'Registering...' : 'Register Member Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Request Modal */}
        {showChangeRequestModal && crTargetMember && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Request Package & Membership Update</h3>
                  <p className="text-xs text-text-secondary">
                    Member: <strong>{crTargetMember.memberId}</strong> ({crTargetMember.registeredName || crTargetMember.name || 'Member'}) • Current Tier: <strong>{crTargetMember.packageType}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowChangeRequestModal(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitChangeRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Field to Update *</label>
                  <select
                    value={crField}
                    onChange={(e) => {
                      setCrField(e.target.value);
                      if (e.target.value === 'nightsAvailable') setCrNewValue(crTargetMember.nightsAvailable);
                      if (e.target.value === 'packageType') setCrNewValue(crTargetMember.packageType);
                      if (e.target.value === 'membershipStatus') setCrNewValue(crTargetMember.membershipStatus || 'Open');
                      if (e.target.value === 'travelCardBenefit')
                        setCrNewValue(crTargetMember.travelCardBenefit ? 'yes' : 'no');
                      if (e.target.value === 'extraOffers') setCrNewValue(crTargetMember.extraOffers || '');
                      if (e.target.value === 'tenurePeriod') setCrNewValue(crTargetMember.tenurePeriod || '');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                  >
                    <option value="nightsAvailable">Available Nights Pool</option>
                    <option value="packageType">Package Tier (All 7 Tiers)</option>
                    <option value="membershipStatus">Membership Status (Open, Close, Deactive, Cancel)</option>
                    <option value="travelCardBenefit">Travel Card Benefit (Yes / No)</option>
                    <option value="extraOffers">Contract Extra Offers</option>
                    <option value="tenurePeriod">Tenure Period</option>
                    <option value="phone">Registered Contact Phone</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Proposed New Value *</label>
                  {crField === 'membershipStatus' ? (
                    <select
                      value={crNewValue}
                      onChange={(e) => setCrNewValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold text-accent-primary"
                    >
                      <option value="Open">Open</option>
                      <option value="Close">Close</option>
                      <option value="Deactive">Deactive</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  ) : crField === 'packageType' ? (
                    <select
                      value={crNewValue}
                      onChange={(e) => setCrNewValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    >
                      <option value="Titanium">Titanium</option>
                      <option value="Platinum+">Platinum+</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Gold Plus">Gold Plus</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver Plus">Silver Plus</option>
                      <option value="Silver">Silver</option>
                    </select>
                  ) : crField === 'travelCardBenefit' ? (
                    <select
                      value={crNewValue}
                      onChange={(e) => setCrNewValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    >
                      <option value="yes">Yes (Included)</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <input
                      type={crField === 'nightsAvailable' ? 'number' : 'text'}
                      required
                      value={crNewValue}
                      onChange={(e) => setCrNewValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Justification / Reason for Master Head Review *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={crReason}
                    onChange={(e) => setCrReason(e.target.value)}
                    placeholder="e.g. Member purchased additional 4 room nights under contract amendment #890"
                    className="w-full p-3 rounded-xl border border-border focus:border-accent-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowChangeRequestModal(false)}
                    className="px-4 py-2 text-text-secondary hover:bg-surface-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit for Approval'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Direct Edit Modal */}
        {showDirectEditModal && selectedMember && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <Edit className="w-5 h-5 text-accent-primary" />
                    <span>Edit Member Profile: {directEditForm.memberId}</span>
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Review and update member details permitted under your employee role.
                  </p>
                </div>
                <button
                  onClick={() => setShowDirectEditModal(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDirectEditSubmit} className="space-y-5 text-xs">
                {/* 1. Personal & Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Personal & Contact Details
                    </h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      Permitted
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={directEditForm.registeredName || ''}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, registeredName: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={directEditForm.email || ''}
                        onChange={(e) => setDirectEditForm({ ...directEditForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={directEditForm.phone || ''}
                        onChange={(e) => setDirectEditForm({ ...directEditForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Physical / Postal Address</label>
                      <input
                        type="text"
                        value={directEditForm.address || ''}
                        onChange={(e) => setDirectEditForm({ ...directEditForm, address: e.target.value })}
                        placeholder="Street, City, Country"
                        className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Membership Plan & Entitlements */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> Membership Plan & Nights Pool
                    </h4>
                    {hasPerm('edit_membership_plans') ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                        Permitted
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Requires &apos;edit_membership_plans&apos; (use Change Request)
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Package Tier</label>
                      <select
                        disabled={!hasPerm('edit_membership_plans')}
                        value={directEditForm.packageType || 'Gold'}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, packageType: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-accent-primary disabled:opacity-60 disabled:bg-surface-100"
                      >
                        <option value="Titanium">Titanium</option>
                        <option value="Platinum+">Platinum+</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Gold Plus">Gold Plus</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver Plus">Silver Plus</option>
                        <option value="Silver">Silver</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Membership Status</label>
                      <select
                        disabled={!hasPerm('update_membership_status') && !hasPerm('edit_member_details')}
                        value={directEditForm.membershipStatus || 'Open'}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, membershipStatus: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold disabled:opacity-60 disabled:bg-surface-100"
                      >
                        <option value="Open">Open</option>
                        <option value="Close">Close</option>
                        <option value="Deactive">Deactive</option>
                        <option value="Cancel">Cancel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Allotted Nights</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!hasPerm('edit_membership_plans')}
                        value={directEditForm.allottedNights ?? 0}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, allottedNights: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Available Nights</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!hasPerm('edit_membership_plans')}
                        value={directEditForm.availableNights ?? 0}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, availableNights: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-accent-primary disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Travel Card Benefit</label>
                      <select
                        disabled={!hasPerm('edit_membership_plans')}
                        value={directEditForm.travelCardBenefit ? 'yes' : 'no'}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, travelCardBenefit: e.target.value === 'yes' })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold disabled:opacity-60 disabled:bg-surface-100"
                      >
                        <option value="yes">Yes (Included)</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Tenure Period</label>
                      <input
                        type="text"
                        disabled={!hasPerm('edit_membership_plans')}
                        value={directEditForm.tenurePeriod || ''}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, tenurePeriod: e.target.value })
                        }
                        placeholder="e.g. 3 Years"
                        className="w-full px-3 py-2 rounded-xl border border-border disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Purchase Date</label>
                      <input
                        type="date"
                        disabled={!hasPerm('edit_membership_plans')}
                        value={directEditForm.purchaseDate || ''}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, purchaseDate: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Used Nights (Audit)</label>
                      <div className="px-3 py-2 rounded-xl bg-surface-50 border border-border font-bold text-text-secondary">
                        {directEditForm.usedNights || 0} Nights
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Extra Offers & Perks</label>
                    <input
                      type="text"
                      disabled={!hasPerm('edit_membership_plans')}
                      value={directEditForm.extraOffers || ''}
                      onChange={(e) => setDirectEditForm({ ...directEditForm, extraOffers: e.target.value })}
                      placeholder="e.g. Airport Transfer, VIP Lounge"
                      className="w-full px-3 py-2 rounded-xl border border-border disabled:opacity-60 disabled:bg-surface-100"
                    />
                  </div>
                </div>

                {/* 3. Financial Breakdown */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Financial Balances & Schedule
                    </h4>
                    {hasPerm('update_financial_info') ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                        Permitted
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Requires &apos;update_financial_info&apos;
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-50 p-3.5 rounded-2xl border border-border">
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Product Price (AED)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!hasPerm('update_financial_info')}
                        value={directEditForm.productPrice ?? 0}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          const paid = Number(directEditForm.totalAmountPaid || 0);
                          setDirectEditForm({
                            ...directEditForm,
                            productPrice: price,
                            outstandingBalance: Math.max(0, price - paid),
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Total Paid (AED)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!hasPerm('update_financial_info')}
                        value={directEditForm.totalAmountPaid ?? 0}
                        onChange={(e) => {
                          const paid = Number(e.target.value);
                          const price = Number(directEditForm.productPrice || 0);
                          setDirectEditForm({
                            ...directEditForm,
                            totalAmountPaid: paid,
                            outstandingBalance: Math.max(0, price - paid),
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-emerald-600 disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Outstanding Balance (AED)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!hasPerm('update_financial_info')}
                        value={directEditForm.outstandingBalance ?? 0}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, outstandingBalance: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-rose-600 disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Payment Status</label>
                      <select
                        disabled={!hasPerm('update_financial_info')}
                        value={directEditForm.paymentStatus || 'Up to Date'}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, paymentStatus: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold disabled:opacity-60 disabled:bg-surface-100"
                      >
                        <option value="Up to Date">Up to Date</option>
                        <option value="Due Soon">Due Soon</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Fully Paid">Fully Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Has Active EMI?</label>
                      <select
                        disabled={!hasPerm('update_financial_info')}
                        value={directEditForm.hasEMI ? 'yes' : 'no'}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, hasEMI: e.target.value === 'yes' })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold disabled:opacity-60 disabled:bg-surface-100"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Monthly EMI (AED)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!hasPerm('update_financial_info')}
                        value={directEditForm.emiAmount ?? 0}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, emiAmount: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">EMI Tenure (Months)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!hasPerm('update_financial_info')}
                        value={directEditForm.emiTenureMonths ?? 12}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, emiTenureMonths: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Current Due Amount (AED)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!hasPerm('update_financial_info')}
                        value={directEditForm.dueAmount ?? 0}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, dueAmount: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-amber-600 disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-semibold text-text-secondary mb-1">Next EMI Due Date</label>
                      <input
                        type="date"
                        disabled={!hasPerm('update_financial_info')}
                        value={directEditForm.nextEMIDueDate || ''}
                        onChange={(e) =>
                          setDirectEditForm({ ...directEditForm, nextEMIDueDate: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border disabled:opacity-60 disabled:bg-surface-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowDirectEditModal(false)}
                    className="px-4 py-2 text-text-secondary hover:bg-surface-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{actionLoading ? 'Saving Changes...' : 'Save Member Details'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================== TAB 2: MY CHANGE REQUESTS ============================== */}
        {activeTab === 'my-change-requests' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">My Submitted Change Requests</h1>
              <p className="text-sm text-text-secondary">
                Track status and feedback for member record changes submitted for Master Head review.
              </p>
            </div>

            <div className="space-y-4">
              {myChangeRequests.map((cr) => (
                <div
                  key={cr.id || cr._id}
                  className="bg-white rounded-2xl border border-border p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent-primary bg-accent-primary-light px-2.5 py-0.5 rounded-full">
                      Member: {cr.memberProfileId?.memberId || cr.targetId || 'NEX-M'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cr.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : cr.status === 'Rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {cr.status}
                    </span>
                  </div>

                  <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-50 p-3 rounded-xl border border-border">
                    <div>
                      <span className="text-[10px] text-text-tertiary block font-semibold">Current</span>
                      <pre className="font-mono text-[11px] text-text-secondary whitespace-pre-wrap">
                        {JSON.stringify(cr.currentValues || cr.currentValue || {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block font-semibold">Proposed Change</span>
                      <pre className="font-mono text-[11px] text-accent-primary font-bold whitespace-pre-wrap">
                        {JSON.stringify(cr.proposedChanges || cr.proposedValue || {}, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Submission Reason:</span> {cr.reason}
                  </div>

                  {cr.reviewNotes && (
                    <div className="text-xs bg-red-50 text-red-800 p-2.5 rounded-xl border border-red-200">
                      <span className="font-bold">Master Head Feedback:</span> {cr.reviewNotes}
                    </div>
                  )}

                  <div className="text-[11px] text-text-tertiary pt-1">
                    Submitted: {new Date(cr.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
              {myChangeRequests.length === 0 && (
                <div className="bg-white rounded-2xl border border-border p-12 text-center text-text-tertiary text-xs">
                  You have not submitted any change requests yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================== TAB 3: BOOKING ENQUIRIES ============================== */}
        {activeTab === 'bookings' && hasPerm('manage_bookings') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Travel Booking Enquiries</h1>
              <p className="text-sm text-text-secondary">
                Review guest bookings, append operational customer call notes, and update statuses.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="bg-surface-50 text-text-tertiary font-bold uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Ref</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Date & Guests</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((b) => (
                      <tr key={b.id || b._id} className="hover:bg-surface-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-accent-primary">
                          {b.bookingReference || b.enquiryNumber || b.id || b._id}
                        </td>
                        <td className="py-3 px-4 font-medium text-text-primary">
                          <div>
                            {b.fullName || b.customerName || `${b.firstName || ''} ${b.lastName || ''}`.trim() || 'Guest'}
                          </div>
                          <div className="text-[11px] text-text-tertiary">
                            {b.email} • {b.phone}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {b.destinationName || b.destinationOrPackage || 'Custom Tour'}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {b.departureDate || b.travelDate || 'Flexible'} • {b.guests || (b.adults ? `${b.adults} Guests` : '2 Guests')}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={b.status || 'Pending'}
                            onChange={(e) => handleUpdateBookingStatus(b.id || b._id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-border bg-surface-50 text-xs font-semibold"
                          >
                            <option value="Pending">Pending</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-accent-primary"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-text-tertiary">
                          No booking enquiries assigned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Selected Booking Drawer */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-bold text-text-primary">
                  Booking Enquiry #{selectedBooking.bookingReference || selectedBooking.enquiryNumber || selectedBooking.id || selectedBooking._id}
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs bg-surface-50 p-3.5 rounded-xl border border-border space-y-1">
                <p>
                  <span className="font-semibold text-text-primary">Customer:</span>{' '}
                  {selectedBooking.fullName || selectedBooking.customerName || `${selectedBooking.prefix || ''} ${selectedBooking.firstName || ''} ${selectedBooking.lastName || ''}`.trim() || 'Guest'}
                </p>
                <p>
                  <span className="font-semibold text-text-primary">Contact:</span> {selectedBooking.email} •{' '}
                  {selectedBooking.phone || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold text-text-primary">Destination:</span>{' '}
                  {selectedBooking.destinationName || selectedBooking.destinationOrPackage || 'Custom Trip'}
                </p>
                {(selectedBooking.specialRequests || selectedBooking.activitiesRequired || selectedBooking.notes) && (
                  <p className="pt-1 text-text-secondary italic">
                    "{selectedBooking.specialRequests || selectedBooking.activitiesRequired || selectedBooking.notes}"
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-bold text-text-primary">Notes</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(selectedBooking.internalNotes || []).map((n, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-surface-50 text-xs border border-border">
                      <span className="font-semibold text-text-primary">{n.authorName}:</span> {n.note}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddBookingNoteSubmit} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={bookingNoteText}
                    onChange={(e) => setBookingNoteText(e.target.value)}
                    placeholder="Add call/follow-up note..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-border"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent-primary text-white text-xs font-bold rounded-xl"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB 4: MEMBER TICKETS ============================== */}
        {activeTab === 'member-tickets' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Member Inquiries & Tickets</h1>
              <p className="text-sm text-text-secondary">
                Track and respond to member portal inquiries with 24-hour SLA commitment.
              </p>
            </div>

            <div className="space-y-4">
              {memberRequests.map((req) => (
                <div
                  key={req.id || req._id}
                  className="bg-white rounded-2xl border border-border p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent-primary bg-accent-primary-light px-2.5 py-0.5 rounded-full">
                        {req.memberProfileId?.memberId || 'NEX-M'}
                      </span>
                      <span className="text-xs font-bold text-text-primary">{req.subject}</span>
                    </div>
                    <select
                      value={req.status}
                      onChange={(e) => handleUpdateTicketStatus(req.id || req._id, e.target.value)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-border bg-surface-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <p className="text-xs text-text-secondary bg-surface-50 p-3 rounded-xl border border-border leading-relaxed">
                    {req.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                    <span className="inline-flex items-center gap-1 text-purple-600 font-semibold">
                      <Clock className="w-3 h-3" /> 24h SLA Target
                    </span>
                    <span>Received: {new Date(req.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {memberRequests.length === 0 && (
                <div className="bg-white rounded-2xl border border-border p-12 text-center text-text-tertiary text-xs">
                  No member inquiries currently assigned.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================== TAB 5: MY ASSIGNED PRIVILEGES ============================== */}
        {activeTab === 'permissions-info' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Staff Authorization & Governance</h1>
              <p className="text-sm text-text-secondary">
                Overview of granted operational capabilities authorized by the Master Head administrator.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {currentUser?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">{currentUser?.name}</h3>
                  <p className="text-xs text-text-tertiary">{currentUser?.email} • Employee Role</p>
                </div>
              </div>

              {hasPerm('create_member') && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">Member Registration Authorized</h4>
                      <p className="text-[11px] text-emerald-700">
                        You have direct authorization to register new membership accounts into the Nexworld Travel system.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Member</span>
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Your Permission Matrix:</h4>
                    <p className="text-[11px] text-text-secondary">
                      Active operational permissions assigned by Master Head ({permissions.length} of {PERMISSION_OPTIONS.length})
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await loadEmployeeSession();
                      triggerToast('Permissions refreshed from server');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:text-accent-primary hover:bg-surface-50 transition-colors shadow-xs"
                    title="Sync with latest permissions assigned by Master Head"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Permissions</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PERMISSION_OPTIONS.map((p) => {
                    const active = hasPerm(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                          active
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-semibold'
                            : 'bg-surface-50 border-border text-text-tertiary'
                        }`}
                      >
                        <div>
                          <span className="block font-medium">{p.label}</span>
                          <span className="text-[10px] text-text-tertiary">{p.description}</span>
                        </div>
                        {active ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold shrink-0">
                            Granted
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-text-tertiary font-medium shrink-0">
                            Not Granted
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-text-tertiary pt-2">
                Need additional permissions? Contact the Master Head administrator to request permission updates.
              </p>
            </div>
          </div>
        )}

        {/* ============================== TAB 6: TRIP AVAILABILITY CALENDAR ============================== */}
        {activeTab === 'availability' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Trip &amp; Plan Availability Calendar</h1>
                <p className="text-sm text-text-secondary">
                  Live availability directory. Dates marked in <strong className="text-emerald-700">Green</strong> are open for reservation requests by members.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('my-change-requests');
                  triggerToast('Submit your availability modification proposal to Master Head Admin.');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Request Availability Change</span>
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Role-Based Governance Notice:</p>
                <p className="mt-0.5 text-text-secondary">
                  Direct creation and editing of trip periods is reserved for Master Head authority. Employees can inspect all scheduled periods and submit formal change proposals for administrative review.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-primary">Scheduled Travel Periods ({availabilities.length})</h2>
                <span className="text-xs text-emerald-700 font-semibold">Green = Available to Members</span>
              </div>

              {availabilities.length === 0 ? (
                <div className="p-12 text-center text-text-tertiary text-xs">
                  No availability periods currently published.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-50 text-text-secondary border-b border-border font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Trip Title</th>
                        <th className="py-3.5 px-4">Target Member</th>
                        <th className="py-3.5 px-4">Destination</th>
                        <th className="py-3.5 px-4">Dates</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Spots</th>
                        <th className="py-3.5 px-4">Eligible Tiers</th>
                        <th className="py-3.5 px-4 text-right">Change Request</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {availabilities.map((item) => (
                        <tr key={item._id || item.id} className="hover:bg-surface-50/50">
                          <td className="py-3.5 px-4 font-bold text-text-primary">
                            {item.title}
                            <span className="block text-[11px] text-text-tertiary font-normal">
                              {item.planType || 'Holiday Package'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                              {item.memberName || (item.memberId === 'ALL' ? 'All Members' : item.memberId) || 'All Members'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-text-primary">
                            {item.destination || item.destinationOrPlan}
                          </td>
                          <td className="py-3.5 px-4 text-text-secondary">
                            <span className="font-medium text-emerald-700">
                              {new Date(item.startDate).toLocaleDateString()}
                            </span>{' '}
                            &rarr;{' '}
                            <span className="font-medium text-emerald-700">
                              {new Date(item.endDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                item.status === 'Available' || item.isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {item.status || (item.isAvailable !== false ? 'Available' : 'Unavailable')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-text-secondary">
                            <strong className="text-text-primary">{item.availableSlots ?? 10}</strong> / {item.totalSlots ?? 10}
                          </td>
                          <td className="py-3.5 px-4 text-text-tertiary">
                            <span className="line-clamp-1 max-w-[150px]">
                              {item.tierEligibility?.join(', ') || 'All 7 Tiers'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setActiveTab('my-change-requests');
                                triggerToast(`Submit change proposal for ${item.title}`);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-accent-primary hover:bg-surface-50 text-[11px] font-semibold"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              <span>Propose Change</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
