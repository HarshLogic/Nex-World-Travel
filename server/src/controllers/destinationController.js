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
