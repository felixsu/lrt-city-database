import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Caps the whole multipart request body, not per file — the create/add
      // media forms allow selecting several files at once, each up to the
      // 10MB per-file cap enforced in application code (see
      // assertUploadableSize in src/lib/cloudinary.ts).
      bodySizeLimit: "50mb",
    },
    // src/proxy.ts (auth guard on /admin/:path*) buffers the full request
    // body separately from the serverActions limit above, defaulting to
    // 10MB — without raising this too, uploads get silently truncated
    // before the server action ever sees a complete multipart body.
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
