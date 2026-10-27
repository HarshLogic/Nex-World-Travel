import { z } from 'zod';

const bookingBaseSchema = z.object({
  // Standard Booking Request Format Fields
  memberName: z.string().trim().min(2, 'Member name is required (minimum 2 characters)').optional(),
  spouseName: z.string().trim().optional().default(''),
  kidsAges: z.string().trim().optional().default(''),
  checkInDate: z.string().trim().min(4, 'Check-in date is required').optional(),
  checkOutDate: z.string().trim().min(4, 'Check-out date is required').optional(),
  guestsCount: z.coerce.number().int().min(1, 'Number of guests (PAX) must be at least 1').default(1),

  // Core & Detailed Form Fields
  prefix: z.enum(['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Miss', 'Dr.', 'Prof.']).default('Mr.'),
  firstName: z.string().trim().min(2, 'First name is required (minimum 2 characters)'),
  middleName: z.string().trim().optional().default(''),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Please provide a valid email address'),
  phone: z.string().trim().min(6, 'Please provide a valid contact number (minimum 6 digits)'),
  streetAddress: z.string().trim().min(2, 'Street address is required').default('Abu Dhabi, UAE'),
  stateProvince: z.string().trim().min(2, 'State or province is required').default('Abu Dhabi'),
  nationality: z.string().trim().min(2, 'Nationality is required').default('United Arab Emirates'),
  destinationOrPackage: z.string().trim().min(2, 'Destination or location is required'),
  travelDate: z.string().trim().min(4, 'Travel date is required'),
  returnDate: z.string().trim().optional().default(''),
  adults: z.coerce.number().int().min(1, 'At least 1 adult / guest is required').default(1),
  children: z.coerce.number().int().min(0, 'Children cannot be negative').default(0),
  activitiesRequired: z.string().trim().min(2, 'Please indicate your requested activities or preferences').default('Holiday Itinerary & Stay'),
  budgetRange: z.string().trim().optional().default('Flexible'),
  notes: z.string().trim().optional().default(''),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms & conditions of Nex World Travel & Tourism' }),
  }),
});

export const bookingSchema = z
  .preprocess((raw) => {
    if (!raw || typeof raw !== 'object') return {};
    const d = { ...raw };

    // Normalize memberName
    if (d.memberName && (!d.firstName || !d.lastName)) {
      const parts = String(d.memberName).trim().split(/\s+/);
      d.firstName = parts[0] || 'Traveler';
      d.lastName = parts.slice(1).join(' ') || 'Member';
    } else if (d.firstName && !d.memberName) {
      d.memberName = `${d.prefix ? d.prefix + ' ' : ''}${d.firstName} ${d.lastName || ''}`.trim();
    }

    // Destination / Location
    if (!d.destinationOrPackage && (d.destination || d.location)) {
      d.destinationOrPackage = d.destination || d.location;
    }

    // Check-in and Check-out
    if (d.checkInDate && !d.travelDate) {
      d.travelDate = d.checkInDate;
    }
    if (d.travelDate && !d.checkInDate) {
      d.checkInDate = d.travelDate;
    }
    if (d.checkOutDate && !d.returnDate) {
      d.returnDate = d.checkOutDate;
    }
    if (d.returnDate && !d.checkOutDate) {
      d.checkOutDate = d.returnDate;
    }

    // Number of Guests (PAX)
    if (d.guestsCount !== undefined || d.pax !== undefined) {
      const pax = Number(d.guestsCount || d.pax || 1);
      d.adults = pax > 0 ? pax : 1;
      d.guestsCount = pax > 0 ? pax : 1;
    } else if (d.adults !== undefined) {
      d.guestsCount = (Number(d.adults) || 1) + (Number(d.children) || 0);
    }

    // Defaults
    if (d.consent === undefined) {
      d.consent = true;
    }
    if (!d.streetAddress) d.streetAddress = 'Registered Member Address';
    if (!d.stateProvince) d.stateProvince = 'Abu Dhabi';
    if (!d.nationality) d.nationality = 'United Arab Emirates';
    if (!d.activitiesRequired) d.activitiesRequired = 'Holiday Reservation Booking';

    return d;
  }, bookingBaseSchema)
  .refine(
    (data) => {
      const start = data.checkInDate || data.travelDate;
      const end = data.checkOutDate || data.returnDate;
      if (start && end) {
        const inDate = new Date(start);
        const outDate = new Date(end);
        if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime())) {
          return outDate > inDate;
        }
      }
      return true;
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOutDate'],
    }
  );

export const validateBooking = (data) => {
  return bookingSchema.safeParse(data);
};

