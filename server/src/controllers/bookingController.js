import { validateBooking } from '../validators/bookingValidator.js';
import { store } from '../services/storeService.js';

export const createBooking = async (req, res, next) => {
  try {
    const validation = validateBooking(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Invalid booking enquiry submission.',
        errors,
      });
    }

    const booking = await store.createBooking(validation.data);

    res.status(201).json({
      success: true,
      message:
        'Your travel enquiry has been successfully registered. A Nex World Travel specialist will review your preferences and contact you with a curated itinerary.',
      data: {
        enquiryNumber: booking.enquiryNumber,
        status: booking.status,
        recipient: `${booking.prefix} ${booking.firstName} ${booking.lastName}`,
        destination: booking.destinationOrPackage,
        travelDate: booking.travelDate,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await store.getBookings();
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

