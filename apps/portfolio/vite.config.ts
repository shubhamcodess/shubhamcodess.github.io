import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// One HTML file per route, so every page loads directly on static hosting with no SPA fallback.
// PORTFOLIO_BASE is the path the site is served from, for example "/shubham-portfolio/".
export default defineConfig({
  base: process.env.PORTFOLIO_BASE ?? '/',
  appType: 'mpa',
  plugins: [react()],
  build: {
    target: 'es2022',
    rolldownOptions: { input: { home: 'index.html', builds: 'builds/index.html' } },
  },
})
