import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://trend.franvia.com/",
      lastModified: new Date(),
      changeFrequency: "daily",
    },
  ];
}
