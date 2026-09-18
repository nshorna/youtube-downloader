/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable image optimization for better SEO and performance
    // Allow YouTube thumbnail domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
    // Keep unoptimized for static exports if needed, but enable optimization for better SEO
    // unoptimized: true, // Commented out to enable optimization
  },
}

export default nextConfig
