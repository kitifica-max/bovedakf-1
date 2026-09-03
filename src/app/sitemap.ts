import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
