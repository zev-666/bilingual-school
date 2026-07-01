/** @type {import('next').NextConfig} */
const nextConfig = {
  // 告訴 Next.js 在建置時忽略 ESLint 錯誤
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 告訴 Next.js 在建置時忽略 TypeScript 型別錯誤
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;