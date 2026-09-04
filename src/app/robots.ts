import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Dashboard is private, and shared-credential links must never be
      // crawled or cached — they carry live secrets.
      disallow: ["/dashboard", "/dashboard/", "/admin", "/invite", "/s/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
