import { store } from '../services/storeService.js';

export const getPackages = async (req, res, next) => {
  try {
    const { region } = req.query;
    const filter = {};
    if (region) filter.region = region;

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
        message: `Package with slug '${slug}' was not found.`,
      });
    }

    res.json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

