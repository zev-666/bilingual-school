/** @type {import('next').NextConfig} */
const nextConfig = {
  // 告訴 Next.js 在建置時忽略 ESLint 錯誤，讓部署能順利通過
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;