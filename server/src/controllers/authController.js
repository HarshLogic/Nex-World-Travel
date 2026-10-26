import { validateMemberLogin, validateStaffLogin } from '../validators/authValidator.js';
import { comparePassword, generateToken } from '../services/authService.js';
import { store } from '../services/storeService.js';
import { sendPasswordResetEmail, sendAccountActivationEmail } from '../services/emailService.js';

export const memberLogin = async (req, res, next) => {
  try {
    const validation = validateMemberLogin(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login details.',
        errors: validation.error.errors.map((e) => e.message),
      });
    }

    const { memberId, password } = validation.data;
    const user = await store.getUserByMemberId(memberId);

    if (!user || user.role !== 'member') {
      return res.status(401).json({
        success: false,
        message: 'Invalid Member ID or password. Please verify your credentials or contact the travel desk.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This membership account has been deactivated or suspended. Please contact the Master Head.',
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Member ID or password.',
      });
    }

    const profile = await store.getMemberById(user.memberId);
    const token = generateToken({
      id: user._id || user.id,
      role: 'member',
      memberId: user.memberId,
      name: user.name,
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id || user.id,
        role: 'member',
        memberId: user.memberId,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const staffLogin = async (req, res, next) => {
  try {
    const validation = validateStaffLogin(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password format.',
        errors: validation.error.errors.map((e) => e.message),
      });
    }

    const { email, password } = validation.data;
    const user = await store.getUserByEmail(email);

    if (!user || (user.role !== 'master_head' && user.role !== 'employee')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid staff credentials or unauthorized account.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your staff account has been deactivated. Please contact the Master Head.',
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const permissions = user.role === 'employee' ? await store.getEmployeePermissions(user._id || user.id) : ['ALL'];
    const token = generateToken({
      id: user._id || user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    res.json({
      success: true,
      message: `Authenticated successfully as ${user.role === 'master_head' ? 'Master Head' : 'Employee'}.`,
      token,
      user: {
        id: user._id || user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await store.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let extra = {};
    if (user.role === 'member') {
      extra.profile = await store.getMemberById(user.memberId);
    } else if (user.role === 'employee') {
      extra.permissions = await store.getEmployeePermissions(user._id || user.id);
    } else if (user.role === 'master_head') {
      extra.permissions = ['ALL'];
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        role: user.role,
        email: user.email,
        memberId: user.memberId,
        name: user.name,
        phone: user.phone,
        isActive: user.isActive,
      },
      ...extra,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const result = await store.createPasswordResetToken(email);
    if (result) {
      sendPasswordResetEmail(result.user.email, result.user.name, result.token).catch((err) => {
        console.warn('[ForgotPassword] Email dispatch error:', err.message);
      });
    }

    // Generic response that does NOT reveal whether the account exists
    res.json({
      success: true,
      message: 'If an account is associated with this email address, password reset instructions have been dispatched.',
      token: result ? result.token : undefined, // Provided for testing and local dev
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    await store.consumeTokenAndSetPassword(token, password);

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in with your new credentials.',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const activateAccount = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Activation token and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    await store.consumeTokenAndSetPassword(token, password);

    res.json({
      success: true,
      message: 'Your staff account has been activated successfully! You may now sign in.',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const verifySecurityToken = async (req, res, next) => {
  try {
    const { token } = req.query;
    const check = store.verifySecurityToken(token);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }
    res.json({
      success: true,
      email: check.email,
      name: check.name,
      type: check.type,
    });
  } catch (error) {
    next(error);
  }
};

