import type { APIRoute } from 'astro';
import { getPosts } from '../lib/db';

export const GET: APIRoute = async ({ locals, url }) => {
  const dbBinding = locals.runtime?.env?.DB;
  
  // Fetch active posts from DB
  const posts = await getPosts(dbBinding);
  
  // Take latest 20 published posts
  const latestPosts = posts.slice(0, 20);
  const baseUrl = url.origin;

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Laflaf.net - Güncel Yazılar</title>
    <link>${baseUrl}</link>
    <description>Teknoloji, yazılım, yaşam ve e-ticaret dünyasından en yeni haberler ve incelemeler.</description>
    <language>tr</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${latestPosts.map(post => {
      const postLink = `${baseUrl}/${post.category?.slug || 'genel'}/${post.slug}`;
      const pubDate = new Date(post.publishedAt || post.createdAt).toUTCString();
      const cleanExcerpt = (post.excerpt || post.title)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      const cleanTitle = post.title
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      return `    <item>
      <title>${cleanTitle}</title>
      <link>${postLink}</link>
      <guid isPermaLink="true">${postLink}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${cleanExcerpt}</description>
    </item>
`;
    }).join('')}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
