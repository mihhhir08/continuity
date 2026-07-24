import { accountContext, billingConfigured, stripePost } from "../_stripe";

export async function POST(request: Request) {
  try {
    if (!billingConfigured()) return Response.json({ error: "Billing is not configured yet." }, { status: 503 });
    const { organization_id: organizationId } = await request.json();
    const account = await accountContext(request, organizationId);
    if (!account) return Response.json({ error: "Unauthorized." }, { status: 401 });
    if (!["owner", "admin"].includes(account.role)) return Response.json({ error: "Administrator access required." }, { status: 403 });
    if (!account.organization.stripe_customer_id) return Response.json({ error: "No billing account exists." }, { status: 409 });
    const session = await stripePost("billing_portal/sessions", {
      customer: account.organization.stripe_customer_id,
      return_url: `${new URL(request.url).origin}/console`,
    });
    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Billing portal failed." }, { status: 400 });
  }
}
