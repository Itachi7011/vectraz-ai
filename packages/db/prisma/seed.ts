/**
 * VectrazAI seed script (Phase 2).
 * Run with: npm run db:seed
 *
 * Populates enough realistic-shaped data that Phase 5/6 UI work
 * (trending, category filters, admin dashboards, notifications) has
 * something real to render against instead of empty tables.
 */
import bcrypt from "bcryptjs";
import { prisma } from "../src/index";

const CATEGORIES = [
  { slug: "artificial-intelligence", name: "Artificial Intelligence", description: "General AI news and breakthroughs." },
  { slug: "machine-learning", name: "Machine Learning", description: "ML research, models, and techniques." },
  { slug: "gpus", name: "GPUs", description: "Graphics processing units and accelerators." },
  { slug: "semiconductors-chips", name: "Semiconductors & Chips", description: "Chip design, fabrication, and the silicon supply chain." },
  { slug: "robotics", name: "Robotics", description: "Robotics and embodied AI." },
  { slug: "ai-policy-regulation", name: "AI Policy & Regulation", description: "Governments, export controls, and AI governance." },
  { slug: "startups-funding", name: "Startups & Funding", description: "AI/chip startup funding rounds and acquisitions." },
  { slug: "research-papers", name: "Research & Papers", description: "Academic papers and preprints." },
  { slug: "big-tech", name: "Big Tech", description: "AI moves from large technology companies." },
  { slug: "data-centers-cloud", name: "Data Centers & Cloud", description: "AI infrastructure, data centers, and cloud compute." },
] as const;

