/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Since we're using local images
  },
  // Enable React strict mode for cleaner component implementation
  reactStrictMode: true,
};

module.exports = nextConfig;