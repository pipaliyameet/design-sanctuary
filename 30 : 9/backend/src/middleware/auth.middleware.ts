import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { verifyToken, TokenPayload } from "../utils/jwt.js";
import { getCollection } from "../config/database.js";
import { UserDoc } from "../models/types.js";
import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserDoc & { id: string };
      tokenPayload?: TokenPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[env.COOKIE_NAME];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return next();
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return next();
    }

    req.tokenPayload = payload;

    const usersCol = await getCollection<UserDoc>("users");
    let query: any = { email: payload.email.toLowerCase() };
    if (ObjectId.isValid(payload.userId)) {
      query = { $or: [{ _id: new ObjectId(payload.userId) }, { email: payload.email.toLowerCase() }] };
    }

    const userDoc = await usersCol.findOne(query);
    if (userDoc && userDoc.isActive !== false) {
      req.user = {
        ...userDoc,
        id: String(userDoc._id),
      };
    }

    return next();
  } catch (err) {
    console.error("[Auth Middleware] Error verifying token:", err);
    return next();
  }
}
