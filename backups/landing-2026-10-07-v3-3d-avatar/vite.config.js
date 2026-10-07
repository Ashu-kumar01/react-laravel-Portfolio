import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { seoFiles } from './scripts/vite-plugin-seo-files.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      react(),
      tailwindcss(),
      seoFiles({ siteUrl: env.VITE_SITE_URL, apiBaseUrl: env.VITE_API_BASE_URL }),
    ],
    server: { port: 5173, strictPort: true },
    // Deps used only by lazily-loaded routes/components. Pre-bundling them up front stops the dev
    // optimizer from re-bundling mid-session, which breaks lazy imports with 504 "Outdated Optimize Dep".
    optimizeDeps: {
      include: ['react-hook-form', '@hookform/resolvers/zod', 'zod', 'three', '@react-three/fiber', '@react-three/drei'],
    },
    preview: { port: 4173, strictPort: true },
    build: {
      target: 'es2022',
      sourcemap: false,
      // The lazily-loaded 3D hero chunk (three.js + R3F) is ~920 kB raw / ~245 kB gzip by design;
      // it is fetched after idle on capable devices only, never on the critical path.
      chunkSizeWarningLimit: 1000,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      include: ['src/**/*.test.{js,jsx}'],
      css: false,
    },
  }
})
