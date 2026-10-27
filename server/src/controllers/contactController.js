import { validateContact } from '../validators/contactValidator.js';
import { store } from '../services/storeService.js';
import { sendContactNotification } from '../services/emailService.js';

export const createContact = async (req, res, next) => {
  try {
    const validation = validateContact(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Invalid contact form submission.',
        errors,
      });
    }

    const contact = await store.createContact(validation.data);

    // Asynchronously dispatch to customer care desk (customercare@nexworldtravel.com)
    sendContactNotification(contact).catch((err) => {
      console.error('[ContactController] Email dispatch failed:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. An official Nex World Travel consultant will get back to you shortly.',
      data: {
        ticketNumber: contact.ticketNumber,
        fullName: contact.fullName,
        subject: contact.subject,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const contacts = await store.getContacts();
    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

