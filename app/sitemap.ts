import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/**
 * Sitemap public — uniquement la landing (les espaces authentifiés sont
 * `Disallow:` dans `robots.ts`). On déclare les `alternates` hreflang pour
 * que Google associe la home au public francophone du Gabon.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          "fr-GA": `${siteUrl}/`,
          fr: `${siteUrl}/`,
          "x-default": `${siteUrl}/`,
        },
      },
    },
  ];
}
