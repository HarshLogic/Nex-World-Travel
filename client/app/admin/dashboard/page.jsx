'use client';

import { useState, useEffect, useMemo } from 'react';
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
  FileText,
  Activity,
  LogOut,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  CreditCard,
  Download,
  RefreshCw,
  Clock,
  Sparkles,
  Award,
  Calendar,
  Lock,
  Mail,
  Phone,
  Check,
  X,
  Send,
  Building,
  ArrowRight,
  TrendingUp,
  Compass,
  Upload,
  EyeOff,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import {
  fetchDashboardMetrics,
  fetchAdminMembers,
  createAdminMember,
  updateAdminMember,
  recordMemberPayment,
  fetchEmployees,
  createEmployee,
  updateEmployeePermissions,
  toggleEmployeeStatus,
  fetchChangeRequests,
  approveChangeRequest,
  rejectChangeRequest,
  fetchAdminBookings,
  updateBookingStatus,
  addBookingNote,
  retryBookingEmail,
  fetchAdminMemberRequests,
  updateMemberRequestStatus,
  createDestination,
  updateDestination,
  deleteDestination,
  fetchDestinations,
  getDestinationImageUrl,
  getActivityImageUrl,
  createActivity,
  updateActivity,
  deleteActivity,
  fetchActivities,
  uploadActivityImage,
  uploadMedia,
  fetchTerms,
  updateTerms,
  fetchAvailabilities,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from '../../../lib/api';
import { getAuthUser, clearAuth } from '../../../lib/auth';
import { PERMISSION_OPTIONS } from '../../../lib/permissions';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Overview metrics state
  const [metrics, setMetrics] = useState(null);

  // Members state
  const [members, setMembers] = useState([]);
  const [membersPagination, setMembersPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPackageFilter, setMemberPackageFilter] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Add Member Form
  const [addMemberForm, setAddMemberForm] = useState({
    memberId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    packageType: 'Gold',
    nightsAvailable: 14,
    extraOffers: 'Airport Transfer, VIP Lounge, Travel Concierge',
    tenurePeriod: '3 Years',
    travelCardBenefit: true,
    purchaseDate: new Date().toISOString().split('T')[0],
    productPrice: 12500,
    initialPaidAmount: 5000,
    membershipStatus: 'Open',
    hasEmi: true,
    emiAmount: 1250,
    emiFrequency: 'Monthly',
    nextEmiDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueAmount: 1250,
  });

  // Detailed Edit Member Form
  const [editMemberForm, setEditMemberForm] = useState({
    memberId: '',
    registeredName: '',
    email: '',
    phone: '',
    address: '',
    packageType: 'Gold',
    membershipStatus: 'Open',
    tenurePeriod: '3 Years',
    purchaseDate: '',
    allottedNights: 14,
    availableNights: 14,
    usedNights: 0,
    travelCardBenefit: true,
    extraOffers: '',
    productPrice: 12500,
    totalAmountPaid: 0,
    outstandingBalance: 12500,
    hasEMI: false,
    emiAmount: 0,
    emiTenureMonths: 12,
    nextEMIDueDate: '',
    dueAmount: 0,
    paymentStatus: 'Up to Date',
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: '',
    membershipStatus: '',
  });

  // Employees state
  const [employees, setEmployees] = useState([]);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeePermissionsForm, setEmployeePermissionsForm] = useState([]);
  const [addEmployeeForm, setAddEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    permissions: ['view_members', 'create_member_change_request', 'manage_bookings'],
  });

  // Change Requests state
  const [changeRequests, setChangeRequests] = useState([]);
  const [crStatusFilter, setCrStatusFilter] = useState('');
  const [rejectNotesModal, setRejectNotesModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Destinations state
  const [destinations, setDestinations] = useState([]);
  const [destCategoryFilter, setDestCategoryFilter] = useState('');
  const [showAddDestModal, setShowAddDestModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [destForm, setDestForm] = useState({
    title: '',
    country: '',
    region: 'Asia',
    category: 'Dream Destinations',
    shortDescription: '',
    description: '',
    price: 1999,
    duration: '7 Days / 6 Nights',
    rating: 4.9,
    imageUrl: '/images/destinations/tokyo.jpg',
    displayOrder: 1,
    publicationStatus: 'published',
    featured: true,
    isTopDestination: false,
    isActive: true,
  });

  // Activities state
  const [activities, setActivities] = useState([]);
  const [actCategoryFilter, setActCategoryFilter] = useState('');
  const [actSearchQuery, setActSearchQuery] = useState('');
  const [showAddActModal, setShowAddActModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [previewActivity, setPreviewActivity] = useState(null);
  const [actForm, setActForm] = useState({
    title: '',
    category: 'Desert & Safari',
    region: 'Middle East / UAE',
    location: '',
    duration: '4 hours',
    intensity: 'Moderate',
    shortDescription: '',
    description: '',
    imageUrl: '',
    displayOrder: 1,
    publicationStatus: 'published',
    highlights: '',
    featured: false,
  });

  // Image Uploading & Deletion Dialog
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingNoteText, setBookingNoteText] = useState('');

  // Member Support Requests state
  const [memberRequests, setMemberRequests] = useState([]);
  const [mrStatusFilter, setMrStatusFilter] = useState('');
  const [selectedMemberRequest, setSelectedMemberRequest] = useState(null);
  const [mrResponseNote, setMrResponseNote] = useState('');

  // Terms state
  const [terms, setTerms] = useState(null);
  const [termsContent, setTermsContent] = useState('');

  // Availability state (Master Head Trip & Plan Calendar management)
  const [availabilities, setAvailabilities] = useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    title: '',
    destination: '',
    planType: 'Holiday Package',
    startDate: '',
    endDate: '',
    status: 'Available',
    totalSlots: 10,
    availableSlots: 10,
    tierEligibility: ['Titanium', 'Platinum+', 'Platinum', 'Gold Plus', 'Gold', 'Silver Plus', 'Silver'],
    notes: '',
  });

  // Show toast notification
  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth protection & initial load
  useEffect(() => {
    const user = getAuthUser();
    if (!user || user.role !== 'master_head') {
      router.push('/admin/login');
      return;
    }
    setCurrentUser(user);
    loadAllDashboardData();
  }, [router]);

  const loadAllDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsData, membersData, empsData, crsData, bksData, reqsData, termsData, destsData, availsData, actsData] =
        await Promise.all([
          fetchDashboardMetrics().catch(() => null),
          fetchAdminMembers({ page: 1, limit: 15 }).catch(() => ({ members: [], pagination: {} })),
          fetchEmployees().catch(() => []),
          fetchChangeRequests().catch(() => []),
          fetchAdminBookings().catch(() => []),
          fetchAdminMemberRequests().catch(() => []),
          fetchTerms().catch(() => null),
          fetchDestinations().catch(() => []),
          fetchAvailabilities().catch(() => []),
          fetchActivities().catch(() => []),
        ]);

      if (metricsData) setMetrics(metricsData);
      if (membersData) {
        setMembers(membersData.members || []);
        if (membersData.pagination) setMembersPagination(membersData.pagination);
      }
      if (empsData) setEmployees(empsData);
      if (crsData) setChangeRequests(crsData);
      if (bksData) setBookings(bksData);
      if (reqsData) setMemberRequests(reqsData);
      if (termsData) {
        setTerms(termsData);
        setTermsContent(termsData.content || '');
      }
      if (destsData) setDestinations(destsData);
      if (availsData) setAvailabilities(availsData);
      if (actsData) setActivities(actsData);
    } catch (err) {
      triggerToast(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter members when search or filters change
  const handleMembersSearch = async (page = 1) => {
    try {
      const params = { page, limit: 15 };
      if (memberSearch.trim()) params.search = memberSearch.trim();
      if (memberPackageFilter) params.packageType = memberPackageFilter;
      if (memberStatusFilter) params.status = memberStatusFilter;

      const res = await fetchAdminMembers(params);
      setMembers(res.members || []);
      if (res.pagination) setMembersPagination(res.pagination);
    } catch (err) {
      triggerToast(err.message || 'Error filtering members', 'error');
    }
  };

  const handleSignOut = () => {
    clearAuth();
    router.push('/login');
  };

  // Add Member
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        memberId: addMemberForm.memberId.trim().toUpperCase(),
        name: addMemberForm.name.trim(),
        email: addMemberForm.email.trim(),
        phone: addMemberForm.phone.trim(),
        password: addMemberForm.password,
        packageType: addMemberForm.packageType,
        nightsAvailable: Number(addMemberForm.nightsAvailable),
        availableNights: Number(addMemberForm.nightsAvailable),
        allottedNights: Number(addMemberForm.nightsAvailable),
        membershipStatus: addMemberForm.membershipStatus || 'Open',
        extraOffers: addMemberForm.extraOffers,
        tenurePeriod: addMemberForm.tenurePeriod,
        travelCardBenefit: Boolean(addMemberForm.travelCardBenefit),
        purchaseDate: addMemberForm.purchaseDate,
        productPrice: Number(addMemberForm.productPrice),
        initialPaidAmount: Number(addMemberForm.initialPaidAmount),
        emiDetails: {
          hasEmi: Boolean(addMemberForm.hasEmi),
          emiAmount: Number(addMemberForm.emiAmount),
          frequency: addMemberForm.emiFrequency,
          nextDueDate: addMemberForm.nextEmiDueDate,
          dueAmount: Number(addMemberForm.dueAmount),
        },
      };

      const res = await createAdminMember(payload);
      const newMember = res.member || res.profile;
      triggerToast(`Member ${newMember?.memberId || payload.memberId} registered successfully!`);
      setShowAddMemberModal(false);

      // Instantly unshift to local state for zero-latency visibility
      if (newMember) {
        setMembers((prev) => [newMember, ...prev.filter((m) => m.memberId !== newMember.memberId)]);
        setMembersPagination((prev) => ({ ...prev, total: (prev.total || 0) + 1 }));
      }
      setMemberSearch('');
      setMemberStatusFilter('');
      handleMembersSearch(1);

      // Reload metrics
      fetchDashboardMetrics().then(setMetrics).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to create member', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Member Modal
  const handleOpenEditMember = (member) => {
    if (!member) return;
    const allotted = member.allottedNights !== undefined && member.allottedNights !== null
      ? Number(member.allottedNights)
      : (Number(member.availableNights || 0) + Number(member.usedNights || 0) || 7);
    const used = Number(member.usedNights || 0);
    const available = member.availableNights !== undefined && member.availableNights !== null
      ? Number(member.availableNights)
      : Math.max(0, allotted - used);

    setEditMemberForm({
      memberId: member.memberId,
      registeredName: member.registeredName || member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      packageType: member.packageType || 'Gold',
      membershipStatus: member.membershipStatus || member.status || 'Open',
      tenurePeriod: member.tenurePeriod || '3 Years',
      purchaseDate: member.purchaseDate ? new Date(member.purchaseDate).toISOString().split('T')[0] : '',
      allottedNights: allotted,
      availableNights: available,
      usedNights: used,
      travelCardBenefit: Boolean(member.travelCardBenefit),
      extraOffers: member.extraOffers || '',
      productPrice: Number(member.productPrice || 0),
      totalAmountPaid: Number(member.totalAmountPaid || 0),
      outstandingBalance: Number(member.outstandingBalance || 0),
      hasEMI: Boolean(member.hasEMI || member.emiDetails?.hasEmi),
      emiAmount: Number(member.emiAmount || member.emiDetails?.emiAmount || 0),
      emiTenureMonths: Number(member.emiTenureMonths || member.emiDetails?.totalMonths || 12),
      nextEMIDueDate: member.nextEMIDueDate ? new Date(member.nextEMIDueDate).toISOString().split('T')[0] : '',
      dueAmount: Number(member.dueAmount || 0),
      paymentStatus: member.paymentStatus || 'Up to Date',
    });
    setShowEditMemberModal(true);
  };

  // Submit Edit Member
  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        registeredName: editMemberForm.registeredName.trim(),
        name: editMemberForm.registeredName.trim(),
        email: editMemberForm.email.trim(),
        phone: editMemberForm.phone.trim(),
        address: editMemberForm.address.trim(),
        packageType: editMemberForm.packageType,
        membershipStatus: editMemberForm.membershipStatus,
        tenurePeriod: editMemberForm.tenurePeriod.trim(),
        purchaseDate: editMemberForm.purchaseDate,
        allottedNights: Number(editMemberForm.allottedNights),
        availableNights: Number(editMemberForm.availableNights),
        travelCardBenefit: Boolean(editMemberForm.travelCardBenefit),
        extraOffers: editMemberForm.extraOffers.trim(),
        productPrice: Number(editMemberForm.productPrice),
        totalAmountPaid: Number(editMemberForm.totalAmountPaid),
        outstandingBalance: Number(editMemberForm.outstandingBalance),
        hasEMI: Boolean(editMemberForm.hasEMI),
        emiAmount: Number(editMemberForm.emiAmount),
        emiTenureMonths: Number(editMemberForm.emiTenureMonths),
        nextEMIDueDate: editMemberForm.nextEMIDueDate || null,
        dueAmount: Number(editMemberForm.dueAmount),
        paymentStatus: editMemberForm.paymentStatus,
      };

      const res = await updateAdminMember(editMemberForm.memberId, payload);
      const updated = res.member || res.profile;
      triggerToast(`Member ${editMemberForm.memberId} updated successfully!`);
      setShowEditMemberModal(false);

      if (updated) {
        setSelectedMember(updated);
        setMembers((prev) => prev.map((m) => (m.memberId === updated.memberId ? updated : m)));
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to update member.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Record Payment
  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const res = await recordMemberPayment(selectedMember.memberId, {
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        notes: paymentForm.notes,
        membershipStatus: paymentForm.membershipStatus || selectedMember.membershipStatus || 'Open',
      });

      const updated = res.member || res.profile || selectedMember;
      triggerToast(`Payment of $${paymentForm.amount} recorded! New balance: $${updated.outstandingBalance ?? selectedMember.outstandingBalance}`);
      setShowPaymentModal(false);
      setSelectedMember(updated);
      setMembers((prev) => prev.map((m) => (m.memberId === selectedMember.memberId ? updated : m)));
      setPaymentForm({ amount: '', paymentMethod: 'Bank Transfer', transactionReference: '', notes: '', membershipStatus: '' });
      handleMembersSearch(membersPagination.page);
      fetchDashboardMetrics().then(setMetrics).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to record payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Employee
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await createEmployee({
        name: addEmployeeForm.name.trim(),
        email: addEmployeeForm.email.trim().toLowerCase(),
        password: addEmployeeForm.password,
        permissions: addEmployeeForm.permissions,
      });
      triggerToast(`Employee ${res.user.name} created successfully!`);
      setShowAddEmployeeModal(false);
      setAddEmployeeForm({
        name: '',
        email: '',
        password: '',
        permissions: ['view_members', 'create_member_change_request', 'manage_bookings'],
      });
      fetchEmployees().then(setEmployees).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to create employee', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Employee Permissions
  const handleSavePermissions = async () => {
    if (!selectedEmployee) return;
    setActionLoading(true);
    try {
      const res = await updateEmployeePermissions(selectedEmployee.id || selectedEmployee._id, employeePermissionsForm);
      triggerToast(`Permissions updated for ${selectedEmployee.name}!`);
      setShowPermissionsModal(false);
      fetchEmployees().then(setEmployees).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to update permissions', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleEmployee = async (id, currentActive) => {
    try {
      await toggleEmployeeStatus(id);
      triggerToast(`Employee account is now ${currentActive ? 'Deactivated' : 'Active'}.`);
      fetchEmployees().then(setEmployees).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to toggle employee status', 'error');
    }
  };

  // Change Request Approve
  const handleApproveCR = async (id) => {
    setActionLoading(true);
    try {
      const res = await approveChangeRequest(id);
      triggerToast('Change request approved and member record updated!');
      fetchChangeRequests().then(setChangeRequests).catch(() => {});
      fetchDashboardMetrics().then(setMetrics).catch(() => {});
      handleMembersSearch(membersPagination.page);
    } catch (err) {
      triggerToast(err.message || 'Failed to approve change request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Change Request Reject
  const handleRejectCR = async () => {
    if (!rejectNotesModal) return;
    setActionLoading(true);
    try {
      await rejectChangeRequest(rejectNotesModal.id || rejectNotesModal._id, rejectReason);
      triggerToast('Change request rejected.');
      setRejectNotesModal(null);
      setRejectReason('');
      fetchChangeRequests().then(setChangeRequests).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to reject change request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Booking Update Status & Note
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      triggerToast(`Booking status updated to ${status}`);
      fetchAdminBookings().then(setBookings).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to update booking status', 'error');
    }
  };

  const handleAddBookingNoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !bookingNoteText.trim()) return;
    try {
      const res = await addBookingNote(selectedBooking.id || selectedBooking._id, bookingNoteText.trim());
      triggerToast('Staff note added to booking enquiry');
      setSelectedBooking(res.booking);
      setBookingNoteText('');
      fetchAdminBookings().then(setBookings).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to add note', 'error');
    }
  };

  const handleRetryEmail = async (id) => {
    try {
      await retryBookingEmail(id);
      triggerToast('Email notification dispatched successfully!');
      fetchAdminBookings().then(setBookings).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Email dispatch failed (see booking record)', 'error');
    }
  };

  // Member Support Request Status Update
  const handleUpdateMRStatus = async (id, status) => {
    try {
      const res = await updateMemberRequestStatus(id, status, mrResponseNote);
      triggerToast(`Member request marked as ${status}`);
      setMrResponseNote('');
      fetchAdminMemberRequests().then(setMemberRequests).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to update request', 'error');
    }
  };

  // Media Upload handler with client-side FileReader instant preview
  const handleImageFileChange = async (e, formType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 1MB client-side limit for destinations (Direct MongoDB storage)
    if (formType === 'destination') {
      if (file.size > 1024 * 1024) {
        triggerToast(
          `Image size (${(file.size / 1024).toFixed(1)} KB) exceeds the maximum allowed limit of 1 MB (1024 KB).`,
          'error'
        );
        return;
      }
    } else if (file.size > 5 * 1024 * 1024) {
      triggerToast('Image file size exceeds maximum limit of 5MB.', 'error');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      triggerToast('Unsupported format. Please select a JPG, PNG, or WebP image.', 'error');
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target.result;
      if (formType === 'activity') {
        // Activity: store raw base64 dataUrl directly so it is written straight to MongoDB binary
        setActForm((prev) => ({
          ...prev,
          imageUrl: dataUrl,
          coverImage: dataUrl,
          imageData: dataUrl,
          imageOriginalName: file.name,
        }));
      } else {
        // Destination: store raw base64 dataUrl directly so it is written straight to MongoDB
        setDestForm((prev) => ({
          ...prev,
          imageUrl: dataUrl,
          imageData: dataUrl,
          imageOriginalName: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);

    if (formType === 'destination' || formType === 'activity') {
      triggerToast('Direct image loaded! It will be stored permanently in MongoDB when you save.', 'success');
      return;
    }

    // Upload to server / Cloudinary
    setImageUploading(true);
    try {
      const res = await uploadMedia(file, file.name, file.type);
      if (res.success && res.url) {
        if (formType === 'activity') {
          setActForm((prev) => ({ ...prev, imageUrl: res.url, coverImage: res.url }));
        } else {
          setDestForm((prev) => ({ ...prev, imageUrl: res.url, coverImage: res.url }));
        }
        triggerToast('Image uploaded successfully!');
      }
    } catch (err) {
      triggerToast(err.message || 'Image upload failed. You can paste a manual image URL.', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  // Destinations Management
  const handleSaveDestination = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...destForm,
        description: destForm.description || destForm.shortDescription || destForm.title,
      };

      if (selectedDestination) {
        const res = await updateDestination(selectedDestination.id || selectedDestination._id, payload);
        triggerToast('Destination updated successfully!');
        if (res?.destination) {
          const updatedDoc = res.destination;
          setDestinations((prev) =>
            prev.map((d) =>
              (d.id || d._id || d.slug) === (selectedDestination.id || selectedDestination._id || selectedDestination.slug)
                ? { ...d, ...updatedDoc }
                : d
            )
          );
        }
      } else {
        const res = await createDestination(payload);
        triggerToast('Destination created successfully!');
        if (res?.destination) {
          const newDoc = res.destination;
          setDestinations((prev) => [
            newDoc,
            ...prev.filter(
              (d) => (d.id || d._id || d.slug) !== (newDoc.id || newDoc._id || newDoc.slug)
            ),
          ]);
        }
      }
      setShowAddDestModal(false);
      setSelectedDestination(null);
      fetchDestinations().then((dests) => {
        if (dests && dests.length > 0) setDestinations(dests);
      }).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to save destination', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDestinationStatus = async (dest) => {
    const nextStatus = dest.publicationStatus === 'published' ? 'draft' : 'published';
    try {
      await updateDestination(dest.id || dest._id, { publicationStatus: nextStatus });
      triggerToast(`Destination marked as ${nextStatus}.`);
      setDestinations((prev) =>
        prev.map((d) =>
          (d.id || d._id || d.slug) === (dest.id || dest._id || dest.slug)
            ? { ...d, publicationStatus: nextStatus }
            : d
        )
      );
      fetchDestinations().then((dests) => {
        if (dests && dests.length > 0) setDestinations(dests);
      }).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to update publication status', 'error');
    }
  };

  // Activities Management
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...actForm,
        coverImage: actForm.coverImage || actForm.imageUrl || (selectedActivity ? selectedActivity.coverImage || selectedActivity.imageUrl : ''),
        imageUrl: actForm.imageUrl || actForm.coverImage || (selectedActivity ? selectedActivity.imageUrl || selectedActivity.coverImage : ''),
        highlights:
          typeof actForm.highlights === 'string'
            ? actForm.highlights.split(',').map((s) => s.trim()).filter(Boolean)
            : actForm.highlights || [],
      };

      if (selectedActivity) {
        await updateActivity(selectedActivity.id || selectedActivity._id || selectedActivity.slug, payload);
        triggerToast('Activity updated successfully!');
      } else {
        await createActivity(payload);
        triggerToast('Activity created successfully!');
      }
      setShowAddActModal(false);
      setSelectedActivity(null);
      fetchActivities().then((acts) => {
        if (acts && acts.length > 0) setActivities(acts);
      }).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to save activity', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActivityStatus = async (act) => {
    const nextStatus = act.publicationStatus === 'published' ? 'draft' : 'published';
    try {
      await updateActivity(act.id || act._id || act.slug, { publicationStatus: nextStatus });
      triggerToast(`Activity status changed to ${nextStatus}.`);
      fetchActivities().then(setActivities).catch(() => {});
    } catch (err) {
      triggerToast(err.message || 'Failed to change activity status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const { type, id } = deleteConfirmItem;
    setActionLoading(true);
    try {
      if (type === 'activity') {
        await deleteActivity(id);
        triggerToast('Activity deleted/archived successfully.');
        setActivities((prev) => prev.filter((a) => (a.id || a._id) !== id));
        fetchActivities().then((acts) => {
          if (acts && acts.length > 0) setActivities(acts);
        }).catch(() => {});
      } else {
        await deleteDestination(id);
        triggerToast('Destination archived successfully.');
        setDestinations((prev) => prev.filter((d) => (d.id || d._id) !== id));
        fetchDestinations().then((dests) => {
          if (dests && dests.length > 0) setDestinations(dests);
        }).catch(() => {});
      }
      setDeleteConfirmItem(null);
    } catch (err) {
      triggerToast(err.message || `Failed to delete ${type}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Terms Save
  const handleSaveTerms = async () => {
    setActionLoading(true);
    try {
      const updated = await updateTerms(termsContent);
      setTerms(updated);
      triggerToast('Membership Terms & Conditions updated successfully!');
    } catch (err) {
      triggerToast(err.message || 'Failed to update terms', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Availability Calendar Management Handlers
  const handleOpenAddAvailability = () => {
    setEditingAvailability(null);
    setAvailabilityForm({
      memberId: 'ALL',
      memberName: 'All Members',
      title: '',
      destination: '',
      planType: 'Holiday Package',
      startDate: '',
      endDate: '',
      status: 'Available',
      totalSlots: 10,
      availableSlots: 10,
      tierEligibility: ['Titanium', 'Platinum+', 'Platinum', 'Gold Plus', 'Gold', 'Silver Plus', 'Silver'],
      notes: '',
    });
    setShowAvailabilityModal(true);
  };

  const handleOpenEditAvailability = (item) => {
    setEditingAvailability(item);
    setAvailabilityForm({
      memberId: item.memberId || 'ALL',
      memberName: item.memberName || 'All Members',
      title: item.title,
      destination: item.destination || item.destinationOrPlan || '',
      planType: item.planType || 'Holiday Package',
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      status: item.status || (item.isAvailable !== false ? 'Available' : 'Unavailable'),
      totalSlots: item.totalSlots || 10,
      availableSlots: item.availableSlots || 10,
      tierEligibility: item.tierEligibility || ['Titanium', 'Platinum+', 'Platinum', 'Gold Plus', 'Gold', 'Silver Plus', 'Silver'],
      notes: item.notes || '',
    });
    setShowAvailabilityModal(true);
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    if (!availabilityForm.title || !availabilityForm.destination || !availabilityForm.startDate || !availabilityForm.endDate) {
      return triggerToast('Title, Destination, Start Date, and End Date are required.', 'error');
    }
    const s = new Date(availabilityForm.startDate);
    const ed = new Date(availabilityForm.endDate);
    if (ed <= s) {
      return triggerToast('End Date must be strictly after Start Date.', 'error');
    }

    const payload = {
      ...availabilityForm,
      destinationOrPlan: availabilityForm.destination,
      isAvailable: availabilityForm.status === 'Available',
      memberId: availabilityForm.memberId || 'ALL',
      memberName:
        availabilityForm.memberName ||
        (availabilityForm.memberId && availabilityForm.memberId !== 'ALL'
          ? members.find((m) => m.memberId === availabilityForm.memberId)?.registeredName || availabilityForm.memberId
          : 'All Members'),
    };

    setActionLoading(true);
    try {
      if (editingAvailability) {
        await updateAvailability(editingAvailability._id || editingAvailability.id, payload);
        triggerToast('Trip availability updated successfully!');
      } else {
        await createAvailability(payload);
        triggerToast('New trip availability period published to calendar!');
      }
      setShowAvailabilityModal(false);
      const updated = await fetchAvailabilities();
      setAvailabilities(updated);
    } catch (err) {
      triggerToast(err.message || 'Failed to save availability', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAvailability = async (id) => {
    if (!confirm('Are you sure you want to remove this availability record?')) return;
    setActionLoading(true);
    try {
      await deleteAvailability(id);
      triggerToast('Trip availability record removed.');
      const updated = await fetchAvailabilities();
      setAvailabilities(updated);
    } catch (err) {
      triggerToast(err.message || 'Failed to delete availability', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV Helper
  const exportMembersCSV = () => {
    if (!members.length) return triggerToast('No member records to export', 'error');
    const headers = ['MemberID,Name,Email,Phone,Package,NightsAvailable,TravelCard,ProductPrice,TotalPaid,Balance,Status\n'];
    const rows = members.map((m) =>
      `"${m.memberId}","${m.registeredName || m.userId?.name || ''}","${m.email || m.userId?.email || ''}","${m.phone || ''}","${m.packageType}","${m.nightsAvailable}","${m.travelCardBenefit ? 'Yes' : 'No'}","${m.productPrice}","${m.totalAmountPaid}","${m.outstandingBalance}","${m.status}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexworld-members-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    triggerToast('Member records exported to CSV!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-text-secondary">Loading Master Head Admin Portal...</p>
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

      {/* Top Admin Header Bar */}
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Master Head Admin
              </span>
              <span className="text-xs text-text-tertiary hidden md:inline">Full System Authority</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-text-primary">{currentUser?.name || 'Master Administrator'}</p>
              <p className="text-[11px] text-text-tertiary">{currentUser?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl border border-border transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none flex gap-1 border-t border-border/50 py-1.5 bg-white">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: Activity },
            { id: 'members', label: `Members (${metrics?.totalMembers || membersPagination.total || 0})`, icon: Users },
            { id: 'employees', label: `Employees (${employees.length})`, icon: Shield },
            {
              id: 'change-requests',
              label: `Change Requests ${changeRequests.filter((c) => c.status === 'Pending').length > 0 ? `(${changeRequests.filter((c) => c.status === 'Pending').length})` : ''}`,
              icon: FileEdit,
            },
            { id: 'destinations', label: `Destinations (${destinations.length})`, icon: MapPin },
            { id: 'activities', label: `Activities (${activities.length})`, icon: Compass },
            {
              id: 'bookings',
              label: `Bookings ${bookings.filter((b) => b.status === 'New').length > 0 ? `(${bookings.filter((b) => b.status === 'New').length})` : ''}`,
              icon: CalendarCheck,
            },
            {
              id: 'member-requests',
              label: `Member Inquiries ${memberRequests.filter((r) => r.status === 'Pending').length > 0 ? `(${memberRequests.filter((r) => r.status === 'Pending').length})` : ''}`,
              icon: MessageSquare,
            },
            { id: 'terms', label: 'Terms & Conditions', icon: FileText },
            { id: 'availability', label: `Trip Calendar (${availabilities.length})`, icon: Calendar },
          ].map((tab) => {
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* ============================== TAB 1: OVERVIEW ============================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header intro */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Executive Control Hub</h1>
                <p className="text-sm text-text-secondary">
                  Real-time operations, membership accounts, pending staff approvals, and travel enquiries.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Member</span>
                </button>
                <button
                  onClick={exportMembersCSV}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-text-primary bg-white hover:bg-surface-50 rounded-xl border border-border shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4 text-accent-secondary" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* 8 Primary KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs hover:border-accent-primary/40 transition-colors">
                <div className="flex items-center justify-between text-text-secondary mb-2">
                  <span className="text-xs font-medium">Total Registered Members</span>
                  <Users className="w-4 h-4 text-accent-primary" />
                </div>
                <div className="text-2xl font-black text-text-primary">{metrics?.totalMembers || 0}</div>
                <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{metrics?.activeMembers || 0} active memberships</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs hover:border-accent-primary/40 transition-colors">
                <div className="flex items-center justify-between text-text-secondary mb-2">
                  <span className="text-xs font-medium">Gold vs Silver Tiers</span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-text-primary">
                  {metrics?.goldMembers || 0} <span className="text-xs font-normal text-text-tertiary">/ {metrics?.silverMembers || 0}</span>
                </div>
                <div className="mt-2 text-xs text-text-secondary flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">Gold: {metrics?.goldMembers || 0}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">Silver: {metrics?.silverMembers || 0}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs hover:border-accent-primary/40 transition-colors">
                <div className="flex items-center justify-between text-text-secondary mb-2">
                  <span className="text-xs font-medium">Available Nights Pool</span>
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-text-primary">{metrics?.totalAvailableNights || 0}</div>
                <div className="mt-2 text-xs text-text-tertiary">Collective unredeemed nights</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs hover:border-accent-primary/40 transition-colors">
                <div className="flex items-center justify-between text-text-secondary mb-2">
                  <span className="text-xs font-medium">Outstanding Balance</span>
                  <DollarSign className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-black text-red-600">
                  ${(metrics?.totalOutstandingBalance || 0).toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-emerald-600 font-semibold">
                  Paid: ${(metrics?.totalCollectedRevenue || 0).toLocaleString()}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs hover:border-accent-primary/40 transition-colors">
                <div className="flex items-center justify-between text-text-secondary mb-2">
                  <span className="text-xs font-medium">Pending Change Requests</span>
                  <FileEdit className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">{metrics?.pendingChangeRequests || 0}</div>
                <button
                  onClick={() => setActiveTab('change-requests')}
                  className="mt-2 text-xs text-accent-primary font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Review requests</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs hover:border-accent-primary/40 transition-colors">
                <div className="flex items-center justify-between text-text-secondary mb-2">
                  <span className="text-xs font-medium">New Booking Enquiries</span>
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600">{metrics?.newBookings || 0}</div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="mt-2 text-xs text-accent-primary font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Manage bookings</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs hover:border-accent-primary/40 transition-colors">
                <div className="flex items-center justify-between text-text-secondary mb-2">
                  <span className="text-xs font-medium">Member Support (24h SLA)</span>
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black text-purple-600">{metrics?.pendingMemberRequests || 0}</div>
                <button
                  onClick={() => setActiveTab('member-requests')}
                  className="mt-2 text-xs text-accent-primary font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Respond to members</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs hover:border-accent-primary/40 transition-colors">
                <div className="flex items-center justify-between text-text-secondary mb-2">
                  <span className="text-xs font-medium">Employee Accounts</span>
                  <Shield className="w-4 h-4 text-slate-600" />
                </div>
                <div className="text-2xl font-black text-text-primary">{employees.length}</div>
                <button
                  onClick={() => setActiveTab('employees')}
                  className="mt-2 text-xs text-accent-primary font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Configure permissions</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Urgent Attention Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Pending Change Requests alert banner if any */}
                {changeRequests.filter((c) => c.status === 'Pending').length > 0 && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-bold text-amber-900">
                            {changeRequests.filter((c) => c.status === 'Pending').length} Pending Employee Change
                            Request(s) Require Approval
                          </h3>
                          <p className="text-xs text-amber-700 mt-0.5">
                            Employees have submitted member record updates that require Master Head review.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/admin/approvals"
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shrink-0 flex items-center gap-1 shadow-xs"
                        >
                          <span>Open Approvals Desk</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Member Support Tickets */}
                <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-text-primary">Recent Member Support Tickets</h2>
                      <p className="text-xs text-text-secondary">24-hour response SLA commitment</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('member-requests')}
                      className="text-xs font-semibold text-accent-primary hover:underline"
                    >
                      View all ({memberRequests.length})
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {memberRequests.slice(0, 4).map((ticket) => (
                      <div key={ticket.id || ticket._id} className="p-4 sm:px-6 hover:bg-surface-50 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-accent-primary">
                              {ticket.memberProfileId?.memberId || 'NEX-M'}
                            </span>
                            <span className="text-xs font-semibold text-text-primary">{ticket.subject}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ticket.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : ticket.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-1">{ticket.message}</p>
                      </div>
                    ))}
                    {memberRequests.length === 0 && (
                      <div className="p-8 text-center text-xs text-text-tertiary">No member tickets yet.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Col: System Status & Quick Links */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-border p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-text-primary mb-3">System Health & Security</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-text-secondary">Role Authentication</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enforced (RBAC)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-text-secondary">Password Storage</span>
                      <span className="font-semibold text-text-primary">bcrypt (Salt rounds 10)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-text-secondary">Database Mode</span>
                      <span className="font-semibold text-emerald-600">Active High-Availability</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-text-secondary">Email Dispatch</span>
                      <span className="font-semibold text-blue-600">Nodemailer SMTP + Resilient Logs</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-text-secondary">Terms Version</span>
                      <span className="font-semibold text-text-primary">v{terms?.version || 1}.0 Active</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-accent-primary to-blue-700 rounded-2xl p-5 text-white shadow-md">
                  <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent-secondary" />
                    <span>Member Card Program</span>
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed mb-4">
                    Track luxury benefits, complimentary airport transfers, and Gold/Silver tier nights across up to
                    5,000 members.
                  </p>
                  <button
                    onClick={() => setActiveTab('members')}
                    className="w-full py-2 bg-white text-accent-primary text-xs font-bold rounded-xl hover:bg-surface-50 transition-colors shadow-xs"
                  >
                    Open Member Records Directory
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB 2: MEMBERS ============================== */}
        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Membership Directory</h1>
                <p className="text-sm text-text-secondary">
                  Manage accounts, view financial status, record payments, and inspect tenure details.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportMembersCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-text-secondary bg-white hover:text-text-primary rounded-xl border border-border"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Member</span>
                </button>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by Member ID, Name, Phone, or Email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMembersSearch(1)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-surface-50 rounded-xl border border-border focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={memberPackageFilter}
                  onChange={(e) => {
                    setMemberPackageFilter(e.target.value);
                  }}
                  className="px-3 py-2 text-xs bg-surface-50 rounded-xl border border-border text-text-secondary focus:outline-none focus:border-accent-primary"
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
                  onChange={(e) => {
                    setMemberStatusFilter(e.target.value);
                  }}
                  className="px-3 py-2 text-xs bg-surface-50 rounded-xl border border-border text-text-secondary focus:outline-none focus:border-accent-primary font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Activated</option>
                  <option value="Close">Inactive</option>
                  <option value="Deactive">Deactive</option>
                  <option value="Cancel">Cancel</option>
                </select>

                <button
                  onClick={() => handleMembersSearch(1)}
                  className="px-4 py-2 bg-text-primary text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead className="bg-surface-50 text-text-tertiary font-bold uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3.5 px-4">Member ID</th>
                      <th className="py-3.5 px-4">Registered Name</th>
                      <th className="py-3.5 px-4">Membership Status</th>
                      <th className="py-3.5 px-4">Package</th>
                      <th className="py-3.5 px-4">Nights Left</th>
                      <th className="py-3.5 px-4">Travel Card</th>
                      <th className="py-3.5 px-4">Total Price (AED)</th>
                      <th className="py-3.5 px-4">Paid (AED)</th>
                      <th className="py-3.5 px-4">Balance (AED)</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {members.map((m) => (
                      <tr key={m.memberId} className="hover:bg-surface-50/70 transition-colors">
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <XCircle className="w-3 h-3 text-red-600" />
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-text-primary">
                          AED {m.productPrice?.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                          AED {m.totalAmountPaid?.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-red-600">
                          AED {m.outstandingBalance?.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedMember(m)}
                              className="p-1.5 text-text-secondary hover:text-accent-primary hover:bg-surface-100 rounded-lg transition-colors"
                              title="View Member Dossier"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditMember(m)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Member Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMember(m);
                                setShowPaymentModal(true);
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Record Payment"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-text-tertiary">
                          No members found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="px-4 py-3 bg-surface-50 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <div>
                  Showing {members.length} of {membersPagination.total} members (Page {membersPagination.page} of{' '}
                  {membersPagination.pages})
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={membersPagination.page <= 1}
                    onClick={() => handleMembersSearch(membersPagination.page - 1)}
                    className="p-1.5 rounded-lg border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={membersPagination.page >= membersPagination.pages}
                    onClick={() => handleMembersSearch(membersPagination.page + 1)}
                    className="p-1.5 rounded-lg border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Member Dossier Detail Modal */}
        {selectedMember && !showPaymentModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
              <div className="flex items-start justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent-primary-light text-accent-primary font-black text-lg flex items-center justify-center">
                    {selectedMember.packageType === 'Gold' ? 'G' : 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-text-primary">
                        {selectedMember.registeredName || selectedMember.userId?.name}
                      </h2>
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
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 text-text-tertiary hover:text-text-primary rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Key details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-surface-50 p-3.5 rounded-xl border border-border">
                  <span className="text-text-tertiary">Tier</span>
                  <p className="text-sm font-bold text-text-primary mt-0.5">{selectedMember.packageType}</p>
                </div>
                <div className="bg-surface-50 p-3.5 rounded-xl border border-border">
                  <span className="text-text-tertiary">Night Entitlements</span>
                  <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-accent-primary">
                      {selectedMember.nightsAvailable ?? selectedMember.availableNights ?? 0} Avail
                    </span>
                    <span className="text-[10px] text-text-tertiary">
                      ({selectedMember.allottedNights ?? ((selectedMember.availableNights || 0) + (selectedMember.usedNights || 0))} Allotted / {selectedMember.usedNights || 0} Used)
                    </span>
                  </div>
                </div>
                <div className="bg-surface-50 p-3.5 rounded-xl border border-border">
                  <span className="text-text-tertiary">Travel Card Benefit</span>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                    {selectedMember.travelCardBenefit ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Included
                      </>
                    ) : (
                      'None'
                    )}
                  </p>
                </div>
                <div className="bg-surface-50 p-3.5 rounded-xl border border-border">
                  <span className="text-text-tertiary">Tenure Period</span>
                  <p className="text-sm font-bold text-text-primary mt-0.5">{selectedMember.tenurePeriod}</p>
                </div>
                <div className="bg-surface-50 p-3.5 rounded-xl border border-border">
                  <span className="text-text-tertiary">Purchase Date</span>
                  <p className="text-sm font-bold text-text-primary mt-0.5">
                    {selectedMember.purchaseDate ? new Date(selectedMember.purchaseDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-surface-50 p-3.5 rounded-xl border border-border">
                  <span className="text-text-tertiary">Membership Status</span>
                  <div className="mt-1">
                    <select
                      value={selectedMember.membershipStatus || 'Open'}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          const res = await updateAdminMember(selectedMember.memberId, { membershipStatus: newStatus });
                          const updated = res.member || res.profile || { ...selectedMember, membershipStatus: newStatus };
                          setSelectedMember(updated);
                          setMembers((prev) => prev.map((m) => (m.memberId === selectedMember.memberId ? updated : m)));
                          triggerToast(`Membership status updated to ${newStatus}`);
                        } catch (err) {
                          triggerToast(err.message || 'Failed to update status', 'error');
                        }
                      }}
                      className="text-xs font-bold rounded-lg px-2.5 py-1 border border-border bg-white text-text-primary focus:border-accent-primary"
                    >
                      <option value="Open">Open</option>
                      <option value="Close">Close</option>
                      <option value="Deactive">Deactive</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Box */}
              <div className="bg-[#172033] text-white p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-white/60">Financial Breakdown</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedMember.paymentStatus === 'Fully Paid'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : selectedMember.paymentStatus === 'Overdue'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : selectedMember.paymentStatus === 'Due Soon'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {selectedMember.paymentStatus || 'Up to Date'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[11px] text-white/60">Product Price</span>
                    <p className="text-sm sm:text-base font-bold">AED {selectedMember.productPrice?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/60">Total Paid</span>
                    <p className="text-sm sm:text-base font-bold text-emerald-400">
                      AED {selectedMember.totalAmountPaid?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/60">Outstanding Balance</span>
                    <p className="text-sm sm:text-base font-bold text-red-400">
                      AED {selectedMember.outstandingBalance?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/60">Current Payable / Due</span>
                    <p className={`text-sm sm:text-base font-bold ${
                      (Number(selectedMember.dueAmount) > 0) ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      AED {Number(selectedMember.dueAmount || 0)?.toLocaleString()}
                    </p>
                  </div>
                </div>
                {(selectedMember.hasEMI || selectedMember.emiDetails?.hasEmi) && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/80 flex-wrap gap-2">
                    <span>
                      EMI: AED {selectedMember.emiAmount || selectedMember.emiDetails?.emiAmount || 0} / month ({selectedMember.emiPaidMonths || 0} of {selectedMember.emiTenureMonths || 0} installments paid)
                    </span>
                    <span>
                      Next Due:{' '}
                      {selectedMember.nextEMIDueDate || selectedMember.emiDetails?.nextDueDate
                        ? new Date(selectedMember.nextEMIDueDate || selectedMember.emiDetails?.nextDueDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                )}
              </div>

              {/* Extra Offers */}
              <div>
                <h4 className="text-xs font-bold text-text-primary mb-1">Contract Extra Offers</h4>
                <p className="text-xs text-text-secondary bg-surface-50 p-3 rounded-xl border border-border">
                  {selectedMember.extraOffers || 'Standard package amenities apply.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => handleOpenEditMember(selectedMember)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Member Details</span>
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Record Payment</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {showPaymentModal && selectedMember && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Record Payment</h3>
                  <p className="text-xs text-text-secondary">
                    Credit payment for Member {selectedMember.memberId}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Payment Amount (AED) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent-primary text-sm font-bold"
                  />
                  <p className="text-[11px] text-text-tertiary mt-1">
                    Current Balance: AED {selectedMember.outstandingBalance?.toLocaleString()} | Current Due: AED {(selectedMember.dueAmount || 0)?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  >
                    <option value="Bank Transfer">Bank Transfer / Wire</option>
                    <option value="Credit Card">Credit / Debit Card</option>
                    <option value="Cash">Cash Deposit</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="UPI / Online Gateway">Online Payment Gateway</option>
                    <option value="Tabby">Tabby</option>
                    <option value="Tamara">Tamara</option>
                    <option value="POS Swipe">POS Swipe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Transaction Reference</label>
                  <input
                    type="text"
                    value={paymentForm.transactionReference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                    placeholder="e.g. TXN-998273"
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Membership Status</label>
                  <select
                    value={paymentForm.membershipStatus || selectedMember.membershipStatus || 'Open'}
                    onChange={(e) => setPaymentForm({ ...paymentForm, membershipStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border font-bold text-accent-primary"
                  >
                    <option value="Open">Open</option>
                    <option value="Close">Close</option>
                    <option value="Deactive">Deactive</option>
                    <option value="Cancel">Cancel</option>
                  </select>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    Optionally update the member's status upon recording payment.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Receipt Notes</label>
                  <textarea
                    rows={2}
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder="e.g. Payment towards installment 2"
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-text-secondary hover:bg-surface-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {actionLoading ? 'Recording...' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Register New Member</h3>
                  <p className="text-xs text-text-secondary">
                    Create unique Member ID, assign travel package, set nights, and initialize financial plan.
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
                    <label className="block font-semibold text-text-secondary mb-1">Member ID (Login Identifier) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NEX-M-1002"
                      value={addMemberForm.memberId}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, memberId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-mono font-bold uppercase focus:border-accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Initial Password *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MemberPassword2026!"
                      value={addMemberForm.password}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary"
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

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-surface-50 p-3 rounded-2xl border border-border">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Membership Status *</label>
                    <select
                      value={addMemberForm.membershipStatus || 'Open'}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, membershipStatus: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-border font-bold text-accent-primary"
                    >
                      <option value="Open">Open</option>
                      <option value="Close">Close</option>
                      <option value="Deactive">Deactive</option>
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
                    <label className="block font-semibold text-text-secondary mb-1">Available Nights *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={addMemberForm.nightsAvailable}
                      onChange={(e) => setAddMemberForm({ ...addMemberForm, nightsAvailable: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-border"
                    />
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

                {/* Financial Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface-50 p-3 rounded-2xl border border-border">
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
                    {actionLoading ? 'Creating Member...' : 'Register Member Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detailed Edit Member Modal */}
        {showEditMemberModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <Edit className="w-5 h-5 text-accent-primary" />
                    <span>Edit Member Profile: {editMemberForm.memberId}</span>
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Update member personal details, membership entitlements, and financial plan.
                  </p>
                </div>
                <button
                  onClick={() => setShowEditMemberModal(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditMemberSubmit} className="space-y-5 text-xs">
                {/* 1. Personal & Contact Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Personal & Contact Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editMemberForm.registeredName}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, registeredName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={editMemberForm.email}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={editMemberForm.phone}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Physical / Postal Address</label>
                      <input
                        type="text"
                        value={editMemberForm.address}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, address: e.target.value })}
                        placeholder="Street, City, Country"
                        className="w-full px-3 py-2 rounded-xl border border-border focus:border-accent-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Membership Plan & Entitlements */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Membership Plan & Nights Pool
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Package Tier *</label>
                      <select
                        value={editMemberForm.packageType}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, packageType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-accent-primary"
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
                      <label className="block font-semibold text-text-secondary mb-1">Membership Status *</label>
                      <select
                        value={editMemberForm.membershipStatus}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, membershipStatus: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                      >
                        <option value="Open">Open</option>
                        <option value="Close">Close</option>
                        <option value="Deactive">Deactive</option>
                        <option value="Cancel">Cancel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Allotted Nights *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={editMemberForm.allottedNights}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, allottedNights: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Available Nights *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={editMemberForm.availableNights}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, availableNights: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Travel Card Benefit *</label>
                      <select
                        value={editMemberForm.travelCardBenefit ? 'yes' : 'no'}
                        onChange={(e) =>
                          setEditMemberForm({ ...editMemberForm, travelCardBenefit: e.target.value === 'yes' })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                      >
                        <option value="yes">Yes (Included)</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Tenure Period</label>
                      <input
                        type="text"
                        value={editMemberForm.tenurePeriod}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, tenurePeriod: e.target.value })}
                        placeholder="e.g. 3 Years"
                        className="w-full px-3 py-2 rounded-xl border border-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Purchase Date</label>
                      <input
                        type="date"
                        value={editMemberForm.purchaseDate}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, purchaseDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Used Nights (Audit)</label>
                      <div className="px-3 py-2 rounded-xl bg-surface-50 border border-border font-bold text-text-secondary">
                        {editMemberForm.usedNights || 0} Nights
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Extra Offers & Perks</label>
                    <input
                      type="text"
                      value={editMemberForm.extraOffers}
                      onChange={(e) => setEditMemberForm({ ...editMemberForm, extraOffers: e.target.value })}
                      placeholder="e.g. Airport Transfer, VIP Lounge, Travel Concierge"
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                </div>

                {/* 3. Financial Breakdown & EMI */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Financial Balances & Schedule
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-50 p-3.5 rounded-2xl border border-border">
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Product Price (AED) *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={editMemberForm.productPrice}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          const paid = Number(editMemberForm.totalAmountPaid);
                          setEditMemberForm({
                            ...editMemberForm,
                            productPrice: price,
                            outstandingBalance: Math.max(0, price - paid),
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Total Paid (AED)</label>
                      <input
                        type="number"
                        min="0"
                        value={editMemberForm.totalAmountPaid}
                        onChange={(e) => {
                          const paid = Number(e.target.value);
                          const price = Number(editMemberForm.productPrice);
                          setEditMemberForm({
                            ...editMemberForm,
                            totalAmountPaid: paid,
                            outstandingBalance: Math.max(0, price - paid),
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Outstanding Balance (AED)</label>
                      <input
                        type="number"
                        min="0"
                        value={editMemberForm.outstandingBalance}
                        onChange={(e) =>
                          setEditMemberForm({ ...editMemberForm, outstandingBalance: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-rose-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Payment Status *</label>
                      <select
                        value={editMemberForm.paymentStatus}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, paymentStatus: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                      >
                        <option value="Up to Date">Up to Date</option>
                        <option value="Due Soon">Due Soon</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Fully Paid">Fully Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Has Active EMI? *</label>
                      <select
                        value={editMemberForm.hasEMI ? 'yes' : 'no'}
                        onChange={(e) =>
                          setEditMemberForm({ ...editMemberForm, hasEMI: e.target.value === 'yes' })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold"
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
                        value={editMemberForm.emiAmount}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, emiAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">EMI Tenure (Months)</label>
                      <input
                        type="number"
                        min="0"
                        value={editMemberForm.emiTenureMonths}
                        onChange={(e) =>
                          setEditMemberForm({ ...editMemberForm, emiTenureMonths: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-text-secondary mb-1">Current Due Amount (AED)</label>
                      <input
                        type="number"
                        min="0"
                        value={editMemberForm.dueAmount}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, dueAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-border font-bold text-amber-600"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-semibold text-text-secondary mb-1">Next EMI Due Date</label>
                      <input
                        type="date"
                        value={editMemberForm.nextEMIDueDate}
                        onChange={(e) => setEditMemberForm({ ...editMemberForm, nextEMIDueDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowEditMemberModal(false)}
                    className="px-4 py-2 text-text-secondary hover:bg-surface-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{actionLoading ? 'Saving...' : 'Save Member Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================== TAB 3: EMPLOYEES ============================== */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Staff Operations & Role Governance</h1>
                <p className="text-sm text-text-secondary">
                  Grant or revoke granular permissions individually. Employees without direct edit rights route changes
                  through approval.
                </p>
              </div>
              <button
                onClick={() => setShowAddEmployeeModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Staff Account</span>
              </button>
            </div>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp) => {
                const perms = emp.permissions || [];
                return (
                  <div
                    key={emp.id || emp._id}
                    className="bg-white rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between hover:border-accent-primary/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-text-primary text-sm">{emp.name}</h3>
                          <p className="text-xs text-text-tertiary">{emp.email}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Employee
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-text-secondary font-semibold">Active Permissions:</span>
                          <span className="font-mono font-bold text-accent-primary">{perms.length} of {PERMISSION_OPTIONS.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {perms.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded-md bg-surface-100 text-text-secondary text-[10px] font-medium"
                            >
                              {p.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {perms.length === 0 && (
                            <span className="text-[11px] text-text-tertiary italic">No active permissions</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {emp.isActive !== false ? (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Deactivated
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleEmployee(emp.id || emp._id, emp.isActive !== false)}
                          className="text-[10px] text-text-tertiary hover:text-text-primary underline"
                        >
                          {emp.isActive !== false ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setEmployeePermissionsForm([...(emp.permissions || [])]);
                          setShowPermissionsModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-surface-50 hover:bg-surface-100 text-xs font-bold text-text-primary border border-border transition-colors flex items-center gap-1"
                      >
                        <Shield className="w-3.5 h-3.5 text-accent-primary" />
                        <span>Permissions</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              {employees.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-tertiary">No employees registered yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Manage Permissions Modal */}
        {showPermissionsModal && selectedEmployee && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Configure Staff Permissions</h3>
                  <p className="text-xs text-text-secondary">Employee: {selectedEmployee.name}</p>
                </div>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {PERMISSION_OPTIONS.map((opt) => {
                  const isChecked = employeePermissionsForm.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-accent-primary-light/40 border-accent-primary/40 text-text-primary'
                          : 'bg-surface-50 border-border text-text-secondary hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEmployeePermissionsForm([...employeePermissionsForm, opt.id]);
                          } else {
                            setEmployeePermissionsForm(employeePermissionsForm.filter((p) => p !== opt.id));
                          }
                        }}
                        className="rounded text-accent-primary focus:ring-accent-primary"
                      />
                      <span className="font-semibold">{opt.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEmployeePermissionsForm(PERMISSION_OPTIONS.map((p) => p.id))}
                  className="text-xs font-semibold text-accent-primary hover:underline"
                >
                  Select All
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPermissionsModal(false)}
                    className="px-4 py-2 text-text-secondary hover:bg-surface-50 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleSavePermissions}
                    className="px-5 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Apply Permissions'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddEmployeeModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-bold text-text-primary">Add Staff Member</h3>
                <button
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEmployeeSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addEmployeeForm.name}
                    onChange={(e) => setAddEmployeeForm({ ...addEmployeeForm, name: e.target.value })}
                    placeholder="Staff Member Name"
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Email Address (Login Identifier) *</label>
                  <input
                    type="email"
                    required
                    value={addEmployeeForm.email}
                    onChange={(e) => setAddEmployeeForm({ ...addEmployeeForm, email: e.target.value })}
                    placeholder="staff@nexworldtravel.com"
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Initial Password *</label>
                  <input
                    type="text"
                    required
                    value={addEmployeeForm.password}
                    onChange={(e) => setAddEmployeeForm({ ...addEmployeeForm, password: e.target.value })}
                    placeholder="StaffPassword2026!"
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddEmployeeModal(false)}
                    className="px-4 py-2 text-text-secondary hover:bg-surface-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {actionLoading ? 'Creating...' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================== TAB 4: CHANGE REQUESTS ============================== */}
        {activeTab === 'change-requests' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Staff Change Requests Queue</h1>
              <p className="text-sm text-text-secondary">
                Review proposed edits submitted by staff. Inspect the side-by-side diff before approving or rejecting.
              </p>
            </div>

            <div className="space-y-4">
              {changeRequests.map((cr) => {
                const isPending = cr.status === 'Pending';
                return (
                  <div
                    key={cr.id || cr._id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                      isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent-primary bg-accent-primary-light px-2.5 py-0.5 rounded-full">
                          Member: {cr.memberProfileId?.memberId || cr.targetId || 'NEX-M'}
                        </span>
                        <span className="text-xs font-semibold text-text-primary">
                          Submitted by: {cr.employeeId?.name || cr.employeeName || 'Staff Member'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cr.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : cr.status === 'Rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {cr.status}
                        </span>
                        <span className="text-[11px] text-text-tertiary">
                          {new Date(cr.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Diff View Box */}
                    <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-red-50/60 p-3 rounded-xl border border-red-100">
                        <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block mb-1">
                          Current Values
                        </span>
                        <pre className="text-xs font-mono text-red-950 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(cr.currentValues || cr.currentValue || {}, null, 2)}
                        </pre>
                      </div>
                      <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                          Proposed Changes
                        </span>
                        <pre className="text-xs font-mono text-emerald-950 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(cr.proposedChanges || cr.proposedValue || {}, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div className="text-xs text-text-secondary bg-surface-50 p-2.5 rounded-xl border border-border">
                      <span className="font-semibold text-text-primary">Staff Reason:</span> {cr.reason}
                    </div>

                    {isPending && (
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRejectNotesModal(cr)}
                          className="px-4 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleApproveCR(cr.id || cr._id)}
                          className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                        >
                          Approve & Apply Changes
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {changeRequests.length === 0 && (
                <div className="bg-white rounded-2xl border border-border p-12 text-center text-text-tertiary text-xs">
                  No staff change requests in the queue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectNotesModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
              <h3 className="text-base font-bold text-text-primary">Reject Change Request</h3>
              <p className="text-xs text-text-secondary">Provide feedback for the staff member on why this was declined:</p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full p-3 text-xs rounded-xl border border-border focus:border-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejectNotesModal(null)}
                  className="px-4 py-2 text-xs text-text-secondary hover:bg-surface-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectCR}
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB 5: DESTINATIONS ============================== */}
        {activeTab === 'destinations' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Destinations Content Management</h1>
                <p className="text-sm text-text-secondary">
                  Manage Dream Destinations vs Top Destinations Showcase, images, regional assignments, and publication statuses.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDestination(null);
                  setDestForm({
                    title: '',
                    country: '',
                    region: 'Asia',
                    category: 'Dream Destinations',
                    shortDescription: '',
                    description: '',
                    price: 1999,
                    duration: '7 Days / 6 Nights',
                    rating: 4.9,
                    imageUrl: '/images/destinations/tokyo.jpg',
                    displayOrder: destinations.length + 1,
                    publicationStatus: 'published',
                    featured: true,
                    isTopDestination: false,
                    isActive: true,
                  });
                  setShowAddDestModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Destination</span>
              </button>
            </div>

            {/* Destinations Filter & Grid */}
            <div className="flex gap-2 pb-2">
              {['All', 'Dream Destinations', 'Top Destinations'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDestCategoryFilter(cat === 'All' ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    (cat === 'All' && !destCategoryFilter) || destCategoryFilter === cat
                      ? 'bg-text-primary text-white'
                      : 'bg-white text-text-secondary border border-border hover:bg-surface-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {destinations
                .filter(
                  (d) =>
                    !destCategoryFilter ||
                    d.category === destCategoryFilter ||
                    (destCategoryFilter === 'Top Destinations' && d.isTopDestination)
                )
                .map((dest) => (
                  <div
                    key={dest.id || dest._id}
                    className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-surface-100">
                        <Image
                          src={getDestinationImageUrl(dest)}
                          alt={dest.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-xs text-white">
                            {dest.category}
                          </span>
                          {dest.isTopDestination && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                              Top Pick
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              dest.publicationStatus === 'draft'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {dest.publicationStatus === 'draft' ? 'Draft' : 'Published'}
                          </span>
                        </div>
                        {dest.displayOrder && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                              Order #{dest.displayOrder}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-text-primary text-sm">{dest.title}</h3>
                          <span className="font-bold text-accent-primary text-xs">
                            {dest.price ? `$${dest.price}` : dest.region}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {dest.shortDescription || dest.tagline || dest.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-text-tertiary pt-1">
                          <span>{dest.country || dest.region}</span>
                          <span>•</span>
                          <span>{dest.duration || 'Flexible'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-border/50 flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() => handleToggleDestinationStatus(dest)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                          dest.publicationStatus === 'draft'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title={dest.publicationStatus === 'draft' ? 'Publish to public site' : 'Unpublish to draft'}
                      >
                        {dest.publicationStatus === 'draft' ? 'Publish' : 'Unpublish'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDestination(dest);
                            setDestForm({
                              title: dest.title || '',
                              country: dest.country || dest.region || '',
                              region: dest.region || 'Asia',
                              category: dest.category || 'Dream Destinations',
                              shortDescription: dest.shortDescription || dest.tagline || '',
                              description: dest.description || dest.shortDescription || '',
                              price: dest.price || 1999,
                              duration: dest.duration || '7 Days / 6 Nights',
                              rating: dest.rating || 4.9,
                              imageUrl: getDestinationImageUrl(dest),
                              displayOrder: dest.displayOrder || 1,
                              publicationStatus: dest.publicationStatus || 'published',
                              featured: Boolean(dest.featured),
                              isTopDestination: Boolean(dest.isTopDestination),
                              isActive: Boolean(dest.isActive),
                            });
                            setShowAddDestModal(true);
                          }}
                          className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-accent-primary"
                          title="Edit Destination"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmItem({
                              type: 'destination',
                              id: dest.id || dest._id,
                              title: dest.title,
                            })
                          }
                          className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-red-600"
                          title="Delete Destination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================== TAB 5.5: ACTIVITIES ============================== */}
        {activeTab === 'activities' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Activities & Excursions Content Management</h1>
                <p className="text-sm text-text-secondary">
                  Manage curated excursions, desert safaris, marine dives, and theme park passes showcased on the website.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedActivity(null);
                  setActForm({
                    title: '',
                    category: 'Desert & Safari',
                    region: 'Middle East / UAE',
                    location: '',
                    duration: '4 hours',
                    intensity: 'Moderate',
                    shortDescription: '',
                    description: '',
                    imageUrl: '/images/activities/desert-safari.webp',
                    displayOrder: activities.length + 1,
                    publicationStatus: 'published',
                    highlights: '',
                    featured: false,
                  });
                  setShowAddActModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>

            {/* Filter pills and search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  'All',
                  'Desert & Safari',
                  'Cultural & Heritage',
                  'Water Sports & Marine',
                  'Adventure & Adrenaline',
                  'Theme Parks & Attractions',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActCategoryFilter(cat === 'All' ? '' : cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      (cat === 'All' && !actCategoryFilter) || actCategoryFilter === cat
                        ? 'bg-text-primary text-white'
                        : 'bg-white text-text-secondary border border-border hover:bg-surface-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={actSearchQuery}
                  onChange={(e) => setActSearchQuery(e.target.value)}
                  placeholder="Search activities..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border text-xs"
                />
              </div>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activities
                .filter((a) => (!actCategoryFilter ? true : a.category === actCategoryFilter))
                .filter((a) => {
                  if (!actSearchQuery) return true;
                  const s = actSearchQuery.toLowerCase();
                  return (
                    a.title?.toLowerCase().includes(s) ||
                    a.location?.toLowerCase().includes(s) ||
                    a.category?.toLowerCase().includes(s)
                  );
                })
                .map((act) => (
                  <div
                    key={act.id || act._id || act.slug}
                    className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-surface-100">
                        <Image
                          src={getActivityImageUrl(act)}
                          alt={act.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-xs text-white">
                            {act.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                            {act.intensity || 'Moderate'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              act.publicationStatus === 'draft'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {act.publicationStatus === 'draft' ? 'Draft' : 'Published'}
                          </span>
                        </div>
                        {act.displayOrder && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                              Order #{act.displayOrder}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-text-primary text-sm line-clamp-1">{act.title}</h3>
                          <span className="text-[11px] font-semibold text-accent-primary">{act.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                          <MapPin className="w-3 h-3 text-accent-primary flex-shrink-0" />
                          <span className="line-clamp-1">{act.location}</span>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {act.shortDescription || act.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-border/50 flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleActivityStatus(act)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                            act.publicationStatus === 'draft'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                          title={act.publicationStatus === 'draft' ? 'Publish to public site' : 'Unpublish to draft'}
                        >
                          {act.publicationStatus === 'draft' ? 'Publish' : 'Unpublish'}
                        </button>
                        <button
                          onClick={() => setPreviewActivity(act)}
                          className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-accent-primary"
                          title="Preview Card"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedActivity(act);
                            setActForm({
                              title: act.title || '',
                              category: act.category || 'Desert & Safari',
                              region: act.region || 'Middle East / UAE',
                              location: act.location || '',
                              duration: act.duration || '4 hours',
                              intensity: act.intensity || 'Moderate',
                              shortDescription: act.shortDescription || '',
                              description: act.description || '',
                              imageUrl: act.imageUrl || act.coverImage || '',
                              coverImage: act.coverImage || act.imageUrl || '',
                              hasDirectImage: Boolean(act.hasDirectImage),
                              displayOrder: act.displayOrder || 1,
                              publicationStatus: act.publicationStatus || 'published',
                              highlights: Array.isArray(act.highlights)
                                ? act.highlights.join(', ')
                                : act.highlights || '',
                              featured: Boolean(act.featured),
                            });
                            setShowAddActModal(true);
                          }}
                          className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-accent-primary"
                          title="Edit Activity"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmItem({
                              type: 'activity',
                              id: act.id || act._id || act.slug,
                              title: act.title,
                            })
                          }
                          className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-red-600"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Add/Edit Destination Modal */}
        {showAddDestModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-bold text-text-primary">
                  {selectedDestination ? 'Edit Destination' : 'Add New Destination'}
                </h3>
                <button
                  onClick={() => setShowAddDestModal(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDestination} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={destForm.title}
                    onChange={(e) => setDestForm({ ...destForm, title: e.target.value })}
                    placeholder="e.g. Asia or Swiss Alps Luxury Escape"
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Region *</label>
                    <select
                      value={destForm.region}
                      onChange={(e) => setDestForm({ ...destForm, region: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    >
                      <option value="Asia">Asia</option>
                      <option value="Europe">Europe</option>
                      <option value="Africa">Africa</option>
                      <option value="Australia">Australia</option>
                      <option value="Middle East / UAE">Middle East / UAE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Category *</label>
                    <select
                      value={destForm.category}
                      onChange={(e) => setDestForm({ ...destForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    >
                      <option value="Dream Destinations">Dream Destinations</option>
                      <option value="Top Destinations">Top Destinations</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      value={destForm.displayOrder}
                      onChange={(e) => setDestForm({ ...destForm, displayOrder: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Publication Status</label>
                    <select
                      value={destForm.publicationStatus}
                      onChange={(e) => setDestForm({ ...destForm, publicationStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={destForm.price || ''}
                      onChange={(e) => setDestForm({ ...destForm, price: Number(e.target.value) })}
                      placeholder="e.g. 1999"
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                </div>

                {/* Image Upload Dropzone */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-text-secondary">Destination Image</label>
                    <span className="text-[10px] text-text-tertiary font-medium">Max 1 MB (JPG, PNG, WebP) - MongoDB Storage</span>
                  </div>
                  <div className="p-3 border border-dashed border-border rounded-2xl bg-surface-50 space-y-2">
                    {destForm.imageUrl ? (
                      <div className="relative h-32 w-full rounded-xl overflow-hidden bg-black/10">
                        <Image src={destForm.imageUrl} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
                          <label className="px-3 py-1.5 bg-white text-text-primary text-[11px] font-bold rounded-lg cursor-pointer shadow hover:bg-surface-50">
                            {imageUploading ? 'Uploading...' : 'Replace Image'}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/jpg"
                              onChange={(e) => handleImageFileChange(e, 'destination')}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setDestForm({ ...destForm, imageUrl: '', imageData: null })}
                            className="px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold rounded-lg shadow hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-surface-100/50 rounded-xl transition-colors">
                        <Upload className="w-6 h-6 text-accent-primary mb-1.5" />
                        <span className="font-bold text-text-primary text-xs">
                          {imageUploading ? 'Processing image...' : 'Click or Drag to Upload Image'}
                        </span>
                        <span className="text-[10px] text-text-tertiary mt-0.5">JPG, PNG, or WebP up to 1 MB (Direct MongoDB Storage)</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          onChange={(e) => handleImageFileChange(e, 'destination')}
                          className="hidden"
                        />
                      </label>
                    )}
                    <input
                      type="text"
                      value={destForm.imageUrl}
                      onChange={(e) => setDestForm({ ...destForm, imageUrl: e.target.value })}
                      placeholder="Or enter direct image path / URL..."
                      className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-border bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Tagline / Short Summary</label>
                  <input
                    type="text"
                    value={destForm.shortDescription}
                    onChange={(e) => setDestForm({ ...destForm, shortDescription: e.target.value })}
                    placeholder="Brief highlight sentence for cards..."
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Full Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={destForm.description}
                    onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
                    placeholder="Comprehensive description of the destination..."
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={destForm.isTopDestination}
                      onChange={(e) => setDestForm({ ...destForm, isTopDestination: e.target.checked })}
                      className="rounded text-accent-primary"
                    />
                    <span className="font-semibold text-text-secondary">Mark as Top Pick</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={destForm.featured}
                      onChange={(e) => setDestForm({ ...destForm, featured: e.target.checked })}
                      className="rounded text-accent-primary"
                    />
                    <span className="font-semibold text-text-secondary">Featured on Homepage</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddDestModal(false)}
                    className="px-4 py-2 text-text-secondary hover:bg-surface-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || imageUploading}
                    className="px-5 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save Destination'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Activity Modal */}
        {showAddActModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-bold text-text-primary">
                  {selectedActivity ? 'Edit Activity / Excursion' : 'Add New Activity'}
                </h3>
                <button
                  onClick={() => setShowAddActModal(false)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveActivity} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Activity Title *</label>
                  <input
                    type="text"
                    required
                    value={actForm.title}
                    onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                    placeholder="e.g. VIP Evening Desert Safari & Bedouin Camp"
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Category *</label>
                    <select
                      value={actForm.category}
                      onChange={(e) => setActForm({ ...actForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    >
                      <option value="Desert & Safari">Desert & Safari</option>
                      <option value="Cultural & Heritage">Cultural & Heritage</option>
                      <option value="Water Sports & Marine">Water Sports & Marine</option>
                      <option value="Adventure & Adrenaline">Adventure & Adrenaline</option>
                      <option value="Theme Parks & Attractions">Theme Parks & Attractions</option>
                      <option value="Wellness & Relaxation">Wellness & Relaxation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Region *</label>
                    <select
                      value={actForm.region}
                      onChange={(e) => setActForm({ ...actForm, region: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    >
                      <option value="Middle East / UAE">Middle East / UAE</option>
                      <option value="Asia">Asia</option>
                      <option value="Europe">Europe</option>
                      <option value="Africa">Africa</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      value={actForm.location}
                      onChange={(e) => setActForm({ ...actForm, location: e.target.value })}
                      placeholder="e.g. Dubai & Abu Dhabi, UAE"
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Duration</label>
                    <input
                      type="text"
                      value={actForm.duration}
                      onChange={(e) => setActForm({ ...actForm, duration: e.target.value })}
                      placeholder="e.g. 6 to 7 hours"
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Intensity</label>
                    <select
                      value={actForm.intensity}
                      onChange={(e) => setActForm({ ...actForm, intensity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="All Ages">All Ages</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      value={actForm.displayOrder}
                      onChange={(e) => setActForm({ ...actForm, displayOrder: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Publication Status</label>
                    <select
                      value={actForm.publicationStatus}
                      onChange={(e) => setActForm({ ...actForm, publicationStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border font-bold"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft (Hidden from public site)</option>
                    </select>
                  </div>
                </div>

                {/* Activity Image Upload Dropzone */}
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Activity Image</label>
                  <div className="p-3 border border-dashed border-border rounded-2xl bg-surface-50 space-y-2">
                    {actForm.imageUrl ? (
                      <div className="relative h-32 w-full rounded-xl overflow-hidden bg-black/10">
                        <Image src={getActivityImageUrl(actForm)} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
                          <label className="px-3 py-1.5 bg-white text-text-primary text-[11px] font-bold rounded-lg cursor-pointer shadow hover:bg-surface-50">
                            {imageUploading ? 'Uploading...' : 'Replace Image'}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/jpg"
                              onChange={(e) => handleImageFileChange(e, 'activity')}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setActForm({ ...actForm, imageUrl: '' })}
                            className="px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold rounded-lg shadow hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-surface-100/50 rounded-xl transition-colors">
                        <Upload className="w-6 h-6 text-accent-primary mb-1.5" />
                        <span className="font-bold text-text-primary text-xs">
                          {imageUploading ? 'Uploading image...' : 'Click or Drag to Upload Image'}
                        </span>
                        <span className="text-[10px] text-text-tertiary mt-0.5">JPG, PNG, or WebP up to 5MB</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          onChange={(e) => handleImageFileChange(e, 'activity')}
                          className="hidden"
                        />
                      </label>
                    )}
                    <input
                      type="text"
                      value={actForm.imageUrl}
                      onChange={(e) => setActForm({ ...actForm, imageUrl: e.target.value })}
                      placeholder="Or enter direct image path / URL..."
                      className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-border bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Short Description</label>
                  <input
                    type="text"
                    value={actForm.shortDescription}
                    onChange={(e) => setActForm({ ...actForm, shortDescription: e.target.value })}
                    placeholder="Short summary for cards..."
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Full Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={actForm.description}
                    onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                    placeholder="Full description of the activity and highlights..."
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Key Highlights (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={actForm.highlights}
                    onChange={(e) => setActForm({ ...actForm, highlights: e.target.value })}
                    placeholder="e.g. 4x4 Luxury Dune Bashing, Camel trekking, Sunset BBQ"
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={actForm.featured}
                      onChange={(e) => setActForm({ ...actForm, featured: e.target.checked })}
                      className="rounded text-accent-primary"
                    />
                    <span className="font-semibold text-text-secondary">Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewActivity({
                        ...actForm,
                        highlights:
                          typeof actForm.highlights === 'string'
                            ? actForm.highlights.split(',').map((s) => s.trim()).filter(Boolean)
                            : actForm.highlights,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-text-secondary hover:text-accent-primary border border-border rounded-xl hover:bg-surface-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Card</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddActModal(false)}
                      className="px-4 py-2 text-text-secondary hover:bg-surface-50 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || imageUploading}
                      className="px-5 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : 'Save Activity'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Activity Live Preview Modal */}
        {previewActivity && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary">Website Card Preview</span>
                <button
                  onClick={() => setPreviewActivity(null)}
                  className="p-1 rounded-lg text-text-tertiary hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-[16/10] w-full bg-surface-200">
                <Image
                  src={getActivityImageUrl(previewActivity)}
                  alt={previewActivity.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-bold text-text-primary shadow-sm">
                    {previewActivity.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500 text-[11px] font-bold text-white shadow-sm">
                    {previewActivity.intensity || 'Moderate'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <MapPin className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                  <span className="line-clamp-1">{previewActivity.location || 'Location not specified'}</span>
                </div>

                <h3 className="text-base font-bold text-text-primary">{previewActivity.title || 'Activity Title'}</h3>

                <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                  {previewActivity.shortDescription || previewActivity.description || 'Description goes here...'}
                </p>

                {previewActivity.highlights?.length > 0 && (
                  <div className="pt-2">
                    <ul className="space-y-1">
                      {previewActivity.highlights.slice(0, 3).map((hl, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-text-secondary">
                          <CheckCircle2 className="w-3 h-3 text-accent-secondary mt-0.5 flex-shrink-0" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-accent-primary" />
                    <span>{previewActivity.duration || 'Flexible'}</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-accent-primary text-white">
                    Enquire
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Confirm Deletion</h3>
                  <p className="text-xs text-text-secondary capitalize">{deleteConfirmItem.type} Removal</p>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Are you sure you want to delete / archive{' '}
                <strong className="text-text-primary font-bold">{deleteConfirmItem.title}</strong>? It will be removed
                from the public website while preserving historical system logs.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-4 py-2 text-xs text-text-secondary hover:bg-surface-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB 6: BOOKINGS ============================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Travel Booking Enquiries</h1>
                <p className="text-sm text-text-secondary">
                  Customer enquiries received from website forms. Update statuses, add internal notes, or retry email
                  notifications.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-xs">
                  <thead className="bg-surface-50 text-text-tertiary font-bold uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Date & Guests</th>
                      <th className="py-3 px-4">Email Status</th>
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
                        <td className="py-3 px-4">
                          <div className="font-semibold text-text-primary">
                            {b.fullName || b.customerName || `${b.firstName || ''} ${b.lastName || ''}`.trim() || 'Guest'}
                          </div>
                          <div className="text-[11px] text-text-tertiary">
                            {b.email} • {b.phone}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-text-primary">
                          {b.destinationName || b.destinationOrPackage || 'Custom Trip'}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          <div>{b.departureDate || b.travelDate || 'Flexible'}</div>
                          <div className="text-[11px] text-text-tertiary">
                            {b.guests || (b.adults ? `${b.adults} Adults${b.children ? `, ${b.children} Kids` : ''}` : '2 Guests')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {b.emailNotificationSent ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                              <Check className="w-3.5 h-3.5" /> Sent
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRetryEmail(b.id || b._id)}
                              className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:underline font-semibold"
                              title="Click to retry sending notification"
                            >
                              <RefreshCw className="w-3 h-3" /> Retry Dispatch
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id || b._id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-border bg-surface-50 text-xs font-semibold"
                          >
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
                            title="View Booking Detail & Notes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-text-tertiary">
                          No booking enquiries recorded.
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
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Booking Enquiry Details</h3>
                  <p className="font-mono text-xs text-accent-primary">
                    {selectedBooking.bookingReference || selectedBooking.id || selectedBooking._id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-surface-50 p-4 rounded-2xl border border-border">
                <div>
                  <span className="text-text-tertiary">Customer Name</span>
                  <p className="font-bold text-text-primary mt-0.5">
                    {selectedBooking.fullName || selectedBooking.customerName || `${selectedBooking.prefix || ''} ${selectedBooking.firstName || ''} ${selectedBooking.lastName || ''}`.trim() || 'Guest'}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Email</span>
                  <p className="font-bold text-text-primary mt-0.5">{selectedBooking.email}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Phone</span>
                  <p className="font-bold text-text-primary mt-0.5">{selectedBooking.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-text-tertiary">Destination</span>
                  <p className="font-bold text-text-primary mt-0.5">
                    {selectedBooking.destinationName || selectedBooking.destinationOrPackage || 'Custom Trip'}
                  </p>
                </div>
              </div>

              {(selectedBooking.specialRequests || selectedBooking.activitiesRequired || selectedBooking.notes) && (
                <div className="text-xs">
                  <span className="font-semibold text-text-secondary block mb-1">Customer Message:</span>
                  <p className="bg-surface-50 p-3 rounded-xl border border-border text-text-primary">
                    {selectedBooking.specialRequests || selectedBooking.activitiesRequired || selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Staff Notes section */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-bold text-text-primary">Internal Staff Notes</h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {(selectedBooking.internalNotes || []).map((note, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-surface-50 text-xs border border-border">
                      <div className="flex justify-between text-[10px] text-text-tertiary mb-0.5">
                        <span className="font-semibold text-text-primary">{note.authorName}</span>
                        <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-text-secondary">{note.note}</p>
                    </div>
                  ))}
                  {(!selectedBooking.internalNotes || selectedBooking.internalNotes.length === 0) && (
                    <p className="text-xs text-text-tertiary italic">No staff notes yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddBookingNoteSubmit} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={bookingNoteText}
                    onChange={(e) => setBookingNoteText(e.target.value)}
                    placeholder="Add operational note..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-border focus:border-accent-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent-primary text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB 7: MEMBER REQUESTS (24H SLA) ============================== */}
        {activeTab === 'member-requests' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Member Inquiries (24-Hour SLA)</h1>
              <p className="text-sm text-text-secondary">
                Support tickets and travel planning requests submitted by members with explicit 24-hour response
                commitment.
              </p>
            </div>

            <div className="space-y-4">
              {memberRequests.map((req) => (
                <div
                  key={req.id || req._id}
                  className="bg-white rounded-2xl border border-border p-5 shadow-xs hover:border-accent-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent-primary bg-accent-primary-light px-2.5 py-0.5 rounded-full">
                        {req.memberProfileId?.memberId || 'NEX-M'}
                      </span>
                      <span className="text-xs font-bold text-text-primary">{req.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-semibold">
                        <Clock className="w-3 h-3" /> 24h SLA Tracked
                      </span>
                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateMRStatus(req.id || req._id, e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-border bg-surface-50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary my-3 leading-relaxed bg-surface-50 p-3 rounded-xl border border-border">
                    {req.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-2">
                    <span>Category: {req.category}</span>
                    <span>Received: {new Date(req.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {memberRequests.length === 0 && (
                <div className="bg-white rounded-2xl border border-border p-12 text-center text-text-tertiary text-xs">
                  No member support inquiries pending.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================== TAB 8: TERMS & CONDITIONS ============================== */}
        {activeTab === 'terms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Membership Terms & Conditions</h1>
                <p className="text-sm text-text-secondary">
                  Live legal terms governing member rights, cancellation rules, travel cards, and room night redemption.
                </p>
              </div>
              <button
                onClick={handleSaveTerms}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-accent-primary hover:bg-accent-primary-hover rounded-xl shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Saving Terms...' : 'Publish Updated Terms'}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs text-text-secondary border-b border-border pb-3">
                <span className="font-semibold">Version: v{terms?.version || 1}.0 Active</span>
                <span>Last Updated: {terms?.updatedAt ? new Date(terms.updatedAt).toLocaleDateString() : 'Active'}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-2">Terms Document Content</label>
                <textarea
                  rows={16}
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  className="w-full p-4 text-xs font-mono rounded-2xl border border-border focus:border-accent-primary bg-surface-50 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-text-tertiary pt-2">
                <p>All members must accept these terms inside their portal upon their first dashboard sign in.</p>
                <button
                  onClick={handleSaveTerms}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-text-primary text-white font-bold rounded-xl text-xs hover:bg-black"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================== TAB 9: TRIP AVAILABILITY CALENDAR ============================== */}
        {activeTab === 'availability' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Trip &amp; Plan Availability Calendar Management</h1>
                <p className="text-sm text-text-secondary">
                  Create, publish, edit, and manage available travel dates and trip periods displayed across Member Portals.
                </p>
              </div>
              <button
                onClick={handleOpenAddAvailability}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Travel Availability Period</span>
              </button>
            </div>

            {/* Quick KPI stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs">
                <span className="text-xs text-text-tertiary">Total Configured Travel Periods</span>
                <p className="text-2xl font-black text-text-primary mt-1">{availabilities.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-xs text-emerald-800 font-semibold">Live Available Periods (Green Highlighting)</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">
                  {availabilities.filter((a) => a.status === 'Available').length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs">
                <span className="text-xs text-text-tertiary">Audit Trail Status</span>
                <p className="text-xs font-bold text-text-primary mt-2 flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>MongoDB Audit Logging Active</span>
                </p>
              </div>
            </div>

            {/* Availabilities Table */}
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-primary">Configured Trip Periods ({availabilities.length})</h2>
                <span className="text-xs text-text-tertiary">Member portal displays open dates in green</span>
              </div>

              {availabilities.length === 0 ? (
                <div className="p-12 text-center text-text-tertiary text-xs">
                  No trip availability periods configured yet. Click above to create your first period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-50 text-text-secondary border-b border-border font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Trip / Plan Title</th>
                        <th className="py-3.5 px-4">Target Member</th>
                        <th className="py-3.5 px-4">Destination</th>
                        <th className="py-3.5 px-4">Travel Period</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Slots</th>
                        <th className="py-3.5 px-4">Eligible Tiers</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {availabilities.map((item) => (
                        <tr key={item._id || item.id} className="hover:bg-surface-50/50">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-text-primary block">{item.title}</span>
                            <span className="text-[11px] text-text-tertiary">{item.planType || 'Holiday Package'}</span>
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
                            <span className="line-clamp-1 max-w-[140px]">
                              {item.tierEligibility?.join(', ') || 'All 7 Tiers'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditAvailability(item)}
                                className="p-1.5 rounded-lg hover:bg-surface-100 text-text-secondary hover:text-accent-primary"
                                title="Edit Availability"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAvailability(item._id || item.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600"
                                title="Delete Availability"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

        {/* Modal: Add / Edit Availability Period */}
        {showAvailabilityModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-border shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <h3 className="font-bold text-text-primary text-base">
                  {editingAvailability ? 'Edit Travel Availability Period' : 'New Trip / Plan Availability'}
                </h3>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="p-1.5 rounded-xl hover:bg-surface-50 text-text-tertiary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAvailability} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Target Member / Scope *</label>
                  <select
                    value={availabilityForm.memberId || 'ALL'}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedM = members.find((m) => m.memberId === selectedId);
                      setAvailabilityForm({
                        ...availabilityForm,
                        memberId: selectedId,
                        memberName: selectedId === 'ALL' ? 'All Members' : (selectedM?.registeredName || selectedId),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-border font-bold text-accent-primary"
                  >
                    <option value="ALL">All Members (Global Public Calendar)</option>
                    {members.map((m) => (
                      <option key={m.memberId} value={m.memberId}>
                        {m.memberId} — {m.registeredName || m.userId?.name || 'Member'} ({m.packageType})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    Select a specific member to configure their personal travel period, or assign to All Members.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Trip / Plan Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swiss Alps Winter Retreat"
                    value={availabilityForm.title}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Destination *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Switzerland"
                      value={availabilityForm.destination}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, destination: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Plan Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Holiday Package"
                      value={availabilityForm.planType}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, planType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={availabilityForm.startDate}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={availabilityForm.endDate}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Status *</label>
                    <select
                      value={availabilityForm.status}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, status: e.target.value })}
                      className="w-full px-2 py-2 rounded-xl border border-border font-bold text-emerald-800"
                    >
                      <option value="Available">Available (Green)</option>
                      <option value="Unavailable">Unavailable</option>
                      <option value="Booked">Booked</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Total Slots</label>
                    <input
                      type="number"
                      min="1"
                      value={availabilityForm.totalSlots}
                      onChange={(e) =>
                        setAvailabilityForm({ ...availabilityForm, totalSlots: Number(e.target.value) })
                      }
                      className="w-full px-2 py-2 rounded-xl border border-border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Available Slots</label>
                    <input
                      type="number"
                      min="0"
                      value={availabilityForm.availableSlots}
                      onChange={(e) =>
                        setAvailabilityForm({ ...availabilityForm, availableSlots: Number(e.target.value) })
                      }
                      className="w-full px-2 py-2 rounded-xl border border-border font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Notes / Highlights</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Luxury chalet accommodation, private ski pass included..."
                    value={availabilityForm.notes}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border resize-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-surface-50 border border-border text-[11px] text-text-tertiary">
                  Audit note: Modifying availability creates an audit log entry in MongoDB under your Master Head session.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAvailabilityModal(false)}
                    className="px-4 py-2 rounded-xl text-text-secondary hover:bg-surface-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : editingAvailability ? 'Update Period' : 'Publish Period'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
