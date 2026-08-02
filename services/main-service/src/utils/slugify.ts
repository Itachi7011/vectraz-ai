import crypto from "crypto";

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  // Append a short hash so near-identical titles from different sources
  // don't collide on the unique slug constraint.
  const hash = crypto.createHash("md5").update(title).digest("hex").slice(0, 6);
  return `${base}-${hash}`;
}

export function externalIdFor(sourceType: string, sourceUrl: string): string {
  return crypto.createHash("sha256").update(`${sourceType}:${sourceUrl}`).digest("hex");
}
