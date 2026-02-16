import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db, type Role, type User } from "../data/store.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";

export interface AuthenticatedRequest extends Request {
  auth?: {
    token: string;
    user: User;
  };
}

interface JwtPayload {
  sub: string;
  role: Role;
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: "Missing bearer token" });
  }

  if (db.revokedTokens.has(token)) {
    return res.status(401).json({ message: "Token has been revoked" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = db.users.get(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.auth = { token, user };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (role: Role) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth?.user || req.auth.user.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    return next();
  };
};
