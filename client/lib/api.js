import { destinationsData } from '../data/destinations';
import { activitiesData } from '../data/activities';
import { packagesData } from '../data/packages';
import { getAuthHeaders, saveAuth, clearAuth } from './auth';

// Get backend API root URL with automatic slash and prefix normalization
// Prevents '//api' and '/api/v1/api/v1' errors regardless of how NEXT_PUBLIC_API_URL is formatted
const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
const cleanApiUrl = rawApiUrl
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '')
  .replace(/\/api$/, '');
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
  const perms = data.permissions || data.user?.permissions || [];
  const user = data.user ? { ...data.user, permissions: perms } : null;
  if (user && typeof window !== 'undefined') {
    const existing = getAuthUser() || {};
    const token = localStorage.getItem('token') || '';
    saveAuth(token, { ...existing, ...user, permissions: perms });
  }
  return user;
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

export async function createActivity(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/activities`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create activity.');
  return data;
}

export async function updateActivity(id, payload) {
  const res = await fetch(`${BASE_URL}/api/v1/activities/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update activity.');
  return data;
}

export async function deleteActivity(id) {
  const res = await fetch(`${BASE_URL}/api/v1/activities/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete activity.');
  return data;
}

export async function uploadActivityImage(id, fileOrBase64, originalName) {
  let base64Data = fileOrBase64;
  let name = originalName || 'activity-image.jpg';

  if (typeof window !== 'undefined' && fileOrBase64 instanceof File) {
    name = fileOrBase64.name;
    base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }

  const res = await fetch(`${BASE_URL}/api/v1/activities/${id}/image`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ data: base64Data, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload activity image.');
  return data;
}

export async function uploadMedia(fileOrBase64, filename, mimeType) {
  let dataPayload = fileOrBase64;
  let type = mimeType;
  let name = filename;

  if (typeof window !== 'undefined' && fileOrBase64 instanceof File) {
    name = filename || fileOrBase64.name;
    type = mimeType || fileOrBase64.type;
    dataPayload = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }

  const res = await fetch(`${BASE_URL}/api/v1/media/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ data: dataPayload, name, type }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload image.');
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

/**
 * Returns the correct image URL for a destination, prioritizing direct MongoDB
 * binary image endpoint when hasDirectImage is true, with seamless fallbacks.
 */
export function getDestinationImageUrl(dest) {
  if (!dest) return '/images/hero.jpg';

  // 1. Direct MongoDB binary image endpoint (served via same-origin Next.js rewrite or direct backend route)
  if (dest.hasDirectImage) {
    const identifier = dest.slug || dest.id || dest._id;
    return `/api/v1/destinations/${identifier}/image`;
  }

  // 2. Candidate image fields (imageUrl, coverImage, heroImage, thumbnail)
  const directCandidate = dest.imageUrl || dest.coverImage || dest.heroImage || dest.thumbnail;
  if (directCandidate && typeof directCandidate === 'string') {
    // Keep absolute external URLs intact (e.g., Unsplash, Cloudinary, S3)
    if (directCandidate.startsWith('http://') || directCandidate.startsWith('https://')) {
      return directCandidate;
    }
    // Return root-relative paths for same-origin proxying via Next.js rewrites
    if (directCandidate.startsWith('/api/') || directCandidate.startsWith('/uploads/') || directCandidate.startsWith('/images/')) {
      return directCandidate;
    }
    if (directCandidate.startsWith('/')) {
      return directCandidate;
    }
    return `/${directCandidate}`;
  }

  // 3. Fallback to repository static image if slug matches standard destinations
  if (dest.slug && ['asia', 'europe', 'africa', 'australia', 'uae'].includes(String(dest.slug).toLowerCase())) {
    return `/images/destinations/${String(dest.slug).toLowerCase()}.jpg`;
  }

  return '/images/hero.jpg';
}

/**
 * Returns the correct image URL for an activity, prioritizing direct MongoDB
 * binary image endpoint when hasDirectImage is true, with seamless fallbacks.
 */
export function getActivityImageUrl(activity) {
  if (!activity) return '/images/hero.jpg';

  // 1. Direct MongoDB binary image endpoint (served via same-origin Next.js rewrite or direct backend route)
  if (activity.hasDirectImage) {
    const identifier = activity.slug || activity.id || activity._id;
    return `/api/v1/activities/${identifier}/image`;
  }

  // 2. Candidate image fields (imageUrl, coverImage, heroImage, thumbnail)
  const candidate = activity.imageUrl || activity.coverImage || activity.heroImage || activity.thumbnail;
  if (candidate && typeof candidate === 'string') {
    // Keep absolute external URLs intact (e.g., Unsplash, Cloudinary, S3)
    if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
      return candidate;
    }
    // Avoid broken legacy placeholder
    if (candidate.includes('/images/hero/hero-bg.jpg')) {
      return '/images/hero.jpg';
    }
    // Return root-relative paths for same-origin proxying via Next.js rewrites
    if (candidate.startsWith('/api/') || candidate.startsWith('/uploads/') || candidate.startsWith('/images/')) {
      return candidate;
    }
    if (candidate.startsWith('/')) {
      return candidate;
    }
    return `/${candidate}`;
  }

  // 3. Fallback to standard activity image based on slug or title
  const slug = String(activity.slug || activity.id || activity.title || '').toLowerCase();
  if (slug.includes('desert') || slug.includes('safari')) {
    return '/images/activities/desert-safari.webp';
  }
  if (slug.includes('museum') || slug.includes('future')) {
    return '/images/destinations/uae.jpg';
  }
  if (slug.includes('seine') || slug.includes('cruise') || slug.includes('catamaran')) {
    return '/images/destinations/europe.jpg';
  }
  if (slug.includes('barrier-reef') || slug.includes('marine') || slug.includes('snorkel')) {
    return '/images/destinations/australia.jpg';
  }
  if (slug.includes('fuji') || slug.includes('hakone')) {
    return '/images/destinations/asia.jpg';
  }
  if (slug.includes('yas') || slug.includes('waterworld') || slug.includes('parks')) {
    return '/images/activities/adventure.jpg';
  }
  if (slug.includes('international') || slug.includes('adventure')) {
    return '/images/services/activities.jpg';
  }

  return '/images/hero.jpg';
}

