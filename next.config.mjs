/** @type {import('next').NextConfig} */
export default {
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
      { hostname: "iili.io" },
      { hostname: "res.cloudinary.com" },
      { hostname: "images.unsplash.com" },
    ],
  },
  compress: true,
  output: "export",
  productionBrowserSourceMaps: false,
};
