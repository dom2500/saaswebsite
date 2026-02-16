import { db, type User } from "../../data/store.js";
import type { UpdateProfileInput } from "./user-tenant.schemas.js";

export class UserTenantService {
  getProfile(user: User) {
    const tenant = db.tenants.get(user.tenantId);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant: tenant ?? null
    };
  }

  updateProfile(user: User, input: UpdateProfileInput) {
    const next = {
      ...user,
      ...input
    };

    db.users.set(next.id, next);
    return this.getProfile(next);
  }
}
