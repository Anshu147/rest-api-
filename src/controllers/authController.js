import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.registerUser({ name, email, password });
  return sendSuccess(res, 201, 'User registered successfully', result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  return sendSuccess(res, 200, 'Login successful', result);
});

export const getMe = asyncHandler(async (req, res) => {
  const profile = await authService.getUserProfile(req.user.id);
  return sendSuccess(res, 200, 'User profile retrieved successfully', { user: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const updatedProfile = await authService.updateUserProfile(req.user.id, { name, email, password });
  return sendSuccess(res, 200, 'Profile updated successfully', { user: updatedProfile });
});
