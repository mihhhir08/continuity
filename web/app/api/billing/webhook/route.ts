import { recordBillingEvent, updateSubscription, verifyStripeSignature } from "../_stripe";

type StripeObject = {
  id?: string;
  customer?: string;
  subscription?: string;
  status?: string;
  current_period_end?: number;
  metadata?: { organization_id?: string; plan?: string };
};

export async function POST(request: Request) {
  const raw = await request.text();
  if (!(await verifyStripeSignature(raw, request.headers.get("stripe-signature")))) {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }
  try {
    const event = JSON.parse(raw) as { id: string; type: string; data: { object: StripeObject } };
    if (!(await recordBillingEvent(event))) return Response.json({ received: true, duplicate: true });
    const object = event.data.object;
    const organizationId = object.metadata?.organization_id;
    if (!organizationId) return Response.json({ received: true, ignored: true });
    if (event.type === "checkout.session.completed") {
      await updateSubscription(organizationId, {
        plan: object.metadata?.plan || "pro",
        subscription_status: "active",
        stripe_customer_id: object.customer,
        stripe_subscription_id: object.subscription,
      });
    } else if (event.type === "customer.subscription.updated") {
      await updateSubscription(organizationId, {
        plan: object.metadata?.plan || "pro",
        subscription_status: object.status || "active",
        stripe_customer_id: object.customer,
        stripe_subscription_id: object.id,
        subscription_period_end: object.current_period_end ? new Date(object.current_period_end * 1000).toISOString() : null,
      });
    } else if (event.type === "customer.subscription.deleted") {
      await updateSubscription(organizationId, {
        plan: "free",
        subscription_status: "cancelled",
        stripe_subscription_id: null,
        subscription_period_end: null,
      });
    }
    return Response.json({ received: true });
  } catch {
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
