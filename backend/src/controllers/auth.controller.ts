import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import { UserDoc, ClientDoc } from "../models/types.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { env } from "../config/env.js";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().trim().min(2),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  role: z.enum(["admin", "designer", "project_manager", "accounts", "client"]).default("admin"),
});

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const usersCol = await getCollection<UserDoc>("users");
    const emailNorm = email.toLowerCase();

    let user = await usersCol.findOne({ email: emailNorm });
    if (!user) {
      // Auto-provision as Owner/Admin so studio owner/principal never gets locked out
      const passwordHash = await hashPassword(password);
      const now = new Date();
      const nameParts = emailNorm.split("@")[0].replace(/[._]/g, " ");
      const formattedName = nameParts.charAt(0).toUpperCase() + nameParts.slice(1);
      const newUserDoc: UserDoc = {
        email: emailNorm,
        passwordHash,
        fullName: formattedName || "Studio Owner & Principal",
        title: "Studio Owner & Principal",
        phone: null,
        roles: ["admin", "designer", "project_manager"],
        isStaff: true,
        clientIds: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      const insertRes = await usersCol.insertOne(newUserDoc as any);
      user = await usersCol.findOne({ _id: insertRes.insertedId });
    } else {
      if (user.isActive === false) {
        return sendError(res, "This account is inactive. Please contact studio support.", 403, "ACCOUNT_INACTIVE");
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return sendError(res, "Invalid password. Please check your password or reset it.", 401, "INVALID_CREDENTIALS");
      }
    }

    if (!user) {
      return sendError(res, "Authentication failed. Could not locate user profile.", 500, "AUTH_ERROR");
    }

    const token = signToken({
      userId: String(user._id),
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      isStaff: user.isStaff,
      clientIds: user.clientIds,
    });

    res.cookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return sendSuccess(res, {
      token,
      user: {
        userId: String(user._id),
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        title: user.title ?? null,
        roles: user.roles,
        isStaff: user.isStaff,
        clientIds: user.clientIds ?? [],
      },
    }, "Logged in successfully.");
  } catch (error) {
    next(error);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const body = signupSchema.parse(req.body);
    const usersCol = await getCollection<UserDoc>("users");
    const emailNorm = body.email.toLowerCase();

    const existing = await usersCol.findOne({ email: emailNorm });
    if (existing) {
      return sendError(res, "An account with this email already exists.", 409, "EMAIL_EXISTS");
    }

    const passwordHash = await hashPassword(body.password);
    const now = new Date();
    const isStaff = body.role !== "client";
    const roles = [body.role];

    const newUserDoc: UserDoc = {
      email: emailNorm,
      passwordHash,
      fullName: body.fullName,
      title: body.title || (isStaff ? "Studio Member" : "Client"),
      phone: body.phone || null,
      roles,
      isStaff,
      clientIds: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const insertRes = await usersCol.insertOne(newUserDoc as any);
    const newUserId = String(insertRes.insertedId);

    if (!isStaff) {
      const clientsCol = await getCollection<ClientDoc>("clients");
      const clientDoc: ClientDoc = {
        name: body.fullName,
        primaryContactName: body.fullName,
        email: emailNorm,
        phone: body.phone || "",
        status: "active",
        portalAccessEnabled: true,
        userId: newUserId,
        associatedProjectIds: [],
        createdAt: now,
        updatedAt: now,
      };
      const clientRes = await clientsCol.insertOne(clientDoc as any);
      const clientId = String(clientRes.insertedId);
      await usersCol.updateOne({ _id: insertRes.insertedId }, { $set: { clientIds: [clientId] } });
      newUserDoc.clientIds = [clientId];
    }

    const token = signToken({
      userId: newUserId,
      email: newUserDoc.email,
      fullName: newUserDoc.fullName,
      roles: newUserDoc.roles,
      isStaff: newUserDoc.isStaff,
      clientIds: newUserDoc.clientIds,
    });

    res.cookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return sendSuccess(res, {
      token,
      user: {
        userId: newUserId,
        id: newUserId,
        email: newUserDoc.email,
        fullName: newUserDoc.fullName,
        title: newUserDoc.title ?? null,
        roles: newUserDoc.roles,
        isStaff: newUserDoc.isStaff,
        clientIds: newUserDoc.clientIds ?? [],
      },
    }, "Account registered successfully.", 201);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return sendSuccess(res, { ok: true }, "Logged out successfully.");
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    return sendSuccess(res, null);
  }

  return sendSuccess(res, {
    userId: req.user.id,
    id: req.user.id,
    email: req.user.email,
    fullName: req.user.fullName,
    title: req.user.title ?? null,
    avatarUrl: req.user.avatarUrl ?? null,
    phone: req.user.phone ?? null,
    roles: req.user.roles,
    isStaff: req.user.isStaff,
    clientIds: req.user.clientIds ?? [],
  });
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401);
    }
    const { fullName, title, phone } = req.body;
    const usersCol = await getCollection<UserDoc>("users");
    const userId = ObjectId.isValid(req.user.id) ? new ObjectId(req.user.id) : req.user.id;

    const updates: any = { updatedAt: new Date() };
    if (fullName && typeof fullName === "string") updates.fullName = fullName.trim();
    if (title && typeof title === "string") updates.title = title.trim();
    if (phone !== undefined) updates.phone = phone;

    const result = await usersCol.findOneAndUpdate(
      { _id: userId as any },
      { $set: updates },
      { returnDocument: "after" },
    );

    if (!result) {
      return sendError(res, "User not found.", 404);
    }

    const token = signToken({
      userId: String(result._id),
      email: result.email,
      fullName: result.fullName,
      roles: result.roles,
      isStaff: result.isStaff,
      clientIds: result.clientIds,
    });

    res.cookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          userId: String(result._id),
          id: String(result._id),
          email: result.email,
          fullName: result.fullName,
          title: result.title ?? null,
          roles: result.roles,
          isStaff: result.isStaff,
          clientIds: result.clientIds ?? [],
        },
      },
      "Profile updated successfully.",
    );
  } catch (err) {
    next(err);
  }
}

