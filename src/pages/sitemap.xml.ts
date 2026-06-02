import type { APIRoute } from 'astro';
import { getPosts, getProducts, getPages } from '../lib/db';

export const GET: APIRoute = async ({ locals, url }) => {
  const dbBinding = locals.runtime?.env?.DB;
  
  // Fetch dynamic entities from D1 / JSON fallback
  const posts = await getPosts(dbBinding);
  const products = await getProducts(dbBinding);
  const pages = await getPages(dbBinding);

  const baseUrl = url.origin;

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Core Links -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/urunler</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/kategoriler</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/urun-kategoriler</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Dynamic Static Pages -->
  ${pages.map(page => `  <url>
    <loc>${baseUrl}/sayfa/${page.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`).join('')}
  <!-- Dynamic Blog Posts -->
  ${posts.map(post => `  <url>
    <loc>${baseUrl}/${post.category?.slug || 'genel'}/${post.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`).join('')}
  <!-- Dynamic E-Commerce Products -->
  ${products.map(product => `  <url>
    <loc>${baseUrl}/urun/${product.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`).join('')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
