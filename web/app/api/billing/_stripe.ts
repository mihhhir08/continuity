type AccountContext = {
  email: string;
  role: string;
  organization: {
    id: string;
    stripe_customer_id: string | null;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function billingConfigured() {
  return Boolean(supabaseUrl && supabaseKey && process.env.STRIPE_SECRET_KEY);
}

export async function accountContext(request: Request, organizationId: string): Promise<AccountContext | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token || !supabaseUrl || !supabaseKey || !organizationId) return null;
  const authHeaders = { apikey: supabaseKey, authorization: `Bearer ${token}` };
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: authHeaders });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();
  const membership = await fetch(
    `${supabaseUrl}/rest/v1/organization_members?organization_id=eq.${encodeURIComponent(organizationId)}&user_id=eq.${encodeURIComponent(user.id)}&select=role`,
    { headers: authHeaders },
  );
  if (!membership.ok) return null;
  const [membershipRow] = await membership.json();
  if (!membershipRow) return null;
  const organization = await fetch(
    `${supabaseUrl}/rest/v1/organizations?id=eq.${encodeURIComponent(organizationId)}&select=id,stripe_customer_id`,
    { headers: authHeaders },
  );
  if (!organization.ok) return null;
  const [row] = await organization.json();
  return row ? { email: user.email, role: membershipRow.role, organization: row } : null;
}

export async function stripePost(path: string, values: Record<string, string>) {
  const body = new URLSearchParams(values);
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "Stripe rejected the request.");
  return payload;
}

export function priceFor(plan: string) {
  const prices: Record<string, string | undefined> = {
    pro: process.env.STRIPE_PRICE_PRO,
    max: process.env.STRIPE_PRICE_MAX,
    scale: process.env.STRIPE_PRICE_SCALE,
  };
  return prices[plan];
}

function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function equal(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function verifyStripeSignature(payload: string, header: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = header.split(",").map((item) => item.split("=", 2));
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300 || !signatures.length) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = hex(signature);
  return signatures.some((candidate) => equal(expected, candidate));
}

export async function recordBillingEvent(event: { id: string; type: string }) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase billing service is not configured.");
  const response = await fetch(`${supabaseUrl}/rest/v1/billing_events`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      prefer: "resolution=ignore-duplicates,return=representation",
    },
    body: JSON.stringify({ event_id: event.id, event_type: event.type }),
  });
  if (!response.ok) throw new Error("Unable to record billing event.");
  return (await response.json()).length > 0;
}

export async function updateSubscription(organizationId: string, values: Record<string, unknown>) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase billing service is not configured.");
  const response = await fetch(`${supabaseUrl}/rest/v1/organizations?id=eq.${encodeURIComponent(organizationId)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify(values),
  });
  if (!response.ok) throw new Error("Unable to update subscription.");
}
