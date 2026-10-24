import mongoose from 'mongoose';
import { Destination } from '../models/Destination.js';
import { Activity } from '../models/Activity.js';
import { Package } from '../models/Package.js';
import { Booking } from '../models/Booking.js';
import { Contact } from '../models/Contact.js';
import { seedDestinations, seedActivities, seedPackages } from '../data/seedData.js';

class ResilientStore {
  constructor() {
    this.destinations = [...seedDestinations];
    this.activities = [...seedActivities];
    this.packages = [...seedPackages];
    this.bookings = [];
    this.contacts = [];
  }

  isMongoLive() {
    return mongoose.connection.readyState === 1;
  }

  generateCode(prefix = 'NEX') {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
  }

  async getDestinations(filter = {}) {
    if (this.isMongoLive()) {
      try {
        const count = await Destination.countDocuments();
        if (count === 0) {
          await Destination.insertMany(seedDestinations);
        }
        return await Destination.find(filter).lean();
      } catch (e) {
        // Fallback
      }
    }
    let results = [...this.destinations];
    if (filter.region) {
      results = results.filter((d) => d.region.toLowerCase() === filter.region.toLowerCase());
    }
    if (filter.featured !== undefined) {
      results = results.filter((d) => d.featured === filter.featured);
    }
    return results;
  }

  async getDestinationBySlug(slug) {
    if (this.isMongoLive()) {
      try {
        const found = await Destination.findOne({ slug: slug.toLowerCase() }).lean();
        if (found) return found;
      } catch (e) {
        // Fallback
      }
    }
    return this.destinations.find((d) => d.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  async getActivities(filter = {}) {
    if (this.isMongoLive()) {
      try {
        const count = await Activity.countDocuments();
        if (count === 0) {
          await Activity.insertMany(seedActivities);
        }
        return await Activity.find(filter).lean();
      } catch (e) {
        // Fallback
      }
    }
    let results = [...this.activities];
    if (filter.category) {
      results = results.filter((a) => a.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.region) {
      results = results.filter((a) => a.region.toLowerCase() === filter.region.toLowerCase());
    }
    return results;
  }

  async getActivityBySlug(slug) {
    if (this.isMongoLive()) {
      try {
        const found = await Activity.findOne({ slug: slug.toLowerCase() }).lean();
        if (found) return found;
      } catch (e) {
        // Fallback
      }
    }
    return this.activities.find((a) => a.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  async getPackages(filter = {}) {
    if (this.isMongoLive()) {
      try {
        const count = await Package.countDocuments();
        if (count === 0) {
          await Package.insertMany(seedPackages);
        }
        return await Package.find(filter).lean();
      } catch (e) {
        // Fallback
      }
    }
    let results = [...this.packages];
    if (filter.region) {
      results = results.filter((p) => p.region.toLowerCase() === filter.region.toLowerCase());
    }
    return results;
  }

  async getPackageBySlug(slug) {
    if (this.isMongoLive()) {
      try {
        const found = await Package.findOne({ slug: slug.toLowerCase() }).lean();
        if (found) return found;
      } catch (e) {
        // Fallback
      }
    }
    return this.packages.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  async createBooking(bookingData) {
    const enquiryNumber = this.generateCode('NEX-BK');
    const record = {
      ...bookingData,
      enquiryNumber,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await Booking.create(record);
        return doc.toObject();
      } catch (e) {
        // Fallback
      }
    }

    this.bookings.unshift(record);
    return record;
  }

  async getBookings() {
    if (this.isMongoLive()) {
      try {
        return await Booking.find().sort({ createdAt: -1 }).lean();
      } catch (e) {
        // Fallback
      }
    }
    return this.bookings;
  }

  async createContact(contactData) {
    const ticketNumber = this.generateCode('NEX-CT');
    const record = {
      ...contactData,
      ticketNumber,
      status: 'unread',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await Contact.create(record);
        return doc.toObject();
      } catch (e) {
        // Fallback
      }
    }

    this.contacts.unshift(record);
    return record;
  }

  async getContacts() {
    if (this.isMongoLive()) {
      try {
        return await Contact.find().sort({ createdAt: -1 }).lean();
      } catch (e) {
        // Fallback
      }
    }
    return this.contacts;
  }
}

export const store = new ResilientStore();

