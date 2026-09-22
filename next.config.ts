import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Ce projet cohabite avec le site ENMA Formation dans le même dépôt
  // (deux package-lock.json) : on force explicitement sa propre racine.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
