import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vectrazai-dummy-url.example.com";
const MAIN_SERVICE_URL = process.env.MAIN_SERVICE_URL ?? "http://localhost:5002";

const STATIC_ROUTES = ["", "/trending", "/search", "/login", "/signup", "/subscription", "/about", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.6,
  }));

  // Best-effort: pull recent articles directly from main-service to include
  // in the sitemap. If the service is unreachable at build time, we still
  // ship a valid sitemap with just the static routes — never fails the build.
  try {
    const res = await fetch(`${MAIN_SERVICE_URL}/api/news?limit=50&sort=latest`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const articleEntries: MetadataRoute.Sitemap = (data.articles ?? []).map((a: { slug: string; publishedAt: string }) => ({
        url: `${SITE_URL}/news/${a.slug}`,
        lastModified: new Date(a.publishedAt),
        changeFrequency: "never" as const,
        priority: 0.7,
      }));
      return [...staticEntries, ...articleEntries];
    }
  } catch {
    // Fall through to static-only sitemap.
  }

  return staticEntries;
}
