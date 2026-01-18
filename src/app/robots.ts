import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    // sitemap: 'https://imenu.kg/sitemap.xml', // Если будет сайтмап
  };
}
