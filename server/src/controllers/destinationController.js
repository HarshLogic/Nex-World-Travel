import { store } from '../services/storeService.js';

export const getDestinations = async (req, res, next) => {
  try {
    const { region, featured } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (featured !== undefined) filter.featured = featured === 'true';

    const destinations = await store.getDestinations(filter);
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

