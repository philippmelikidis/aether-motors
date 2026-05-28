/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // All product, gallery and vehicle imagery is served from the project's
    // MinIO instance. The host can be overridden at build time via the
    // NEXT_PUBLIC_MEDIA_URL env variable; the entry below allow-lists the
    // default docker-compose endpoint.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/aether-images/**",
      },
      {
        protocol: "http",
        hostname: "minio",
        port: "9000",
        pathname: "/aether-images/**",
      },
    ],
  },
};

module.exports = nextConfig;
