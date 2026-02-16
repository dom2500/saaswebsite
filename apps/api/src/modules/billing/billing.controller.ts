import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../common/auth.middleware.js";
import { validateBody } from "../../common/validate.js";
import { BillingService } from "./billing.service.js";
import { createCheckoutSchema } from "./billing.schemas.js";

const service = new BillingService();
export const billingRouter = Router();

billingRouter.post("/checkout-session", requireAuth, validateBody(createCheckoutSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const data = await service.createCheckoutSession(req.auth!.user, req.body);
    return res.status(201).json(data);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
});

billingRouter.post("/webhook", async (req, res) => {
  try {
    const signature = req.header("stripe-signature");
    const event = service.verifyWebhook(req.body as Buffer, signature);
    const result = service.handleWebhook(event);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
});
