import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Use Next's compiler API instead of spawning tsc. This keeps builds
    // compatible with restricted development environments such as Codex.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
