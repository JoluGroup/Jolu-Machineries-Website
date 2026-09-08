import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
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
});
