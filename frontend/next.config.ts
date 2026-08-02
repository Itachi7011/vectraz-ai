import type { NextConfig } from "next";

/**
 * SINGLE-ORIGIN API ROUTING
 * ─────────────────────────
 * This is the Next.js equivalent of your Vite `server.proxy` setup.
 * The browser only ever calls same-origin paths like:
 *
 *     fetch("/api/auth/login")
 *     fetch("/api/news?category=chips")
 *
 * Next.js then transparently forwards those requests server-side to
 * whichever microservice owns that path. No CORS exposure to the
 * client, no separate public API host to manage, exactly like the
 * Vite proxy pattern you're used to.
 *
 * Order matters: the more specific "/api/auth/:path*" rule MUST come
 * before the catch-all "/api/:path*" rule, or every request would
 * match the general rule first.
 */
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? "http://localhost:5003";
const MAIN_SERVICE_URL = process.env.MAIN_SERVICE_URL ?? "http://localhost:5002";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${AUTH_SERVICE_URL}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${MAIN_SERVICE_URL}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
