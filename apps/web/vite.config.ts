/// <reference types="vitest/config" />
import path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { fileURLToPath } from 'node:url';

const __dirname = typeof globalThis.__dirname !== 'undefined'
  ? globalThis.__dirname
  : path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  envDir: "../../",
  plugins: [
    tanstackRouter(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  preview: {
    port: parseInt(process.env.PORT || "5173"),
    host: true,
    allowedHosts: true,
  },
});
