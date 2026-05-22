import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server', // Bu çok önemli!
  integrations: [tailwind()],
});