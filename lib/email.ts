// Transactional email via Brevo's HTTP API. HTTP (not SMTP) so it works
// reliably on serverless. Server-only: never import this into client code,
// it reads BREVO_API_KEY. All sends are best-effort and never throw — a failed
// email must never break the action that triggered it.

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export interface SendEmailInput {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME ?? "BookNest";

  if (!apiKey || !from) {
    console.error("[email] BREVO_API_KEY or EMAIL_FROM missing — skipping send");
    return false;
  }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: from, name: fromName },
        to: [{ email: input.to, name: input.toName }],
        subject: input.subject,
        htmlContent: input.html,
        ...(input.replyTo ? { replyTo: { email: input.replyTo } } : {}),
      }),
    });

    if (!res.ok) {
      console.error("[email] Brevo send failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send error", err);
    return false;
  }
}

// BookNest palette (mirrors app/globals.css tokens).
export const BRAND = {
  green: "#0F5A46", // brand-600
  greenDark: "#0A4335", // brand-700
  gold: "#C9A24D", // gold-500
  cream: "#F8F7F4", // background
  text: "#1F2937", // foreground
  muted: "#6B7280",
  line: "#E7E2D9", // warm border
};

// Serif display stack for headings/wordmark — gives the boutique-hotel feel.
const SERIF = "Georgia,'Times New Roman',Times,serif";
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";

// A short centered gold hairline — the recurring luxury divider motif.
function goldRule(width = 44): string {
  return `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:18px auto;"><tr><td style="width:${width}px;height:1px;line-height:1px;font-size:0;background:${BRAND.gold};">&nbsp;</td></tr></table>`;
}

// Shared branded wrapper. Inline styles only (email clients strip <style>/CSS).
// Luxury treatment: serif display type, centered wordmark with gold tagline,
// uppercase eyebrow, gold hairline rules, generous whitespace — on warm cream.
export function emailLayout(opts: {
  heading: string;
  bodyHtml: string;
  eyebrow?: string;
  footnote?: string;
}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <style>
      :root { color-scheme: light only; supported-color-schemes: light only; }
      body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; }
      a { text-decoration:none; }
      @media only screen and (max-width:600px) {
        .bn-card { width:100% !important; border-radius:0 !important; }
        .bn-pad { padding:32px 26px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.cream};font-family:${SANS};color:${BRAND.text};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:36px 0;">
      <tr><td align="center" style="padding:0 12px;">
        <table role="presentation" class="bn-card" width="580" cellpadding="0" cellspacing="0" style="width:580px;max-width:580px;background:#ffffff;border:1px solid ${BRAND.line};border-radius:6px;overflow:hidden;">
          <!-- header -->
          <tr><td align="center" style="background:${BRAND.greenDark};padding:34px 30px 28px;">
            <div style="font-family:${SERIF};color:#ffffff;font-size:27px;font-weight:bold;letter-spacing:0.5px;">BookNest</div>
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:13px auto;"><tr><td style="width:40px;height:1px;line-height:1px;font-size:0;background:${BRAND.gold};">&nbsp;</td></tr></table>
            <div style="color:${BRAND.gold};font-size:10px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;">Stays that feel like home</div>
          </td></tr>
          <!-- hero -->
          <tr><td align="center" class="bn-pad" style="padding:40px 44px 8px;">
            ${opts.eyebrow ? `<div style="font-size:11px;font-weight:bold;letter-spacing:2.5px;text-transform:uppercase;color:${BRAND.gold};">${opts.eyebrow}</div>` : ""}
            <h1 style="margin:${opts.eyebrow ? "12px" : "0"} 0 0;font-family:${SERIF};font-size:26px;font-weight:normal;line-height:1.25;color:${BRAND.greenDark};">${opts.heading}</h1>
            ${goldRule()}
          </td></tr>
          <!-- body -->
          <tr><td class="bn-pad" style="padding:4px 44px 40px;">
            ${opts.bodyHtml}
          </td></tr>
          <!-- footer -->
          <tr><td align="center" style="padding:22px 30px 26px;background:${BRAND.cream};border-top:1px solid ${BRAND.line};">
            <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">${opts.footnote ?? "You're receiving this email from BookNest."}</p>
          </td></tr>
        </table>
        <p style="margin:16px 0 0;font-family:${SERIF};font-size:11px;letter-spacing:1px;color:#A8A29E;">BOOKNEST &nbsp;·&nbsp; STAYS THAT FEEL LIKE HOME</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

// Refined CTA — sharp-edged, uppercase, letter-spaced (boutique, not chunky).
export function emailButton(href: string, label: string): string {
  return `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:26px auto;"><tr>
    <td style="border-radius:3px;background:${BRAND.green};">
      <a href="${href}" style="display:inline-block;padding:15px 40px;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#ffffff;border-radius:3px;">${label}</a>
    </td></tr></table>`;
}

// Label/value detail table — uppercase gold-tinged labels, hairline rows.
export function emailDetails(rows: { label: string; value: string }[]): string {
  const body = rows
    .map(
      (r, i) =>
        `<tr><td style="padding:14px 20px;${i < rows.length - 1 ? `border-bottom:1px solid ${BRAND.line};` : ""}font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.muted};vertical-align:middle;">${r.label}</td>
         <td style="padding:14px 20px;${i < rows.length - 1 ? `border-bottom:1px solid ${BRAND.line};` : ""}font-size:14px;color:${BRAND.text};text-align:right;vertical-align:middle;">${r.value}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.line};border-radius:4px;overflow:hidden;background:#FFFDF9;">${body}</table>`;
}
