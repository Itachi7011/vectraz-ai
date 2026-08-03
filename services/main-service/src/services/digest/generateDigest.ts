import { prisma } from "@vectrazai/db";
import { sendDigestEmail } from "../../utils/digestEmailService";

export async function runWeeklyDigest(): Promise<{ sent: number; skipped: number }> {
  console.log("📨 Generating weekly digest...");

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const topArticles = await prisma.newsArticle.findMany({
    where: { status: "APPROVED", publishedAt: { gte: since } },
    orderBy: { views: "desc" },
    take: 8,
    include: { categories: { select: { name: true } } },
  });

  if (topArticles.length === 0) {
    console.log("📨 No articles in the last 7 days — skipping digest run.");
    return { sent: 0, skipped: 0 };
  }

  const users = await prisma.user.findMany({
    where: { isEmailVerified: true, isBlocked: false, emailDigestEnabled: true },
    select: { id: true, email: true, name: true },
  });

  let sent = 0;
  for (const user of users) {
    const html = buildDigestHtml(user.name, topArticles);
    const text = buildDigestText(user.name, topArticles);
    await sendDigestEmail(user.email, "Your VectrazAI weekly AI & chips digest", html, text);
    sent++;
  }

  console.log(`📨 Digest sent to ${sent} user(s).`);
  return { sent, skipped: 0 };
}

function buildDigestText(name: string, articles: { title: string; url: string; sourceName: string }[]): string {
  const lines = articles.map((a, i) => `${i + 1}. ${a.title} (${a.sourceName}) — ${a.url}`);
  return `Hi ${name},\n\nHere's what's been trending on VectrazAI this week:\n\n${lines.join("\n")}\n\nUnsubscribe anytime from your profile settings.`;
}

function buildDigestHtml(
  name: string,
  articles: { title: string; url: string; sourceName: string; imageUrl: string | null; categories: { name: string }[] }[]
): string {
  const items = articles
    .map(
      (a) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e4e8f1;">
          <div style="font-size:11px;font-weight:700;color:#2456ff;text-transform:uppercase;">${a.categories[0]?.name ?? "AI News"}</div>
          <a href="${a.url}" style="font-size:15px;font-weight:700;color:#10172a;text-decoration:none;">${a.title}</a>
          <div style="font-size:12px;color:#8992a8;margin-top:4px;">${a.sourceName}</div>
        </td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="color:#2456ff;">VectrazAI Weekly Digest</h2>
      <p>Hi ${name}, here's what's been trending in AI, chips, and GPUs this week:</p>
      <table style="width:100%;border-collapse:collapse;">${items}</table>
      <p style="font-size:12px;color:#8992a8;margin-top:24px;">
        You're receiving this because email digests are enabled on your VectrazAI account.
        Turn them off anytime from your profile settings.
      </p>
    </div>
  `;
}
