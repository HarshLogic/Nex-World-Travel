import crypto from 'crypto';
import { store } from '../services/storeService.js';

export const getDestinations = async (req, res, next) => {
  try {
    const { region, category, featured, publicationStatus } = req.query;
    const destinations = await store.getDestinations({
      region,
      category,
      featured: featured !== undefined ? featured === 'true' : undefined,
      publicationStatus: publicationStatus || (req.user ? undefined : 'published'),
    });

    res.json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

export const getDestinationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const destination = await store.getDestinationBySlug(slug);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: `Destination with slug '${slug}' was not found.`,
      });
    }

    res.json({
      success: true,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

export const createDestination = async (req, res, next) => {
  try {
    const { title, region, category, description, shortDescription, coverImage, highlights, popularCities } = req.body;

    if (!title || !region || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, region, and description are required fields.',
      });
    }

    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';
    const destination = await store.createDestination(req.body, author);

    res.status(201).json({
      success: true,
      message: `Destination '${destination.title}' created successfully.`,
      destination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Staff';
    const updated = await store.updateDestination(id, req.body, author);

    res.json({
      success: true,
      message: `Destination '${updated.title}' updated successfully.`,
      destination: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';
    const result = await store.deleteDestination(id, author);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDestinationImage = async (req, res, next) => {
  try {
    const { id, slug } = req.params;
    const identifier = id || slug;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Destination identifier is required.' });
    }

    const imageRecord = await store.getDestinationImage(identifier);
    if (!imageRecord || !imageRecord.buffer) {
      return res.status(404).json({
        success: false,
        message: `Image for destination '${identifier}' was not found.`,
      });
    }

    // Publication check: if draft and not authenticated staff/admin, return 404
    if (imageRecord.publicationStatus === 'draft') {
      const isAuthorized = req.user && ['master_head', 'employee', 'admin'].includes(req.user.role);
      if (!isAuthorized) {
        return res.status(404).json({
          success: false,
          message: `Image for destination '${identifier}' was not found.`,
        });
      }
    }

    // Generate MD5 ETag
    const hash = crypto.createHash('md5').update(imageRecord.buffer).digest('hex');
    const etag = `"${hash}"`;

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.setHeader('Content-Type', imageRecord.contentType || 'image/jpeg');
    res.setHeader('Content-Length', imageRecord.buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('ETag', etag);

    return res.end(imageRecord.buffer);
  } catch (error) {
    next(error);
  }
};

export const uploadDestinationImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';

    const rawImage =
      req.body?.data ||
      req.body?.imageData ||
      req.body?.image ||
      req.file?.buffer;
    const originalName =
      req.body?.name ||
      req.body?.originalName ||
      req.file?.originalname ||
      '';

    if (!rawImage) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please provide a valid JPEG, PNG, or WebP image.',
      });
    }

    const updated = await store.saveDestinationImageDirect(id, rawImage, originalName, author);

    res.status(200).json({
      success: true,
      message: `Image for destination '${updated.title}' uploaded and stored in MongoDB successfully.`,
      destination: updated,
      imageUrl: `/api/v1/destinations/${updated.slug}/image`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload destination image.',
    });
  }
};
