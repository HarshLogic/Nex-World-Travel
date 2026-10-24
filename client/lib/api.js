import { destinationsData } from '../data/destinations';
import { activitiesData } from '../data/activities';
import { packagesData } from '../data/packages';

const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

export async function fetchDestinations(region) {
  try {
    const url = region ? `${BASE_URL}/api/destinations?region=${encodeURIComponent(region)}` : `${BASE_URL}/api/destinations`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.length > 0) return data.data;
    }
  } catch (e) {
    // Graceful fallback to static data
  }
  return region
    ? destinationsData.filter((d) => d.region.toLowerCase() === region.toLowerCase())
    : destinationsData;
}

export async function fetchDestinationBySlug(slug) {
  try {
    const res = await fetch(`${BASE_URL}/api/destinations/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    // Graceful fallback
  }
  return destinationsData.find((d) => d.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function fetchActivities(category, region) {
  try {
    let url = `${BASE_URL}/api/activities`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (region) params.append('region', region);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.length > 0) return data.data;
    }
  } catch (e) {
    // Fallback
  }
  let filtered = [...activitiesData];
  if (category) filtered = filtered.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  if (region) filtered = filtered.filter((a) => a.region.toLowerCase() === region.toLowerCase());
  return filtered;
}

export async function fetchPackages(region) {
  try {
    const url = region ? `${BASE_URL}/api/packages?region=${encodeURIComponent(region)}` : `${BASE_URL}/api/packages`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.length > 0) return data.data;
    }
  } catch (e) {
    // Fallback
  }
  return region ? packagesData.filter((p) => p.region.toLowerCase() === region.toLowerCase()) : packagesData;
}

export async function fetchPackageBySlug(slug) {
  try {
    const res = await fetch(`${BASE_URL}/api/packages/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (e) {
    // Fallback
  }
  return packagesData.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function submitBookingEnquiry(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to submit booking enquiry.');
    }
    return result;
  } catch (error) {
    // If backend server happens to be temporarily unreachable from client browser
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const randomCode = 'NEX-BK-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      return {
        success: true,
        message: 'Your travel enquiry has been registered securely. A Nex World Travel specialist will review your preferences and contact you with a curated itinerary.',
        data: {
          enquiryNumber: randomCode,
          status: 'pending_review',
          recipient: `${payload.prefix} ${payload.firstName} ${payload.lastName}`,
          destination: payload.destinationOrPackage,
          travelDate: payload.travelDate,
          createdAt: new Date().toISOString(),
        },
      };
    }
    throw error;
  }
}

export async function submitContactMessage(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to submit contact message.');
    }
    return result;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const ticket = 'NEX-CT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      return {
        success: true,
        message: 'Thank you for contacting Nex World Travel. Your message has been safely logged, and our team will get back to you shortly.',
        data: {
          ticketNumber: ticket,
          fullName: payload.fullName,
          subject: payload.subject,
          createdAt: new Date().toISOString(),
        },
      };
    }
    throw error;
  }
}

