import { accountContext, billingConfigured, priceFor, stripePost } from "../_stripe";

export async function POST(request: Request) {
  try {
    if (!billingConfigured()) return Response.json({ error: "Billing is not configured yet." }, { status: 503 });
    const { organization_id: organizationId, plan } = await request.json();
    const price = priceFor(plan);
    if (!price) return Response.json({ error: "Select Pro, Max, or Scale." }, { status: 400 });
    const account = await accountContext(request, organizationId);
    if (!account) return Response.json({ error: "Unauthorized." }, { status: 401 });
    if (!["owner", "admin"].includes(account.role)) return Response.json({ error: "Administrator access required." }, { status: 403 });
    const origin = new URL(request.url).origin;
    const values: Record<string, string> = {
      mode: "subscription",
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      success_url: `${origin}/console?billing=success`,
      cancel_url: `${origin}/console?plan=${encodeURIComponent(plan)}`,
      client_reference_id: organizationId,
      "metadata[organization_id]": organizationId,
      "metadata[plan]": plan,
      "subscription_data[metadata][organization_id]": organizationId,
      "subscription_data[metadata][plan]": plan,
      allow_promotion_codes: "true",
    };
    if (account.organization.stripe_customer_id) values.customer = account.organization.stripe_customer_id;
    else values.customer_email = account.email;
    const session = await stripePost("checkout/sessions", values);
    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Checkout failed." }, { status: 400 });
  }
}