export async function fetchDestinations(region, category) {
  try {
    const params = new URLSearchParams();
    if (region && region !== 'All') params.append('region', region);
    if (category && category !== 'All') params.append('category', category);
    const queryString = params.toString();
    const url = `${BASE_URL}/api/v1/destinations${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        if (data.data.length > 0) {
          // Ensure all base seed destinations are included without duplicating
          const apiSlugs = new Set(data.data.map((d) => (d.slug || '').toLowerCase()));
          const missingSeeds = destinationsData.filter(
            (seed) => !apiSlugs.has((seed.slug || '').toLowerCase())
          );
          let combined = [...data.data, ...missingSeeds];
          if (region && region !== 'All') {
            combined = combined.filter((d) => d.region?.toLowerCase() === region.toLowerCase());
          }
          if (category && category !== 'All') {
            combined = combined.filter((d) => d.category?.toLowerCase() === category.toLowerCase());
          }
          return combined;
        }
      }
    }
  } catch (e) {}

  let results = [...destinationsData];
  if (region && region !== 'All') results = results.filter((d) => d.region.toLowerCase() === region.toLowerCase());
  if (category && category !== 'All') results = results.filter((d) => d.category?.toLowerCase() === category.toLowerCase());
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
    if (category && category !== 'All') params.append('category', category);
    if (region && region !== 'All') params.append('region', region);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getAuthHeaders(), cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.length > 0) return data.data;
    }
  } catch (e) {}

  let filtered = [...activitiesData];
  if (category && category !== 'All') filtered = filtered.filter((a) => a.category?.toLowerCase() === category.toLowerCase());
  if (region && region !== 'All') filtered = filtered.filter((a) => a.region?.toLowerCase() === region.toLowerCase());
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

// ==================== TRIP & PLAN AVAILABILITY CALENDAR ====================
export async function fetchAvailabilities(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/api/v1/availability${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch trip availability.');
  return data.data || [];
}

export async function createAvailability(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/availability`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create trip availability.');
  return data.data;
}

export async function updateAvailability(id, payload) {
  const res = await fetch(`${BASE_URL}/api/v1/availability/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update trip availability.');
  return data.data;
}

export async function deleteAvailability(id) {
  const res = await fetch(`${BASE_URL}/api/v1/availability/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete trip availability.');
  return data;
}
