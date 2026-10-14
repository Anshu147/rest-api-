import { Op } from 'sequelize';
import { User, sanitizeUser, comparePassword } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';
import { badRequest, unauthorized, conflict, notFound } from '../utils/apiError.js';

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw conflict('An account with this email address already exists.');
  }

  // Create new user (password is automatically hashed by Sequelize hook)
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password
  });

  const token = generateToken(user);
  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    token
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    throw unauthorized('Invalid email or password credentials.');
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw unauthorized('Invalid email or password credentials.');
  }

  const token = generateToken(user);
  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    token
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw notFound('User profile not found.');
  }
  return sanitizeUser(user);
};

export const updateUserProfile = async (userId, { name, email, password }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw notFound('User profile not found.');
  }

  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail !== user.email) {
      const emailInUse = await User.findOne({
        where: {
          email: normalizedEmail,
          id: { [Op.ne]: userId }
        }
      });

      if (emailInUse) {
        throw conflict('The specified email address is already in use by another account.');
      }
      user.email = normalizedEmail;
    }
  }

  if (name) {
    user.name = name.trim();
  }

  if (password) {
    user.password = password; // Trigger hook to rehash
  }

  await user.save();

  return sanitizeUser(user);
};
