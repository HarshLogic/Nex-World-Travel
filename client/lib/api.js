import { destinationsData } from '../data/destinations';
import { activitiesData } from '../data/activities';
import { packagesData } from '../data/packages';
import { getAuthHeaders, saveAuth, clearAuth } from './auth';

// Get backend API root URL with automatic slash trimming to prevent `//api/...` errors
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
const BASE_URL = cleanApiUrl;

// ==================== AUTHENTICATION ====================
export async function loginMember(memberId, password) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/member/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Member login failed.');
  saveAuth(data.token, data.user);
  return data;
}

export async function loginStaff(email, password) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Staff login failed.');
  saveAuth(data.token, data.user);
  return data;
}

export async function fetchCurrentUser() {
  const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    clearAuth();
    return null;
  }
  const data = await res.json();
  return data.user;
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit password reset.');
  return data;
}

export async function resetPassword(token, password) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Password reset failed.');
  return data;
}

export async function activateAccount(token, password) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/activate-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Account activation failed.');
  return data;
}

export async function verifySecurityToken(token) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/verify-token?token=${encodeURIComponent(token)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Security token is invalid or expired.');
  return data;
}

// ==================== MEMBER PORTAL ====================
export async function fetchMemberProfile() {
  const res = await fetch(`${BASE_URL}/api/v1/members/me`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch membership profile.');
  return data;
}

export async function acknowledgeMemberTerms() {
  const res = await fetch(`${BASE_URL}/api/v1/members/acknowledge-terms`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to acknowledge terms.');
  return data;
}

export async function submitMemberRequest(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/member-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit request.');
  return data;
}

export async function fetchMyMemberRequests() {
  const res = await fetch(`${BASE_URL}/api/v1/member-requests/my-requests`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch requests.');
  return data.requests || [];
}

// ==================== MASTER HEAD & EMPLOYEE DASHBOARD ====================
export async function fetchDashboardMetrics() {
  const res = await fetch(`${BASE_URL}/api/v1/dashboard/metrics`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch dashboard metrics.');
  return data;
}

export async function fetchAdminMembers(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/api/v1/members?${query}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch members.');
  return data;
}

export async function fetchAdminMemberDetail(memberId) {
  const res = await fetch(`${BASE_URL}/api/v1/members/${memberId}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch member details.');
  return data;
}

export async function createAdminMember(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/members`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create member.');
  return data;
}

export async function updateAdminMember(memberId, payload) {
  const res = await fetch(`${BASE_URL}/api/v1/members/${memberId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update member.');
  return data;
}

export async function recordMemberPayment(memberId, payload) {
  const res = await fetch(`${BASE_URL}/api/v1/members/${memberId}/payments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to record payment.');
  return data;
}

export async function fetchEmployees() {
  const res = await fetch(`${BASE_URL}/api/v1/employees`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch employees.');
  return data.employees || [];
}

export async function createEmployee(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/employees`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create employee.');
  return data;
}

export async function updateEmployeePermissions(id, permissions) {
  const res = await fetch(`${BASE_URL}/api/v1/employees/${id}/permissions`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ permissions }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update permissions.');
  return data;
}

export async function toggleEmployeeStatus(id) {
  const res = await fetch(`${BASE_URL}/api/v1/employees/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to toggle employee status.');
  return data;
}

export async function fetchChangeRequests(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${BASE_URL}/api/v1/change-requests${query}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch change requests.');
  return data.changeRequests || [];
}

export async function createEmployeeChangeRequest(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/change-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit change request.');
  return data;
}

export async function fetchMyChangeRequests() {
  const res = await fetch(`${BASE_URL}/api/v1/change-requests/my-requests`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch my change requests.');
  return data.changeRequests || [];
}

export async function approveChangeRequest(id) {
  const res = await fetch(`${BASE_URL}/api/v1/change-requests/${id}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to approve change request.');
  return data;
}

export async function rejectChangeRequest(id, notes = '') {
  const res = await fetch(`${BASE_URL}/api/v1/change-requests/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ notes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reject change request.');
  return data;
}

export async function fetchAdminBookings(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/api/v1/bookings?${query}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings.');
  return data.data || [];
}

export async function updateBookingStatus(id, status, note = '') {
  const res = await fetch(`${BASE_URL}/api/v1/bookings/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update booking status.');
  return data;
}

export async function addBookingNote(id, note) {
  const res = await fetch(`${BASE_URL}/api/v1/bookings/${id}/notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add note.');
  return data;
}

export async function retryBookingEmail(id) {
  const res = await fetch(`${BASE_URL}/api/v1/bookings/${id}/notify`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to dispatch email notification.');
  return data;
}

export async function fetchAdminMemberRequests(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/api/v1/member-requests?${query}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch member requests.');
  return data.requests || [];
}

export async function updateMemberRequestStatus(id, status, note = '') {
  const res = await fetch(`${BASE_URL}/api/v1/member-requests/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update request.');
  return data;
}

export async function createDestination(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/destinations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create destination.');
  return data;
}

export async function updateDestination(id, payload) {
  const res = await fetch(`${BASE_URL}/api/v1/destinations/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update destination.');
  return data;
}

export async function deleteDestination(id) {
  const res = await fetch(`${BASE_URL}/api/v1/destinations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete destination.');
  return data;
}

export async function fetchTerms() {
  const res = await fetch(`${BASE_URL}/api/v1/terms`);
  const data = await res.json();
  return data.terms;
}

export async function updateTerms(content) {
  const res = await fetch(`${BASE_URL}/api/v1/terms`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update terms.');
  return data.terms;
}

// ==================== PUBLIC SITE DESTINATIONS & PACKAGES ====================
export async function fetchDestinations(region, category) {
  try {
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (category) params.append('category', category);
    const url = `${BASE_URL}/api/v1/destinations?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.length > 0) return data.data;
    }
  } catch (e) {}

  let results = [...destinationsData];
  if (region) results = results.filter((d) => d.region.toLowerCase() === region.toLowerCase());
  return results;
}

export async function fetchDestinationBySlug(slug) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/destinations/${slug}`, { next: { revalidate: 30 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {}
  return destinationsData.find((d) => d.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function fetchActivities(category, region) {
  try {
    let url = `${BASE_URL}/api/v1/activities`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (region) params.append('region', region);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.length > 0) return data.data;
    }
  } catch (e) {}

  let filtered = [...activitiesData];
  if (category) filtered = filtered.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  if (region) filtered = filtered.filter((a) => a.region.toLowerCase() === region.toLowerCase());
  return filtered;
}

export async function fetchPackages(region) {
  try {
    const url = region ? `${BASE_URL}/api/v1/packages?region=${encodeURIComponent(region)}` : `${BASE_URL}/api/v1/packages`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.length > 0) return data.data;
    }
  } catch (e) {}
  return region ? packagesData.filter((p) => p.region.toLowerCase() === region.toLowerCase()) : packagesData;
}

export async function fetchPackageBySlug(slug) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/packages/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {}
  return packagesData.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function submitBookingEnquiry(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || 'Failed to submit booking enquiry.');
  }
  return result;
}

export async function submitContactMessage(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || 'Failed to submit contact message.');
  }
  return result;
}
