import { validateBooking } from '../validators/bookingValidator.js';
import { store } from '../services/storeService.js';
import { sendBookingNotification } from '../services/emailService.js';

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

    // Asynchronous email notification - reliable, doesn't crash booking submission if SMTP is offline
    sendBookingNotification(booking)
      .then(async (result) => {
        if (result.success) {
          await store.updateBooking(booking.enquiryNumber, { emailNotificationSent: true }, 'System Emailer');
        } else {
          await store.updateBooking(booking.enquiryNumber, { emailNotificationSent: false, note: `Email dispatch failed: ${result.error}` }, 'System Emailer');
        }
      })
      .catch((err) => {
        console.error('[BookingController] Background email dispatch error:', err.message);
      });

    res.status(201).json({
      success: true,
      message:
        'Your travel enquiry has been successfully registered. A Nex World Travel specialist will review your preferences and contact you with a curated itinerary within 24 hours.',
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
    const { status, search } = req.query;
    const bookings = await store.getBookings({ status, search });
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Staff';

    const updated = await store.updateBooking(id, { status, note }, author);

    res.json({
      success: true,
      message: `Booking '${id}' status updated to ${updated.status}.`,
      booking: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const addBookingNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });
    }

    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Staff';
    const updated = await store.updateBooking(id, { note }, author);

    res.json({
      success: true,
      message: 'Note added to booking record.',
      booking: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const retryBookingNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookings = await store.getBookings();
    const booking = bookings.find((b) => b.enquiryNumber === id || b._id === id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking enquiry not found.' });
    }

    const result = await sendBookingNotification(booking);
    if (result.success) {
      await store.updateBooking(booking.enquiryNumber, { emailNotificationSent: true }, req.user?.email || 'Staff');
      return res.json({ success: true, message: 'Email notification delivered successfully.' });
    }

    return res.status(500).json({
      success: false,
      message: `Failed to deliver email: ${result.error}`,
    });
  } catch (error) {
    next(error);
  }
};
