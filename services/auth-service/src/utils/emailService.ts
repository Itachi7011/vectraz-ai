import sgMail from "@sendgrid/mail";
import { env, isSendGridConfigured } from "../config/env";

if (isSendGridConfigured) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Sends an email via SendGrid when configured. When SENDGRID_API_KEY is
 * empty (e.g. subscription lapsed / not purchased yet), this silently
 * falls back to logging the email content to the console instead of
 * throwing — so signup/login/password-reset flows keep working end to
 * end in development without ever surfacing an error to the user.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailArgs): Promise<void> {
  if (!isSendGridConfigured) {
    console.log("\n📧 [DEV EMAIL FALLBACK — SendGrid not configured] ─────────────────");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text ?? stripHtml(html)}`);
    console.log("─────────────────────────────────────────────────────────────────\n");
    return;
  }

  try {
    await sgMail.send({
      to,
      from: env.SENDGRID_FROM_EMAIL,
      subject,
      html,
      text: text ?? stripHtml(html),
    });
  } catch (err) {
    // Never let an email-provider outage break the auth flow — log it
    // and fall back to console output so the user (in dev) or support
    // (in prod, via logs) can still see the OTP/link.
    console.error("⚠️  SendGrid send failed, falling back to console log:", err);
    console.log(`📧 [FALLBACK] To: ${to} | Subject: ${subject}\n${text ?? stripHtml(html)}`);
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function otpEmailTemplate(code: string, purpose: "verify your email" | "reset your password"): {
  subject: string;
  html: string;
  text: string;
} {
  const subject =
    purpose === "verify your email" ? "VectrazAI — Verify your email" : "VectrazAI — Reset your password";
  const text = `Your VectrazAI verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#2456ff;">VectrazAI</h2>
      <p>Use the code below to ${purpose}:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:8px;">${code}</p>
      <p style="color:#666;font-size:14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  return { subject, html, text };
}
