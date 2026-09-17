import type { NextConfig } from 'next';
const nextConfig: NextConfig = { agentRules: false, transpilePackages: ['@plate40/auth','@plate40/config','@plate40/hooks','@plate40/state','@plate40/types','@plate40/ui','@plate40/utils'] };
export default nextConfig;
