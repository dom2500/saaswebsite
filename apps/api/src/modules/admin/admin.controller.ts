import { Router } from "express";
import { requireAuth, requireRole } from "../../common/auth.middleware.js";
import { AdminService } from "./admin.service.js";

const service = new AdminService();
export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/users", (_req, res) => {
  return res.json({ users: service.listUsers() });
});

adminRouter.get("/subscriptions", (_req, res) => {
  return res.json({ subscriptions: service.listSubscriptions() });
});
