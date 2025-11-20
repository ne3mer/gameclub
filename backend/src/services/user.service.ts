import { UserModel, type UserDocument } from '../models/user.model';
import { ApiError } from '../middleware/errorHandler';

export const getAllUsers = async () => {
  return UserModel.find().select('-password').sort({ createdAt: -1 });
};

export const getUserById = async (userId: string) => {
  const user = await UserModel.findById(userId).select('-password');
  if (!user) {
    throw new ApiError(404, 'کاربر یافت نشد');
  }
  return user;
};

export const getUserByEmail = async (email: string) => {
  return UserModel.findOne({ email: email.toLowerCase().trim() }).select('-password');
};

export const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'کاربر یافت نشد');
  }

  return user;
};

export const updateUser = async (userId: string, updates: Partial<Pick<UserDocument, 'name' | 'phone' | 'telegram'>>) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'کاربر یافت نشد');
  }

  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, 'کاربر یافت نشد');
  }
  return { message: 'کاربر با موفقیت حذف شد' };
};

