/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for landing page
  // output: 'export',
  
  // Configure images if using Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Transpile packages from the monorepo if needed
  // transpilePackages: ['@arc/shared'],
};

module.exports = nextConfig;
