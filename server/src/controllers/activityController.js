import { store } from '../services/storeService.js';

export const getActivities = async (req, res, next) => {
  try {
    const { category, region } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (region) filter.region = region;

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
        message: `Activity with slug '${slug}' was not found.`,
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
