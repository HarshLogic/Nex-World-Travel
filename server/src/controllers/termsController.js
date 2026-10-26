import { store } from '../services/storeService.js';

export const getTerms = async (req, res, next) => {
  try {
    const terms = await store.getTerms();
    res.json({
      success: true,
      terms,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTerms = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Terms content cannot be empty.' });
    }

    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';
    const updated = await store.updateTerms(content, author);

    res.json({
      success: true,
      message: 'Terms & conditions updated successfully.',
      terms: updated,
    });
  } catch (error) {
    next(error);
  }
};

