import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nex_world_travel_jwt_super_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

