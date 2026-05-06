import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/dashboard",
          "/inventory",
          "/sales",
          "/settings",
          "/setup",
          "/stores",
          "/warehouse",
          "/notifications",
          "/printers",
          "/reports",
          "/integrations",
          "/audit",
          "/barcodes",
          "/credit",
          "/customers",
          "/products",
          "/purchases",
          "/suppliers",
          "/transfers",
          "/users",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

