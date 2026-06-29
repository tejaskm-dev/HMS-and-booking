import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout, emailButton, BRAND } from "@/lib/email";

type Decision = "approved" | "rejected" | "more_info";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://booknest.app";

// Emails a manager the outcome of their verification review. Best-effort —
// never throws into the admin action. `verificationId` is the
// manager_verifications row id passed to admin_review_manager.
export async function sendManagerDecision(
  verificationId: string,
  decision: Decision,
  note?: string | null,
): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: mv } = await admin
      .from("manager_verifications")
      .select("user_id, business_name")
      .eq("id", verificationId)
      .maybeSingle();
    if (!mv?.user_id) return;

    const { data: userRes } = await admin.auth.admin.getUserById(
      mv.user_id as string,
    );
    const toEmail = userRes.user?.email;
    if (!toEmail) return;

    const name =
      (userRes.user?.user_metadata?.full_name as string) ??
      (mv.business_name as string) ??
      "there";
    const business = (mv.business_name as string) ?? "your business";

    const noteBlock = note
      ? `<div style="margin:16px 0;padding:14px 16px;background:${BRAND.cream};border-left:3px solid ${BRAND.gold};border-radius:6px;font-size:14px;color:${BRAND.text};">
           <strong>Reviewer note:</strong><br>${note}
         </div>`
      : "";

    let eyebrow: string;
    let heading: string;
    let subject: string;
    let bodyHtml: string;

    if (decision === "approved") {
      eyebrow = "Application Approved";
      heading = "Welcome aboard";
      subject = "Your BookNest manager account is approved";
      bodyHtml = `
        <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};">Hi ${name},</p>
        <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};">
          Great news — <strong>${business}</strong> has been verified. You can now list properties and manage bookings on BookNest.
        </p>
        ${emailButton(`${siteUrl}/manager/dashboard`, "Go to your dashboard")}`;
    } else if (decision === "rejected") {
      eyebrow = "Application Update";
      heading = "About your verification";
      subject = "Your BookNest verification was not approved";
      bodyHtml = `
        <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};">Hi ${name},</p>
        <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};">
          We weren't able to verify <strong>${business}</strong> at this time.
        </p>
        ${noteBlock}
        <p style="margin:8px 0 0;font-size:14px;color:${BRAND.text};">
          You can update your details and resubmit for review.
        </p>
        ${emailButton(`${siteUrl}/manager/waiting`, "Review & resubmit")}`;
    } else {
      eyebrow = "Action Required";
      heading = "A little more information";
      subject = "Action needed on your BookNest verification";
      bodyHtml = `
        <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};">Hi ${name},</p>
        <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};">
          We're reviewing <strong>${business}</strong> and need a little more from you to continue.
        </p>
        ${noteBlock}
        ${emailButton(`${siteUrl}/manager/waiting`, "Provide details")}`;
    }

    await sendEmail({
      to: toEmail,
      toName: name === "there" ? undefined : name,
      subject,
      html: emailLayout({ eyebrow, heading, bodyHtml, footnote: "You're receiving this about your BookNest manager application." }),
    });
  } catch (err) {
    console.error("[email] sendManagerDecision error", err);
  }
}
