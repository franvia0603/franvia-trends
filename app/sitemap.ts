import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface SlugRow {
  slug: string | null;
  rank_date: string;
}

// slug 기준으로 중복 제거하면서, 각 작품의 가장 최근 rank_date를 남긴다.
// rank_date 내림차순으로 조회하므로 처음 등장하는 값이 곧 최신 값이다.
function latestBySlug(rows: SlugRow[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const row of rows) {
    if (!row.slug) continue;
    if (!map.has(row.slug)) {
      map.set(row.slug, row.rank_date);
    }
  }

  return map;
}

async function getMovieSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("boxoffice")
    .select("slug, rank_date")
    .not("slug", "is", null)
    .order("rank_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return Array.from(latestBySlug(data).entries()).map(([slug, rankDate]) => ({
    url: `https://trend.franvia.com/movies/${slug}`,
    lastModified: new Date(rankDate),
    changeFrequency: "weekly" as const,
  }));
}

async function getDramaSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("dramas")
    .select("slug, rank_date")
    .not("slug", "is", null)
    .order("rank_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return Array.from(latestBySlug(data).entries()).map(([slug, rankDate]) => ({
    url: `https://trend.franvia.com/dramas/${slug}`,
    lastModified: new Date(rankDate),
    changeFrequency: "weekly" as const,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [movieEntries, dramaEntries] = await Promise.all([
    getMovieSitemapEntries(),
    getDramaSitemapEntries(),
  ]);

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
    ...movieEntries,
    ...dramaEntries,
  ];
}
