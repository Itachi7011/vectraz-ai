export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
        About VectrazAI
      </h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
        VectrazAI is a focused news portal for one thing: everything happening in artificial
        intelligence and the hardware that powers it — GPUs, chips, semiconductors, and the
        infrastructure behind modern AI. We don&apos;t generate AI content ourselves; we curate
        and surface the real reporting that already exists, pulled from dozens of sources and
        filtered specifically for this topic.
      </p>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Our filtering runs on a large manually-maintained keyword system by default, with an
        optional AI-assisted classification layer when configured — either way, you get a feed
        that&apos;s actually about AI and silicon, not a firehose of general tech news.
      </p>
    </div>
  );
}
