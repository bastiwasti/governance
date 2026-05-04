import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "ssh2"],
  allowedDevOrigins: ["192.168.178.192"],
};

export default nextConfig;
