export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_TOKEN || 'nex_admin_secret_key_2026';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid administrative authorization token.',
    });
  }

  const token = authHeader.split(' ')[1];
  if (token !== adminSecret) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid administrative credentials.',
    });
  }

  next();
};
