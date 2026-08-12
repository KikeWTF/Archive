import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kike.wtf',
  base: '/archive',
  output: 'static',
  outDir: './www',
  vite: {
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: { chrome: 100, safari: 16, firefox: 100, edge: 100 }
      }
    }
  }
});
