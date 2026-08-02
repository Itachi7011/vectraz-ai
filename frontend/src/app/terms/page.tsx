export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
        Terms of Service
      </h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Placeholder terms of service. Replace this with real terms before launch — cover
        acceptable use, account termination/blocking policy, subscription terms once real payment
        is wired up, and that article content is aggregated from third-party sources (link back
        to original publishers rather than reproducing full articles).
      </p>
    </div>
  );
}
