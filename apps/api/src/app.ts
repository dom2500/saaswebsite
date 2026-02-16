import express from "express";
import { authRouter } from "./modules/auth/auth.controller.js";
import { userTenantRouter } from "./modules/user-tenant/user-tenant.controller.js";
import { billingRouter } from "./modules/billing/billing.controller.js";
import { adminRouter } from "./modules/admin/admin.controller.js";

export const createApp = () => {
  const app = express();

  app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/user", userTenantRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/admin", adminRouter);

  return app;
};
