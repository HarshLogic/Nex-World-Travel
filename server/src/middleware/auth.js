import { verifyToken } from '../services/authService.js';
import { store } from '../services/storeService.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const decoded = verifyToken(token);
    const user = await store.getUserById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists.',
      });
    }

    req.user = {
      id: user._id ? user._id.toString() : user.id,
      role: user.role,
      email: user.email,
      memberId: user.memberId,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const user = await store.getUserById(decoded.id);
        if (user && user.isActive) {
          req.user = {
            id: user._id ? user._id.toString() : user.id,
            role: user.role,
            email: user.email,
            memberId: user.memberId,
            name: user.name,
          };
        }
      }
    }
  } catch (error) {
    // Optional auth - gracefully continue as unauthenticated guest
  }
  next();
};

export const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowed.join(', ')}].`,
      });
    }
    next();
  };
};

export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Master Head has full administrative power across all features
    if (req.user.role === 'master_head') {
      return next();
    }

    // If employee, inspect their permission assignment
    if (req.user.role === 'employee') {
      const permissions = await store.getEmployeePermissions(req.user.id);
      const permLower = permissionName.toLowerCase();
      const hasPerm = permissions && permissions.some(
        (p) => p.toLowerCase() === permLower || p.toUpperCase() === permissionName.toUpperCase()
      );
      if (hasPerm) {
        return next();
      }

      return res.status(403).json({
        success: false,
        requiresApproval: true,
        permissionNeeded: permissionName,
        message: `You do not have direct permission '${permissionName}'. Please submit an Employee Change Request for Master Head approval.`,
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: Insufficient privileges.',
    });
  };
};

export const requireMemberOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Staff and Master Head can view member details
  if (req.user.role === 'master_head' || req.user.role === 'employee') {
    return next();
  }

  // Members can only access their own member ID
  const requestedMemberId = req.params.memberId || req.params.id || req.query.memberId || req.body.memberId;
  if (requestedMemberId && requestedMemberId.toUpperCase() !== req.user.memberId?.toUpperCase()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Members are strictly restricted to accessing only their own membership records.',
    });
  }

  next();
};

// Legacy backward-compatibility for administrative routes
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_TOKEN || 'nex_admin_secret_key_2026';

  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === adminSecret) {
    return next();
  }

  // Also support token-based authentication with master_head or employee role
  return authenticate(req, res, () => {
    if (req.user && (req.user.role === 'master_head' || req.user.role === 'employee')) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Administrative credentials required.',
    });
  });
};
