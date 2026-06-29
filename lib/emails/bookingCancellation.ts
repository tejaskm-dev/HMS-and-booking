import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout, emailDetails, emailButton, BRAND } from "@/lib/email";

const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://booknest.app";

// Notifies the guest (and the host) that a booking was cancelled. Idempotent
// via cancellation_email_sent_at. Best-effort — never throws into the route.
export async function sendBookingCancellation(bookingId: string): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: booking } = await admin
      .from("bookings")
      .update({ cancellation_email_sent_at: new Date().toISOString() })
      .eq("id", bookingId)
      .eq("status", "cancelled")
      .is("cancellation_email_sent_at", null)
      .select(
        "id, guest_id, guest_name, guest_email, check_in, check_out, refund_amount, cancellation_reason, hotels(name, location, manager_id), rooms(name)",
      )
      .maybeSingle();

    if (!booking) return;

    const hotel = booking.hotels as
      | { name?: string; location?: string; manager_id?: string }
      | null;
    const room = booking.rooms as { name?: string } | null;
    const refund = Number(booking.refund_amount ?? 0);

    const details = emailDetails([
      { label: "Hotel", value: hotel?.name ?? "—" },
      { label: "Room", value: room?.name ?? "—" },
      { label: "Check-in", value: fmtDate(booking.check_in as string) },
      { label: "Check-out", value: fmtDate(booking.check_out as string) },
      {
        label: "Refund",
        value:
          refund > 0
            ? `<span style="color:${BRAND.green};font-weight:bold;">${inr(refund)}</span>`
            : "No refund due",
      },
    ]);

    const reasonBlock = booking.cancellation_reason
      ? `<p style="margin:18px 0 0;font-size:13px;color:${BRAND.muted};text-align:center;">Reason: ${booking.cancellation_reason}</p>`
      : "";

    // --- Guest ---
    let guestEmail = booking.guest_email as string | null;
    let guestName = booking.guest_name as string | null;
    if (!guestEmail && booking.guest_id) {
      const { data } = await admin.auth.admin.getUserById(
        booking.guest_id as string,
      );
      guestEmail = data.user?.email ?? null;
      guestName =
        guestName ?? (data.user?.user_metadata?.full_name as string) ?? null;
    }

    if (guestEmail) {
      const ok = await sendEmail({
        to: guestEmail,
        toName: guestName ?? undefined,
        subject: `Booking cancelled — ${hotel?.name ?? "BookNest"}`,
        html: emailLayout({
          eyebrow: "Booking Cancelled",
          heading: "Your booking has been cancelled",
          footnote: "You're receiving this about a BookNest reservation.",
          bodyHtml: `
            <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:${BRAND.text};text-align:center;">
              Dear ${guestName ?? "Guest"}, your reservation has been cancelled.${refund > 0 ? " Your refund details are below." : ""}
            </p>
            ${details}
            ${reasonBlock}
            ${emailButton(`${siteUrl}/bookings`, "View my trips")}`,
        }),
      });
      if (!ok) {
        // Allow retry if the guest send failed.
        await admin
          .from("bookings")
          .update({ cancellation_email_sent_at: null })
          .eq("id", bookingId);
        return;
      }
    }

    // --- Host (best-effort, no retry gating) ---
    if (hotel?.manager_id) {
      const { data } = await admin.auth.admin.getUserById(hotel.manager_id);
      const hostEmail = data.user?.email;
      if (hostEmail) {
        await sendEmail({
          to: hostEmail,
          subject: `A booking was cancelled — ${hotel?.name ?? "BookNest"}`,
          html: emailLayout({
            eyebrow: "Booking Cancelled",
            heading: "A reservation was cancelled",
            footnote: "You're receiving this as the host of this property.",
            bodyHtml: `
              <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:${BRAND.text};text-align:center;">
                A booking for <strong>${hotel?.name ?? "your property"}</strong> has been cancelled. The dates are now open for new bookings.
              </p>
              ${details}
              ${reasonBlock}`,
          }),
        });
      }
    }
  } catch (err) {
    console.error("[email] sendBookingCancellation error", err);
  }
}
