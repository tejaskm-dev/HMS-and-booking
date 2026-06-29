import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout, emailDetails, BRAND } from "@/lib/email";

const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

// Tells the guest their refund has been issued. Idempotent via
// refund_email_sent_at (Razorpay fires refund.created AND refund.processed).
// Best-effort — never throws into the webhook.
export async function sendRefundProcessed(bookingId: string): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: booking } = await admin
      .from("bookings")
      .update({ refund_email_sent_at: new Date().toISOString() })
      .eq("id", bookingId)
      .is("refund_email_sent_at", null)
      .select(
        "id, guest_id, guest_name, guest_email, refund_amount, hotels(name)",
      )
      .maybeSingle();

    if (!booking) return;

    const refund = Number(booking.refund_amount ?? 0);
    const hotel = booking.hotels as { name?: string } | null;

    let toEmail = booking.guest_email as string | null;
    let toName = booking.guest_name as string | null;
    if (!toEmail && booking.guest_id) {
      const { data } = await admin.auth.admin.getUserById(
        booking.guest_id as string,
      );
      toEmail = data.user?.email ?? null;
      toName = toName ?? (data.user?.user_metadata?.full_name as string) ?? null;
    }
    if (!toEmail) {
      await admin
        .from("bookings")
        .update({ refund_email_sent_at: null })
        .eq("id", bookingId);
      return;
    }

    const ok = await sendEmail({
      to: toEmail,
      toName: toName ?? undefined,
      subject: `Refund processed — ${hotel?.name ?? "BookNest"}`,
      html: emailLayout({
        eyebrow: "Refund Processed",
        heading: "Your refund is on its way",
        footnote: "You're receiving this about a BookNest refund.",
        bodyHtml: `
          <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:${BRAND.text};text-align:center;">
            Dear ${toName ?? "Guest"}, we've processed your refund. It should reflect in your account within 5–7 business days, depending on your bank.
          </p>
          ${emailDetails([
            { label: "Hotel", value: hotel?.name ?? "—" },
            {
              label: "Refund amount",
              value: `<span style="color:${BRAND.green};font-weight:bold;">${inr(refund)}</span>`,
            },
            { label: "Reference", value: String(booking.id) },
          ])}`,
      }),
    });

    if (!ok) {
      await admin
        .from("bookings")
        .update({ refund_email_sent_at: null })
        .eq("id", bookingId);
    }
  } catch (err) {
    console.error("[email] sendRefundProcessed error", err);
  }
}
