import { db } from "../../data/store.js";

export class AdminService {
  listUsers() {
    return [...db.users.values()].map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      role: user.role
    }));
  }

  listSubscriptions() {
    return [...db.subscriptions.values()];
  }
}
