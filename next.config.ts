import type { NextConfig } from "next";

// In production the browser calls /api/* on this site and Next forwards it to
// the backend, so the refresh cookie stays on one domain. Locally BACKEND_URL is
// unset and the frontend calls the backend directly (NEXT_PUBLIC_API_URL).
const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    if (!backendUrl) return [];
    return [{ source: "/api/:path*", destination: `${backendUrl}/:path*` }];
  },
};

export default nextConfig;
