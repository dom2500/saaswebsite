import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../common/auth.middleware.js";
import { validateBody } from "../../common/validate.js";
import { UserTenantService } from "./user-tenant.service.js";
import { updateProfileSchema } from "./user-tenant.schemas.js";

const service = new UserTenantService();
export const userTenantRouter = Router();

userTenantRouter.get("/profile", requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json(service.getProfile(req.auth!.user));
});

userTenantRouter.patch("/profile", requireAuth, validateBody(updateProfileSchema), (req: AuthenticatedRequest, res) => {
  return res.json(service.updateProfile(req.auth!.user, req.body));
});
