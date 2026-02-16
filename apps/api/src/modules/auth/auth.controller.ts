import { Router } from "express";
import { validateBody } from "../../common/validate.js";
import { requireAuth, type AuthenticatedRequest } from "../../common/auth.middleware.js";
import { AuthService } from "./auth.service.js";
import { loginSchema, registerSchema, requestResetSchema, resetPasswordSchema } from "./auth.schemas.js";

const service = new AuthService();
export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  try {
    const data = await service.register(req.body);
    return res.status(201).json(data);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  try {
    const data = await service.login(req.body);
    return res.json(data);
  } catch (error) {
    return res.status(401).json({ message: (error as Error).message });
  }
});

authRouter.post("/logout", requireAuth, (req: AuthenticatedRequest, res) => {
  const data = service.logout(req.auth!.token);
  return res.json(data);
});

authRouter.post("/password-reset/request", validateBody(requestResetSchema), (req, res) => {
  const data = service.requestPasswordReset(req.body);
  return res.json(data);
});

authRouter.post("/password-reset/confirm", validateBody(resetPasswordSchema), async (req, res) => {
  try {
    const data = await service.resetPassword(req.body);
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
});
