import { store } from '../services/storeService.js';

export const getAvailabilities = async (req, res, next) => {
  try {
    const { destination, packageTier, isAvailable, search, memberId } = req.query;
    const availabilities = await store.getAvailabilities({
      destination,
      packageTier,
      isAvailable,
      search,
      memberId,
    });
    res.json({
      success: true,
      count: availabilities.length,
      data: availabilities,
    });
  } catch (error) {
    next(error);
  }
};

export const createAvailability = async (req, res, next) => {
  try {
    const {
      title,
      destinationOrPlan,
      packageTier,
      startDate,
      endDate,
      isAvailable,
      availableSeats,
      notes,
      memberId,
      memberName,
    } = req.body;

    if (!title || !destinationOrPlan || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Trip title, destination/plan, start date, and end date are required.',
      });
    }

    const author = req.user?.email || req.user?.name || 'Master Administrator';
    const availability = await store.createAvailability(
      {
        title,
        destinationOrPlan,
        packageTier,
        startDate,
        endDate,
        isAvailable,
        availableSeats,
        notes,
        memberId,
        memberName,
      },
      author
    );

    res.status(201).json({
      success: true,
      message: `Trip availability '${availability.title}' created successfully.`,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user?.email || req.user?.name || 'Master Administrator';
    const updated = await store.updateAvailability(id, req.body, author);

    res.json({
      success: true,
      message: `Trip availability updated successfully.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = req.user?.email || req.user?.name || 'Master Administrator';
    await store.deleteAvailability(id, author);

    res.json({
      success: true,
      message: 'Trip availability record removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

