import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppRole } from "../models/types.js";

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
  roles: AppRole[];
  isStaff: boolean;
  clientIds?: string[];
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
