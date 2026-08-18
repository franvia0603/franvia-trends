import { createSupabaseServerClient } from "@/lib/supabase/server";

// Vercel Hobby 크론이 하루 1회 도는 주기와 맞춰, 하루에 한 번만 재생성한다.
export const revalidate = 86400;

const SITE_URL = "https://trend.franvia.com";
const SITE_TITLE = "Franvia K-Trend Chart";
const SITE_DESCRIPTION =
  "Real-time K-Movie box office and K-Drama rankings, sourced from KOBIS and TMDB.";

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

interface BoxOfficeFeedRow {
  movie_name: string;
  en_title: string | null;
  slug: string | null;
  rank: number;
  rank_change: number | null;
  audience_acc: number;
  rank_date: string;
}

interface DramaFeedRow {
  title: string;
  en_title: string | null;
  slug: string | null;
  rank: number;
  rank_change: number | null;
  overview: string | null;
  rank_date: string;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRankChange(change: number | null): string {
  if (!change) return "no change from the previous update";
  return change > 0
    ? `up ${change} spot${change === 1 ? "" : "s"}`
    : `down ${Math.abs(change)} spot${Math.abs(change) === 1 ? "" : "s"}`;
}

async function getBoxOfficeFeedItems(): Promise<FeedItem[]> {
  const supabase = createSupabaseServerClient();

  const { data: latest } = await supabase
    .from("boxoffice")
    .select("rank_date")
    .order("rank_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.rank_date) return [];

  const { data, error } = await supabase
    .from("boxoffice")
    .select(
      "movie_name, en_title, slug, rank, rank_change, audience_acc, rank_date",
    )
    .eq("rank_date", latest.rank_date)
    .not("slug", "is", null)
    .order("rank", { ascending: true });

  if (error || !data) return [];

  return (data as BoxOfficeFeedRow[]).map((row) => {
    const title = row.en_title || row.movie_name;
    return {
      title: `${title} — #${row.rank} this week`,
      link: `${SITE_URL}/movies/${row.slug}`,
      description: `Currently ranked #${row.rank} on the Korean box office (${formatRankChange(row.rank_change)}). Cumulative admissions: ${row.audience_acc.toLocaleString("en-US")}.`,
      pubDate: new Date(row.rank_date).toUTCString(),
    };
  });
}

async function getDramaFeedItems(): Promise<FeedItem[]> {
  const supabase = createSupabaseServerClient();

  const { data: latest } = await supabase
    .from("dramas")
    .select("rank_date")
    .order("rank_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.rank_date) return [];

  const { data, error } = await supabase
    .from("dramas")
    .select("title, en_title, slug, rank, rank_change, overview, rank_date")
    .eq("rank_date", latest.rank_date)
    .not("slug", "is", null)
    .order("rank", { ascending: true });

  if (error || !data) return [];

  return (data as DramaFeedRow[]).map((row) => {
    const title = row.en_title || row.title;
    const summary = row.overview
      ? ` ${row.overview.slice(0, 140)}${row.overview.length > 140 ? "…" : ""}`
      : "";
    return {
      title: `${title} — #${row.rank} this week`,
      link: `${SITE_URL}/dramas/${row.slug}`,
      description: `Currently ranked #${row.rank} in trending K-Drama (${formatRankChange(row.rank_change)}).${summary}`,
      pubDate: new Date(row.rank_date).toUTCString(),
    };
  });
}

function buildRssXml(items: FeedItem[], lastBuildDate: string): string {
  const itemsXml = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${itemsXml}
  </channel>
</rss>
`;
}

export async function GET() {
  const [movieItems, dramaItems] = await Promise.all([
    getBoxOfficeFeedItems(),
    getDramaFeedItems(),
  ]);

  const items = [...movieItems, ...dramaItems]
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 30);

  const lastBuildDate =
    items.length > 0 ? items[0].pubDate : new Date().toUTCString();

  const xml = buildRssXml(items, lastBuildDate);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
