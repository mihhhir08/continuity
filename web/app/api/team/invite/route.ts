import { createClient } from "@supabase/supabase-js";
import { accountContext } from "../../billing/_stripe";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ error: "Team invitations are not configured." }, { status: 503 });
  try {
    const { organization_id: organizationId, email, role = "member" } = await request.json();
    const account = await accountContext(request, organizationId);
    if (!account || !["owner", "admin"].includes(account.role)) return Response.json({ error: "Administrator access required." }, { status: 403 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !["admin", "member", "viewer"].includes(role)) {
      return Response.json({ error: "Valid email and role required." }, { status: 400 });
    }
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${new URL(request.url).origin}/console` });
    if (error || !data.user) return Response.json({ error: error?.message || "Invitation failed." }, { status: 400 });
    const { error: membershipError } = await admin.from("organization_members").upsert({
      organization_id: organizationId,
      user_id: data.user.id,
      role,
    });
    if (membershipError) return Response.json({ error: membershipError.message }, { status: 400 });
    return Response.json({ invited: true });
  } catch {
    return Response.json({ error: "Invitation failed." }, { status: 400 });
  }
}
