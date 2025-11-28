/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      "iili.io",
      "res.cloudinary.com",
      "images.unsplash.com",
    ],
  },
  output: "export",
};

export default nextConfig;
