import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const baseUrl = 'https://ark-commerce.substrateholdingsai.workers.dev';
  const lastMod = new Date().toISOString().split('T')[0];

  const pages = [
    {
      url: `${baseUrl}/`,
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      url: `${baseUrl}/temozonia`,
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: `${baseUrl}/mayoreo`,
      changefreq: 'monthly',
      priority: '0.6',
    },
    {
      url: `${baseUrl}/recetas`,
      changefreq: 'monthly',
      priority: '0.6',
    },
    {
      url: `${baseUrl}/conocenos`,
      changefreq: 'monthly',
      priority: '0.5',
    },
    {
      url: `${baseUrl}/contacto`,
      changefreq: 'monthly',
      priority: '0.5',
    },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
