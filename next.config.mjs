/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/willbuilder-version2",
  assetPrefix: "/willbuilder-version2/",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
