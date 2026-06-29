import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout, emailButton, BRAND } from "@/lib/email";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://booknest.app";

// Emails a staff invitee. They accept by signing up / logging in with this same
// email — the staff_invites row is matched to their account. Best-effort.
export async function sendStaffInvite(opts: {
  email: string;
  hotelIds: string[];
  inviterId: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: hotels } = await admin
      .from("hotels")
      .select("name")
      .in("id", opts.hotelIds);
    const hotelNames = (hotels ?? [])
      .map((h) => (h as { name: string }).name)
      .filter(Boolean);

    const { data: inviter } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", opts.inviterId)
      .maybeSingle();
    const inviterName = (inviter?.full_name as string) ?? "A BookNest manager";

    const hotelList =
      hotelNames.length > 0
        ? `<ul style="margin:8px 0 16px;padding-left:20px;font-size:14px;color:${BRAND.text};">${hotelNames
            .map((n) => `<li style="margin:4px 0;">${n}</li>`)
            .join("")}</ul>`
        : "";

    // New users sign up; existing ones log in. /signup handles both intents,
    // and the invite is keyed to the email so either path accepts it.
    const acceptUrl = `${siteUrl}/login?email=${encodeURIComponent(opts.email)}`;

    const html = emailLayout({
      eyebrow: "Staff Invitation",
      heading: "You've been invited",
      footnote: "You're receiving this because a BookNest manager invited you as staff.",
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};">
          <strong>${inviterName}</strong> has invited you to help manage
          ${hotelNames.length > 1 ? "these properties" : "their property"} on BookNest:
        </p>
        ${hotelList}
        <p style="margin:0 0 4px;font-size:14px;color:${BRAND.text};">
          To accept, sign in or create an account using <strong>${opts.email}</strong> — your access is linked to this email.
        </p>
        ${emailButton(acceptUrl, "Accept invitation")}`,
    });

    await sendEmail({
      to: opts.email,
      subject: `${inviterName} invited you to manage ${hotelNames[0] ?? "a property"} on BookNest`,
      html,
    });
  } catch (err) {
    console.error("[email] sendStaffInvite error", err);
  }
}
