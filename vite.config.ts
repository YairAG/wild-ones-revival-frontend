import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // "@/..." apunta a app/: import { Button } from "@/components/Button"
  resolve: { alias: { "@": fileURLToPath(new URL("./app", import.meta.url)) } },
});
