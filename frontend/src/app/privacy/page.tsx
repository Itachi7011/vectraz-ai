export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
        Privacy Policy
      </h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        Placeholder privacy policy. Replace this with your real policy before launch — cover what
        account data is collected (email, name, preferences), how article view/click analytics
        are used, cookie usage (session + auth cookies), and third-party services in use
        (SendGrid for email, Cloudinary for avatar storage, and the news source APIs).
      </p>
    </div>
  );
}
