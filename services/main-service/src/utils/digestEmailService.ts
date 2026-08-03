import sgMail from "@sendgrid/mail";
import { env, isSendGridConfigured } from "../config/env";

if (isSendGridConfigured) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

export async function sendDigestEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!isSendGridConfigured) {
    console.log("\n📧 [DEV DIGEST FALLBACK — SendGrid not configured] ────────────────");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text}`);
    console.log("─────────────────────────────────────────────────────────────────\n");
    return;
  }

  try {
    await sgMail.send({ to, from: env.SENDGRID_FROM_EMAIL, subject, html, text });
  } catch (err) {
    console.error("⚠️  Digest send failed, falling back to console log:", err);
    console.log(`📧 [FALLBACK] To: ${to} | Subject: ${subject}\n${text}`);
  }
}
