import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Test sur téléphone en local (npm run telephone) : autorise l'adresse du réseau local
  allowedDevOrigins: process.env.PHONE_HOST ? [process.env.PHONE_HOST] : [],
};

export default nextConfig;
