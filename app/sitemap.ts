import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: "https://trend.franvia.com/",
      lastModified: now,
      changeFrequency: "daily",
    },
    {
      url: "https://trend.franvia.com/about",
      lastModified: now,
      changeFrequency: "monthly",
    },
    {
      url: "https://trend.franvia.com/contact",
      lastModified: now,
      changeFrequency: "monthly",
    },
    {
      url: "https://trend.franvia.com/privacy",
      lastModified: now,
      changeFrequency: "monthly",
    },
    {
      url: "https://trend.franvia.com/terms",
      lastModified: now,
      changeFrequency: "monthly",
    },
  ];
}
