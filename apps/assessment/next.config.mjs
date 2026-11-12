/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // NEXT_BUILD_ID pins the build ID (the live files use ARpQSJIIQF3h35iT9oHsg); otherwise Next picks a random one.
  generateBuildId: async () => process.env.NEXT_BUILD_ID || null,
};

export default nextConfig;
