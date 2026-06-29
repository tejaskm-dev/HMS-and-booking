import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout, emailDetails, BRAND } from "@/lib/email";

const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Sends the "booking confirmed" email exactly once. Idempotent across the
// webhook and the reconcile safety net: it atomically claims the send by
// stamping confirmation_email_sent_at, and only the caller that wins the claim
// actually sends. Best-effort — never throws into the payment flow.
export async function sendBookingConfirmation(bookingId: string): Promise<void> {
  try {
    const admin = createAdminClient();

    // Atomic claim: only confirmed bookings that haven't been emailed yet.
    const { data: booking } = await admin
      .from("bookings")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", bookingId)
      .eq("status", "confirmed")
      .is("confirmation_email_sent_at", null)
      .select(
        "id, guest_id, guest_name, guest_email, check_in, check_out, nights, num_rooms, total_price, hotels(name, location), rooms(name)",
      )
      .maybeSingle();

    if (!booking) return; // already sent, or not confirmed yet

    // Resolve recipient: walk-in bookings snapshot guest_email; self-bookings
    // don't, so fall back to the account email behind guest_id.
    let toEmail = booking.guest_email as string | null;
    let toName = booking.guest_name as string | null;
    if (!toEmail && booking.guest_id) {
      const { data } = await admin.auth.admin.getUserById(
        booking.guest_id as string,
      );
      toEmail = data.user?.email ?? null;
      toName =
        toName ??
        (data.user?.user_metadata?.full_name as string) ??
        null;
    }
    if (!toEmail) {
      console.error("[email] no recipient for booking", bookingId);
      // Allow a future retry rather than silently swallowing the booking.
      await admin
        .from("bookings")
        .update({ confirmation_email_sent_at: null })
        .eq("id", bookingId);
      return;
    }

    const hotel = booking.hotels as { name?: string; location?: string } | null;
    const room = booking.rooms as { name?: string } | null;

    const html = emailLayout({
      eyebrow: "Reservation Confirmed",
      heading: "Your stay is booked",
      footnote: "You're receiving this because you booked a stay with BookNest.",
      bodyHtml: `
        <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:${BRAND.text};text-align:center;">
          Dear ${toName ?? "Guest"}, we're delighted to welcome you. Your reservation is confirmed — here are the details of your upcoming stay.
        </p>
        ${emailDetails([
          {
            label: "Hotel",
            value: `${hotel?.name ?? "—"}${hotel?.location ? `<br><span style="color:${BRAND.muted};font-size:12px;">${hotel.location}</span>` : ""}`,
          },
          {
            label: "Room",
            value: `${room?.name ?? "—"}${booking.num_rooms > 1 ? ` × ${booking.num_rooms}` : ""}`,
          },
          { label: "Check-in", value: fmtDate(booking.check_in as string) },
          { label: "Check-out", value: fmtDate(booking.check_out as string) },
          { label: "Nights", value: String(booking.nights) },
          {
            label: "Total paid",
            value: `<span style="font-weight:bold;color:${BRAND.green};">${inr(booking.total_price as number)}</span>`,
          },
        ])}
        <p style="margin:20px 0 0;font-size:13px;color:${BRAND.muted};">
          Booking reference: ${booking.id}
        </p>`,
    });

    const ok = await sendEmail({
      to: toEmail,
      toName: toName ?? undefined,
      subject: `Booking confirmed — ${hotel?.name ?? "BookNest"}`,
      html,
    });

    if (!ok) {
      // Send failed: clear the stamp so a later trigger can retry.
      await admin
        .from("bookings")
        .update({ confirmation_email_sent_at: null })
        .eq("id", bookingId);
    }
  } catch (err) {
    console.error("[email] sendBookingConfirmation error", err);
  }
}
