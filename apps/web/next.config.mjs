/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["database", "ui"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://api:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
