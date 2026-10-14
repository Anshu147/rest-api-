import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/index.js';
import { unauthorized } from '../utils/apiError.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw unauthorized('Authentication required. Bearer token not provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw unauthorized('Malformed authorization token.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw unauthorized('Token has expired. Please log in again.');
      }
      throw unauthorized('Invalid token signature or payload.');
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw unauthorized('User associated with this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  );
};
