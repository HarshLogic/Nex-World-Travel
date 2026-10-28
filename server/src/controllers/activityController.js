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
