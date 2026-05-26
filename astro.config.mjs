import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced'
  }),
  integrations: [tailwind()],
  vite: {
    ssr: {
      external: ['node:fs', 'node:path', 'web-push']
    }
  }
});