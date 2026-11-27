import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { checkApiBaseForBuild } from "./src/lib/api-base-guard";

// M2-CLAIMS-02: expose the deployment environment to the client bundle so production builds hide pending claims.
// (Vite exposes VITE_* variables from process.env; Vercel provides VERCEL_ENV during builds.)
if (process.env.VITE_DEPLOY_ENV === undefined) process.env.VITE_DEPLOY_ENV = process.env.VERCEL_ENV ?? "";

// M2-QUOTE-01: fail Vercel production builds without a valid VITE_API_BASE; warn elsewhere.
function assertApiBase(mode: string) {
  const env = { ...loadEnv(mode, __dirname, "VITE_"), ...process.env };
  const check = checkApiBaseForBuild(env.VITE_API_BASE, process.env.VERCEL_ENV);
  if (check.fatal) throw new Error(check.message);
  if (!check.ok) console.warn(check.message);
}

export default defineConfig(({ command, mode }) => {
  if (command === "build") assertApiBase(mode);
  return {
  server: {
    host: "::",
    port: 8080,
    // Suffix-matched entries so every v0 preview sandbox (random hostname per
    // preview) is allowed without listing individual hosts. A leading dot makes
    // Vite match the domain and all of its subdomains.
    allowedHosts: [".vercel.run", ".v0.build"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
};
});