type SeedArticle = {
  slug: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  sourceName: string;
  sourceType:
    | "NEWSAPI"
    | "GNEWS"
    | "NEWSDATA"
    | "MEDIASTACK"
    | "GUARDIAN"
    | "HACKERNEWS"
    | "ARXIV"
    | "REDDIT"
    | "RSS";
  categories: string[];
  matchedKeywords: string[];
  publishedAt: Date;
  views: number;
  clicks: number;
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const ARTICLES: SeedArticle[] = [
  {
    slug: "next-gen-gpu-architecture-details-emerge",
    title: "Details Emerge on Next-Generation GPU Architecture for AI Training",
    summary:
      "Leaked specifications point to a substantial jump in memory bandwidth and tensor throughput aimed squarely at large-scale model training workloads.",
    url: "https://example-tech-news.dev/next-gen-gpu-architecture",
    imageUrl: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=1200",
    sourceName: "TechCrunch",
    sourceType: "RSS",
    categories: ["gpus", "semiconductors-chips", "big-tech"],
    matchedKeywords: ["gpu", "ai training", "tensor", "accelerator"],
    publishedAt: daysAgo(1),
    views: 4210,
    clicks: 980,
  },
  {
    slug: "foundry-announces-3nm-capacity-expansion",
    title: "Leading Foundry Announces 3nm Capacity Expansion Amid AI Chip Demand",
    summary:
      "The expansion is expected to ease persistent shortages of advanced-node wafers needed for AI accelerators and high-end mobile processors.",
    url: "https://example-tech-news.dev/foundry-3nm-expansion",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
    sourceName: "Reuters",
    sourceType: "NEWSAPI",
    categories: ["semiconductors-chips", "data-centers-cloud"],
    matchedKeywords: ["foundry", "3nm", "semiconductor", "wafer", "chip"],
    publishedAt: daysAgo(2),
    views: 3120,
    clicks: 640,
  },
  {
    slug: "new-open-weight-model-matches-frontier-benchmarks",
    title: "New Open-Weight Language Model Matches Frontier Benchmarks",
    summary:
      "Independent evaluators confirm the freshly released open-weight model performs competitively against closed frontier systems on reasoning tasks.",
    url: "https://example-tech-news.dev/open-weight-model-benchmarks",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
    sourceName: "Hacker News",
    sourceType: "HACKERNEWS",
    categories: ["artificial-intelligence", "machine-learning", "research-papers"],
    matchedKeywords: ["language model", "open weight", "benchmark", "llm"],
    publishedAt: daysAgo(1),
    views: 5870,
    clicks: 1420,
  },
  {
    slug: "export-controls-tightened-on-advanced-chips",
    title: "Regulators Tighten Export Controls on Advanced AI Chips",
    summary:
      "The updated rules expand licensing requirements for high-performance accelerators sold to a wider list of destinations, citing national security concerns.",
    url: "https://example-tech-news.dev/export-controls-advanced-chips",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200",
    sourceName: "The Guardian",
    sourceType: "GUARDIAN",
    categories: ["ai-policy-regulation", "semiconductors-chips"],
    matchedKeywords: ["export control", "chip", "regulation", "policy"],
    publishedAt: daysAgo(3),
    views: 2890,
    clicks: 510,
  },
  {
    slug: "robotics-startup-raises-series-b-humanoid",
    title: "Humanoid Robotics Startup Raises Series B to Scale Manufacturing",
    summary:
      "The funding will go toward scaling production lines and expanding the company's embodied-AI research team ahead of planned pilot deployments.",
    url: "https://example-tech-news.dev/humanoid-robotics-series-b",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200",
    sourceName: "GNews",
    sourceType: "GNEWS",
    categories: ["robotics", "startups-funding"],
    matchedKeywords: ["robotics", "humanoid", "funding", "series b"],
    publishedAt: daysAgo(4),
    views: 1650,
    clicks: 290,
  },
  {
    slug: "arxiv-preprint-mixture-of-experts-efficiency",
    title: "New Preprint Proposes More Efficient Mixture-of-Experts Routing",
    summary:
      "Researchers describe a routing scheme that reduces cross-device communication overhead in large mixture-of-experts models without hurting accuracy.",
    url: "https://arxiv.org/abs/0000.00000",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200",
    sourceName: "arXiv",
    sourceType: "ARXIV",
    categories: ["research-papers", "machine-learning"],
    matchedKeywords: ["mixture of experts", "routing", "training efficiency"],
    publishedAt: daysAgo(2),
    views: 980,
    clicks: 210,
  },
  {
    slug: "cloud-provider-unveils-custom-ai-accelerator",
    title: "Major Cloud Provider Unveils Custom In-House AI Accelerator",
    summary:
      "The chip is designed to cut inference costs for the provider's own AI services and reduce reliance on third-party GPU supply.",
    url: "https://example-tech-news.dev/cloud-custom-accelerator",
    imageUrl: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=1200",
    sourceName: "NewsData",
    sourceType: "NEWSDATA",
    categories: ["big-tech", "data-centers-cloud", "semiconductors-chips"],
    matchedKeywords: ["accelerator", "inference", "custom chip", "cloud"],
    publishedAt: daysAgo(5),
    views: 3340,
    clicks: 705,
  },
  {
    slug: "reddit-discussion-quantization-tradeoffs",
    title: "Community Deep-Dive: Quantization Trade-offs for Local Model Inference",
    summary:
      "A widely upvoted thread compares accuracy and latency trade-offs across common quantization formats for running models on consumer hardware.",
    url: "https://example-tech-news.dev/quantization-tradeoffs-thread",
    imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200",
    sourceName: "r/MachineLearning",
    sourceType: "REDDIT",
    categories: ["machine-learning", "gpus"],
    matchedKeywords: ["quantization", "inference", "local model", "gpu"],
    publishedAt: daysAgo(1),
    views: 2210,
    clicks: 480,
  },
  {
    slug: "chip-designer-unveils-edge-ai-soc",
    title: "Chip Designer Unveils New Edge-AI System-on-Chip",
    summary:
      "The new SoC targets battery-powered devices, pairing a low-power NPU with a traditional CPU cluster for on-device inference.",
    url: "https://example-tech-news.dev/edge-ai-soc-launch",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
    sourceName: "Mediastack Feed",
    sourceType: "MEDIASTACK",
    categories: ["semiconductors-chips", "gpus"],
    matchedKeywords: ["soc", "npu", "edge ai", "chip"],
    publishedAt: daysAgo(6),
    views: 1420,
    clicks: 260,
  },
  {
    slug: "ai-safety-institute-publishes-eval-framework",
    title: "AI Safety Institute Publishes New Model Evaluation Framework",
    summary:
      "The framework standardizes how frontier labs report risk-relevant capability evaluations ahead of major model releases.",
    url: "https://example-tech-news.dev/ai-safety-eval-framework",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200",
    sourceName: "Reuters",
    sourceType: "NEWSAPI",
    categories: ["ai-policy-regulation", "artificial-intelligence"],
    matchedKeywords: ["ai safety", "evaluation", "frontier model", "policy"],
    publishedAt: daysAgo(3),
    views: 1980,
    clicks: 340,
  },
  {
    slug: "startup-funding-roundup-chip-design-tools",
    title: "Funding Roundup: Three Chip-Design Tooling Startups Close New Rounds",
    summary:
      "Investors continue betting on software that speeds up semiconductor design cycles, from RTL generation to verification automation.",
    url: "https://example-tech-news.dev/chip-design-tooling-funding",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
    sourceName: "GNews",
    sourceType: "GNEWS",
    categories: ["startups-funding", "semiconductors-chips"],
    matchedKeywords: ["chip design", "eda", "funding", "semiconductor"],
    publishedAt: daysAgo(7),
    views: 890,
    clicks: 150,
  },
  {
    slug: "data-center-operators-eye-liquid-cooling",
    title: "Data Center Operators Widely Adopt Liquid Cooling for AI Racks",
    summary:
      "Rising power density from next-generation GPU racks is pushing operators toward liquid cooling as air cooling reaches its practical limits.",
    url: "https://example-tech-news.dev/liquid-cooling-ai-racks",
    imageUrl: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=1200",
    sourceName: "TechCrunch",
    sourceType: "RSS",
    categories: ["data-centers-cloud", "gpus"],
    matchedKeywords: ["data center", "liquid cooling", "gpu rack", "power density"],
    publishedAt: daysAgo(4),
    views: 1560,
    clicks: 300,
  },
];

async function main() {
  console.log("🌱 Seeding VectrazAI database (Phase 2)...");

  const categoryBySlug = new Map<string, { id: string }>();
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoryBySlug.set(cat.slug, created);
  }
  console.log(`✅ ${CATEGORIES.length} categories upserted`);

  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@vectrazai.dev" },
    update: {},
    create: {
      email: "admin@vectrazai.dev",
      passwordHash: adminPasswordHash,
      name: "VectrazAI Admin",
      role: "ADMIN",
      isEmailVerified: true,
    },
  });
  console.log("✅ Admin user ready → admin@vectrazai.dev / Admin@12345 (change in production!)");

  const demoUsersData = [
    { email: "alice@example.com", name: "Alice Chen" },
    { email: "bob@example.com", name: "Bob Martinez" },
  ];
  const demoUsers = [];
  for (const u of demoUsersData) {
    const passwordHash = await bcrypt.hash("Demo@12345", 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash, isEmailVerified: true },
    });
    demoUsers.push(user);
  }
  console.log(`✅ ${demoUsers.length} demo users ready (password: Demo@12345)`);

  await prisma.userCategoryPreference.upsert({
    where: {
      userId_categoryId: {
        userId: demoUsers[0].id,
        categoryId: categoryBySlug.get("artificial-intelligence")!.id,
      },
    },
    update: {},
    create: {
      userId: demoUsers[0].id,
      categoryId: categoryBySlug.get("artificial-intelligence")!.id,
    },
  });
  await prisma.userCategoryPreference.upsert({
    where: {
      userId_categoryId: {
        userId: demoUsers[0].id,
        categoryId: categoryBySlug.get("gpus")!.id,
      },
    },
    update: {},
    create: {
      userId: demoUsers[0].id,
      categoryId: categoryBySlug.get("gpus")!.id,
    },
  });

  await prisma.subscription.upsert({
    where: { id: `seed-sub-${demoUsers[0].id}` },
    update: {},
    create: {
      id: `seed-sub-${demoUsers[0].id}`,
      userId: demoUsers[0].id,
      plan: "PRO",
      status: "ACTIVE",
      isDummyPayment: true,
    },
  });
  await prisma.subscription.upsert({
    where: { id: `seed-sub-${demoUsers[1].id}` },
    update: {},
    create: {
      id: `seed-sub-${demoUsers[1].id}`,
      userId: demoUsers[1].id,
      plan: "FREE",
      status: "ACTIVE",
      isDummyPayment: true,
    },
  });
  console.log("✅ Demo subscriptions ready");

  for (const a of ARTICLES) {
    await prisma.newsArticle.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        slug: a.slug,
        title: a.title,
        summary: a.summary,
        url: a.url,
        imageUrl: a.imageUrl,
        sourceName: a.sourceName,
        sourceType: a.sourceType,
        matchedKeywords: a.matchedKeywords,
        publishedAt: a.publishedAt,
        views: a.views,
        clicks: a.clicks,
        status: "APPROVED",
        categories: {
          connect: a.categories.map((slug) => ({ id: categoryBySlug.get(slug)!.id })),
        },
      },
    });
  }
  console.log(`✅ ${ARTICLES.length} sample articles upserted`);

  const topArticle = await prisma.newsArticle.findUnique({
    where: { slug: "new-open-weight-model-matches-frontier-benchmarks" },
  });
  if (topArticle) {
    await prisma.articleView.createMany({
      data: Array.from({ length: 25 }).map((_, i) => ({
        articleId: topArticle.id,
        userId: i % 5 === 0 ? demoUsers[0].id : null,
        sessionId: i % 5 === 0 ? null : `seed-session-${i}`,
        viewedAt: new Date(Date.now() - i * 15 * 60 * 1000),
      })),
      skipDuplicates: true,
    });
  }
  console.log("✅ Sample article view events created");

  if (topArticle) {
    await prisma.notification.create({
      data: {
        userId: demoUsers[0].id,
        type: "NEW_ARTICLE",
        status: "UNREAD",
        title: "New article in Artificial Intelligence",
        message: topArticle.title,
        articleId: topArticle.id,
      },
    });
  }
  console.log("✅ Sample notification created");

  await prisma.auditLog.create({
    data: {
      action: "SEED_RUN",
      performedById: admin.id,
      targetType: "System",
      metadata: { note: "Phase 2 seed script executed" },
    },
  });

  const sourceTypes = [
    "NEWSAPI",
    "GNEWS",
    "NEWSDATA",
    "MEDIASTACK",
    "GUARDIAN",
    "HACKERNEWS",
    "ARXIV",
    "REDDIT",
    "RSS",
    "CURRENTS",
    "GDELT",
    "GOOGLE_NEWS",
    "BING_NEWS",
  ] as const;
  await prisma.newsSourceLog.createMany({
    data: sourceTypes.map((s, i) => ({
      sourceType: s,
      success: i !== 3,
      articlesFetched: i === 3 ? 0 : 10 + i * 3,
      errorMessage: i === 3 ? "Rate limit exceeded (429)" : null,
    })),
  });
  console.log("✅ News source health logs seeded");

  console.log("🌱 Seed complete.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
