import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { db, nextId, type User } from "../../data/store.js";
import type { LoginInput, RegisterInput, RequestResetInput, ResetPasswordInput } from "./auth.schemas.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

export class AuthService {
  async register(input: RegisterInput) {
    const existing = [...db.users.values()].find((u) => u.email === input.email);
    if (existing) {
      throw new Error("Email is already registered");
    }

    const tenantId = nextId("tenant");
    db.tenants.set(tenantId, { id: tenantId, name: input.tenantName });

    const user: User = {
      id: nextId("user"),
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      name: input.name,
      tenantId,
      role: input.role
    };

    db.users.set(user.id, user);

    return this.createAuthResponse(user);
  }

  async login(input: LoginInput) {
    const user = [...db.users.values()].find((u) => u.email === input.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new Error("Invalid credentials");
    }

    return this.createAuthResponse(user);
  }

  logout(token: string) {
    db.revokedTokens.add(token);
    return { message: "Logged out successfully" };
  }

  requestPasswordReset(input: RequestResetInput) {
    const user = [...db.users.values()].find((u) => u.email === input.email);
    if (!user) {
      return { message: "If email exists, a reset token has been generated" };
    }

    user.resetToken = crypto.randomUUID();
    user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60_000);
    db.users.set(user.id, user);

    return {
      message: "Password reset token created",
      resetToken: user.resetToken
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = [...db.users.values()].find((u) => u.resetToken === input.token);
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new Error("Invalid or expired reset token");
    }

    user.passwordHash = await bcrypt.hash(input.newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;
    db.users.set(user.id, user);

    return { message: "Password reset successfully" };
  }

  private createAuthResponse(user: User) {
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role
      }
    };
  }
}
