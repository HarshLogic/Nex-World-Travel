import crypto from 'crypto';
import { store } from '../services/storeService.js';

export const getActivities = async (req, res, next) => {
  try {
    const { category, region, featured, search, publicationStatus } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (region) filter.region = region;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (search) filter.search = search;
    filter.publicationStatus = publicationStatus || (req.user ? undefined : 'published');

    const activities = await store.getActivities(filter);
    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const activity = await store.getActivityBySlug(slug);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: `Activity with identifier '${slug}' was not found.`,
      });
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityImage = async (req, res, next) => {
  try {
    const { id, slug } = req.params;
    const identifier = id || slug;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Activity identifier is required.' });
    }

    const imageRecord = await store.getActivityImage(identifier);
    if (!imageRecord || !imageRecord.buffer) {
      return res.status(404).json({
        success: false,
        message: `Image for activity '${identifier}' was not found.`,
      });
    }

    // Publication check: if draft and not authenticated staff/admin, return 404
    if (imageRecord.publicationStatus === 'draft') {
      const isAuthorized = req.user && ['master_head', 'employee', 'admin'].includes(req.user.role);
      if (!isAuthorized) {
        return res.status(404).json({
          success: false,
          message: `Image for activity '${identifier}' was not found.`,
        });
      }
    }

    // Generate MD5 ETag
    const hash = crypto.createHash('md5').update(imageRecord.buffer).digest('hex');
    const etag = `"${hash}"`;

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');

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

export const uploadActivityImage = async (req, res, next) => {
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

    const updated = await store.saveActivityImageDirect(id, rawImage, originalName, author);

    res.status(200).json({
      success: true,
      message: `Image for activity '${updated.title}' uploaded and stored in MongoDB successfully.`,
      activity: updated,
      imageUrl: `/api/v1/activities/${updated.slug}/image`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload activity image.',
    });
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const { title, location, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required fields for an activity.',
      });
    }

    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';
    const activity = await store.createActivity(req.body, author);

    res.status(201).json({
      success: true,
      message: `Activity '${activity.title}' created successfully.`,
      activity,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';
    const updated = await store.updateActivity(id, req.body, author);

    res.json({
      success: true,
      message: `Activity '${updated.title}' updated successfully.`,
      activity: updated,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';
    const result = await store.deleteActivity(id, author);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
