import crypto from 'crypto';
import { store } from '../services/storeService.js';

export const getPackages = async (req, res, next) => {
  try {
    const { region, featured, search, publicationStatus, includeDrafts } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (search) filter.search = search;

    // Staff/admin can request drafts; otherwise only published packages are served
    const isStaffOrAdmin = req.user && ['master_head', 'employee', 'admin'].includes(req.user.role);
    if (publicationStatus) {
      filter.publicationStatus = publicationStatus;
    } else if (includeDrafts === 'true' && isStaffOrAdmin) {
      filter.includeDrafts = true;
    } else if (!isStaffOrAdmin) {
      filter.publicationStatus = 'published';
    }

    const packages = await store.getPackages(filter);
    res.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

export const getPackageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const pkg = await store.getPackageBySlug(slug);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: `Package with slug or identifier '${slug}' was not found.`,
      });
    }

    // Publication check: if draft and not authenticated staff/admin, return 404
    if (pkg.publicationStatus === 'draft') {
      const isAuthorized = req.user && ['master_head', 'employee', 'admin'].includes(req.user.role);
      if (!isAuthorized) {
        return res.status(404).json({
          success: false,
          message: `Package with identifier '${slug}' was not found.`,
        });
      }
    }

    res.json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

export const getPackageImage = async (req, res, next) => {
  try {
    const { id, slug } = req.params;
    const identifier = id || slug;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Package identifier is required.' });
    }

    const imageRecord = await store.getPackageImage(identifier);
    if (!imageRecord || !imageRecord.buffer) {
      return res.status(404).json({
        success: false,
        message: `Image for package '${identifier}' was not found.`,
      });
    }

    // Publication check: if draft and not authenticated staff/admin, return 404
    if (imageRecord.publicationStatus === 'draft') {
      const isAuthorized = req.user && ['master_head', 'employee', 'admin'].includes(req.user.role);
      if (!isAuthorized) {
        return res.status(404).json({
          success: false,
          message: `Image for package '${identifier}' was not found.`,
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

export const uploadPackageImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user ? `${req.user.name || req.user.email} (${req.user.email})` : 'Master Head';

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

    const updated = await store.savePackageImageDirect(id, rawImage, originalName, author);

    res.status(200).json({
      success: true,
      message: `Image for package '${updated.title}' uploaded and stored in MongoDB successfully.`,
      package: updated,
      imageUrl: `/api/v1/packages/${updated.slug}/image`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload package image.',
    });
  }
};

export const createPackage = async (req, res, next) => {
  try {
    const { title, destination, region, durationDays } = req.body;

    if (!title || !destination || !region) {
      return res.status(400).json({
        success: false,
        message: 'Package title, destination, and region are required fields.',
      });
    }

    const author = req.user ? `${req.user.name || req.user.email} (${req.user.email})` : 'Master Head';
    const newPkg = await store.createPackage(req.body, author);

    res.status(201).json({
      success: true,
      message: `Holiday package '${newPkg.title}' created successfully.`,
      data: newPkg,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create holiday package.',
    });
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user ? `${req.user.name || req.user.email} (${req.user.email})` : 'Master Head';

    const updated = await store.updatePackage(id, req.body, author);

    res.status(200).json({
      success: true,
      message: `Holiday package '${updated.title}' updated successfully.`,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update holiday package.',
    });
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user ? `${req.user.name || req.user.email} (${req.user.email})` : 'Master Head';

    const result = await store.deletePackage(id, author);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
