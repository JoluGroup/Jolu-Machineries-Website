import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { resolveApiBase } from "./src/lib/api";

// M2-QUOTE-01: a Vercel *production* build must never ship without a valid API origin, otherwise every enquiry
// form would be dead. Preview/CI/local builds only warn (the forms then show a "contact us directly" message).
function assertApiBase(mode: string) {
  const env = { ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env };
  if (resolveApiBase(env.VITE_API_BASE)) return;
  const msg = "VITE_API_BASE is missing or invalid (expected an absolute https:// origin).";
  if (process.env.VERCEL_ENV === "production") throw new Error(`[build] ${msg} Refusing to build production.`);
  console.warn(`[build] warning: ${msg} Enquiry forms will show a 'contact us directly' message.`);
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
