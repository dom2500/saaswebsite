export type Role = "user" | "admin";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  tenantId: string;
  role: Role;
  resetToken?: string;
  resetTokenExpiresAt?: Date;
}

export interface Tenant {
  id: string;
  name: string;
}

export type SubscriptionStatus = "inactive" | "active" | "canceled" | "payment_failed";

export interface Subscription {
  id: string;
  userId: string;
  customerId: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  updatedAt: Date;
}

export const db = {
  users: new Map<string, User>(),
  tenants: new Map<string, Tenant>(),
  subscriptions: new Map<string, Subscription>(),
  revokedTokens: new Set<string>()
};

let sequence = 1;

export const nextId = (prefix: string): string => `${prefix}_${sequence++}`;
