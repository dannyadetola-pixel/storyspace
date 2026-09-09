/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: process.env.SUPABASE_URL
      ? [
          {
            protocol: "https",
            hostname: new URL(process.env.SUPABASE_URL).hostname,
            pathname: "/**",
          },
        ]
      : [],
  },
};

module.exports = nextConfig;