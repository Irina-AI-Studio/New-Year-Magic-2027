import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  esbuild: { jsx: 'automatic' },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Motion shares its modules with React Server Component consumers.
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.id?.includes('/framer-motion/')) return
        warn(warning)
      },
    },
  },
})
