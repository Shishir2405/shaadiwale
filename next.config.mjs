/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode to avoid duplicate WebRTC connections on dev
  reactStrictMode: false,

  // Your existing image configuration
  images: {
    domains: [
      "letsenhance.io",
      "firebasestorage.googleapis.com", // for Firebase Storage URLs
      "storage.googleapis.com", // also for Firebase
      "localhost", // for local development
      "images.unsplash.com", // Add this line for Unsplash images
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "letsenhance.io",
        port: "",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "*.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      }, // You can also add this remote pattern if desired
    ],
  },

  // Fix for Socket.IO
  webpack: (config, { isServer }) => {
    // Fix for Socket.IO
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        { bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" },
      ];
    }
    return config;
  },
  // Important: Do NOT set trailingSlash to true as it can interfere with Socket.IO path handling
};

export default nextConfig;