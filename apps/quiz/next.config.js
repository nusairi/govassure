/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // NEXT_BUILD_ID pins the build ID (tools/build.sh passes it through); unset gives Next's random ID.
  generateBuildId: async () => process.env.NEXT_BUILD_ID || null,
};

module.exports = nextConfig;
