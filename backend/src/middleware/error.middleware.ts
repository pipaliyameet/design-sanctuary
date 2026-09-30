import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";
import { ZodError } from "zod";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] [${req.method} ${req.url}]:`, err);

  if (err instanceof ZodError) {
    const errorDetails = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return sendError(res, "Validation failed", 400, "VALIDATION_ERROR", errorDetails);
  }

  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  const message = err.message || "An unexpected server error occurred.";
  const code = err.code || "INTERNAL_SERVER_ERROR";

  return sendError(res, message, statusCode, code);
}
