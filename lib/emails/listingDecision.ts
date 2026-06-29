import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout, emailButton, BRAND } from "@/lib/email";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://booknest.app";

// Emails the host when their property listing is approved or rejected by an
// admin. Best-effort — never throws into the admin action.
export async function sendListingDecision(
  hotelId: string,
  decision: "approved" | "rejected",
  reason?: string | null,
): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: hotel } = await admin
      .from("hotels")
      .select("name, manager_id")
      .eq("id", hotelId)
      .maybeSingle();
    if (!hotel?.manager_id) return;

    const { data: userRes } = await admin.auth.admin.getUserById(
      hotel.manager_id as string,
    );
    const toEmail = userRes.user?.email;
    if (!toEmail) return;

    const name =
      (userRes.user?.user_metadata?.full_name as string) ?? "there";
    const hotelName = (hotel.name as string) ?? "your property";

    let eyebrow: string;
    let heading: string;
    let subject: string;
    let bodyHtml: string;

    if (decision === "approved") {
      eyebrow = "Listing Approved";
      heading = "Your property is live";
      subject = `${hotelName} is now live on BookNest`;
      bodyHtml = `
        <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:${BRAND.text};text-align:center;">
          Congratulations ${name}, <strong>${hotelName}</strong> has been approved and is now visible to guests on BookNest. You can start receiving bookings right away.
        </p>
        ${emailButton(`${siteUrl}/manager/hotels`, "View my properties")}`;
    } else {
      const reasonBlock = reason
        ? `<div style="margin:18px 0;padding:14px 18px;background:${BRAND.cream};border-left:3px solid ${BRAND.gold};border-radius:4px;font-size:14px;color:${BRAND.text};text-align:left;">
             <strong>Reviewer note:</strong><br>${reason}
           </div>`
        : "";
      eyebrow = "Listing Update";
      heading = "About your property listing";
      subject = `Update on your listing — ${hotelName}`;
      bodyHtml = `
        <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:${BRAND.text};text-align:center;">
          Hi ${name}, we weren't able to approve <strong>${hotelName}</strong> at this time.
        </p>
        ${reasonBlock}
        <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:${BRAND.text};text-align:center;">
          You can update the listing and resubmit it for review.
        </p>
        ${emailButton(`${siteUrl}/manager/hotels`, "Edit my listing")}`;
    }

    await sendEmail({
      to: toEmail,
      toName: name === "there" ? undefined : name,
      subject,
      html: emailLayout({
        eyebrow,
        heading,
        bodyHtml,
        footnote: "You're receiving this about your BookNest property listing.",
      }),
    });
  } catch (err) {
    console.error("[email] sendListingDecision error", err);
  }
}
