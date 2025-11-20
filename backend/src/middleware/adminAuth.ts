import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from './errorHandler';

export const adminAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!env.ADMIN_API_KEY) {
    return next(new ApiError(500, 'Admin API key is not configured'));
  }

  const adminKey = req.header('x-admin-key');

  if (adminKey !== env.ADMIN_API_KEY) {
    return next(new ApiError(401, 'Unauthorized admin access'));
  }

  next();
};
