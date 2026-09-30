import { Response } from "express";

export function sendSuccess<T = any>(res: Response, data: T, message?: string, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}

export function sendError(res: Response, message: string, statusCode = 400, code?: string, details?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(code ? { code } : {}),
    ...(details ? { details } : {}),
  });
}
