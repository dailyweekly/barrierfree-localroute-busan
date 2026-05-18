/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  // 공공데이터 호출은 서버 사이드에서만. 클라이언트로 키 노출 금지.
};

export default nextConfig;
