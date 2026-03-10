/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // allowedDevOrigins: removed — do not commit internal IPs to source control
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-Content-Type-Options",  value: "nosniff" },
          // X-XSS-Protection: 0 — explicitly disabled; modern browsers use CSP instead.
          // The old "1; mode=block" value can introduce XSS vulnerabilities in IE8/9.
          { key: "X-XSS-Protection",        value: "0" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
          // HSTS — tell browsers to always use HTTPS for 2 years
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-eval' is required by Next.js webpack HMR in dev; tighten with a nonce in a future pass
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
              "font-src 'self'",
              "connect-src 'self' https://generativelanguage.googleapis.com https://api.groq.com https://api.openai.com http://localhost:11434",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

