import Stripe from "stripe";
import { db, nextId, type Subscription, type User } from "../../data/store.js";
import type { CreateCheckoutInput } from "./billing.schemas.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2024-06-20"
});

export class BillingService {
  async createCheckoutSession(user: User, input: CreateCheckoutInput) {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: input.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        tenantId: user.tenantId
      }
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return {
      checkoutSessionId: session.id,
      checkoutUrl: session.url
    };
  }

  handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        this.upsertSubscription({
          userId: session.client_reference_id ?? "unknown",
          customerId: String(session.customer ?? "unknown"),
          stripeSubscriptionId: String(session.subscription ?? ""),
          status: "active"
        });
        return { message: "Subscription activated" };
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        this.updateByStripeSubscriptionId(sub.id, "canceled");
        return { message: "Subscription canceled" };
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        this.updateByStripeSubscriptionId(String(invoice.subscription ?? ""), "payment_failed");
        return { message: "Subscription payment failed" };
      }
      default:
        return { message: `Event ${event.type} ignored` };
    }
  }

  verifyWebhook(rawBody: Buffer, signature: string | undefined) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !signature) {
      throw new Error("Missing Stripe webhook secret or signature");
    }

    return stripe.webhooks.constructEvent(rawBody, signature, secret);
  }

  private upsertSubscription(input: Omit<Subscription, "id" | "updatedAt">) {
    const existing = [...db.subscriptions.values()].find((s) => s.userId === input.userId);

    const next: Subscription = {
      id: existing?.id ?? nextId("sub"),
      updatedAt: new Date(),
      ...input
    };

    db.subscriptions.set(next.id, next);
  }

  private updateByStripeSubscriptionId(stripeSubscriptionId: string, status: Subscription["status"]) {
    const subscription = [...db.subscriptions.values()].find((s) => s.stripeSubscriptionId === stripeSubscriptionId);
    if (!subscription) {
      return;
    }

    subscription.status = status;
    subscription.updatedAt = new Date();
    db.subscriptions.set(subscription.id, subscription);
  }
}
