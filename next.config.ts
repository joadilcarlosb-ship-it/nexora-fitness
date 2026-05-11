const withPWA =
  require("@ducanh2912/next-pwa")
    .default({
      dest: "public",
    });

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports =
  withPWA(nextConfig);