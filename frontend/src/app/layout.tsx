import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SiteChrome } from "@/components/SiteChrome";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vectrazai-dummy-url.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VectrazAI — AI, Chips & Semiconductor News",
    template: "%s | VectrazAI",
  },
  description:
    "VectrazAI aggregates and curates the latest news on artificial intelligence, GPUs, chips, and semiconductors from dozens of sources.",
  keywords: [
    "AI news",
    "artificial intelligence",
    "GPU news",
    "semiconductor news",
    "chip news",
    "machine learning",
  ],
  openGraph: {
    type: "website",
    siteName: "VectrazAI",
    title: "VectrazAI — AI, Chips & Semiconductor News",
    description: "The latest AI, GPU, chip, and semiconductor news, curated in one place.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "VectrazAI — AI, Chips & Semiconductor News",
    description: "The latest AI, GPU, chip, and semiconductor news, curated in one place.",
  },
  robots: { index: true, follow: true },
};

// Prevents a flash of the wrong theme before hydration by applying the
// stored theme synchronously, before first paint.
const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('vectrazai-theme');
      var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
