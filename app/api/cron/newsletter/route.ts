import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildUtmUrl } from "@/lib/utm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE_URL = "https://trend.franvia.com";
const FROM_ADDRESS = "Franvia K-Trend Chart <newsletter@franvia.com>";
const RESEND_BATCH_SIZE = 100;
const UTM_SOURCE = "newsletter";
const UTM_MEDIUM = "email";
const UTM_CAMPAIGN = "weekly_digest";

interface BoxOfficeRow {
  rank: number;
  movie_name: string;
  en_title: string | null;
  slug: string | null;
  audience_acc: number;
}

interface DramaRow {
  rank: number;
  title: string;
  en_title: string | null;
  slug: string | null;
}

interface FranviaPost {
  title: string;
  url: string;
  summary: string;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripHtmlAndTruncate(html: string, maxLength = 140): string {
  const text = decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

async function getActiveSubscriberEmails(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "active");

  if (error || !data) return [];
  return data.map((row: { email: string }) => row.email);
}

async function getTopBoxOffice(supabase: SupabaseClient): Promise<BoxOfficeRow[]> {
  const { data: latest } = await supabase
    .from("boxoffice")
    .select("rank_date")
    .order("rank_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.rank_date) return [];

  const { data, error } = await supabase
    .from("boxoffice")
    .select("rank, movie_name, en_title, slug, audience_acc")
    .eq("rank_date", latest.rank_date)
    .lte("rank", 5)
    .order("rank", { ascending: true });

  if (error || !data) return [];
  return data;
}

async function getTopDramas(supabase: SupabaseClient): Promise<DramaRow[]> {
  const { data: latest } = await supabase
    .from("dramas")
    .select("rank_date")
    .order("rank_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.rank_date) return [];

  const { data, error } = await supabase
    .from("dramas")
    .select("rank, title, en_title, slug")
    .eq("rank_date", latest.rank_date)
    .lte("rank", 5)
    .order("rank", { ascending: true });

  if (error || !data) return [];
  return data;
}

interface BloggerFeedLink {
  rel?: string;
  href?: string;
}

interface BloggerFeedEntry {
  title?: { $t?: string };
  summary?: { $t?: string };
  content?: { $t?: string };
  link?: BloggerFeedLink[];
}

// Franvia 피드 fetch/파싱 실패는 뉴스레터 전체를 막지 않고, 빈 배열로
// 넘어가서 "From Franvia" 섹션만 생략되도록 한다.
async function getFranviaPosts(): Promise<FranviaPost[]> {
  try {
    const res = await fetch(
      "https://www.franvia.com/feeds/posts/default?alt=json&max-results=2",
    );
    if (!res.ok) return [];

    const data = await res.json();
    const entries: BloggerFeedEntry[] = data?.feed?.entry ?? [];

    return entries
      .slice(0, 2)
      .map((entry) => {
        const altLink = (entry.link ?? []).find((l) => l.rel === "alternate");
        const summaryHtml = entry.summary?.$t ?? entry.content?.$t ?? "";

        return {
          title: entry.title?.$t ? decodeEntities(entry.title.$t) : "",
          url: altLink?.href ?? "",
          summary: stripHtmlAndTruncate(summaryHtml),
        };
      })
      .filter((post) => post.title && post.url);
  } catch (err) {
    console.error("Failed to fetch/parse Franvia feed:", err);
    return [];
  }
}

function movieRowHtml(movie: BoxOfficeRow): string {
  const title = movie.en_title || movie.movie_name;
  const link = movie.slug
    ? buildUtmUrl(
        `${SITE_URL}/movies/${movie.slug}`,
        UTM_SOURCE,
        UTM_MEDIUM,
        UTM_CAMPAIGN,
      )
    : null;

  const titleHtml = link
    ? `<a href="${link}" style="color:#18181b;text-decoration:none;font-weight:600;">${title}</a>`
    : `<span style="color:#18181b;font-weight:600;">${title}</span>`;

  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e4e4e7;">
        <span style="display:inline-block;width:22px;font-weight:700;color:#fbbf24;font-size:14px;">#${movie.rank}</span>
        ${titleHtml}
        <div style="margin-top:2px;margin-left:22px;font-size:12px;color:#71717a;">Cumulative admissions: ${movie.audience_acc.toLocaleString("en-US")}</div>
      </td>
    </tr>`;
}

function dramaRowHtml(drama: DramaRow): string {
  const title = drama.en_title || drama.title;
  const link = drama.slug
    ? buildUtmUrl(
        `${SITE_URL}/dramas/${drama.slug}`,
        UTM_SOURCE,
        UTM_MEDIUM,
        UTM_CAMPAIGN,
      )
    : null;

  const titleHtml = link
    ? `<a href="${link}" style="color:#18181b;text-decoration:none;font-weight:600;">${title}</a>`
    : `<span style="color:#18181b;font-weight:600;">${title}</span>`;

  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e4e4e7;">
        <span style="display:inline-block;width:22px;font-weight:700;color:#fbbf24;font-size:14px;">#${drama.rank}</span>
        ${titleHtml}
      </td>
    </tr>`;
}

function postBlockHtml(post: FranviaPost): string {
  const link = buildUtmUrl(post.url, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN);
  return `
    <div style="margin-bottom:16px;">
      <a href="${link}" style="font-weight:600;color:#18181b;text-decoration:none;font-size:15px;">${post.title}</a>
      <p style="margin:4px 0 0;font-size:13px;line-height:1.5;color:#52525b;">${post.summary}</p>
    </div>`;
}

function renderNewsletterHtml({
  subscriberEmail,
  movies,
  dramas,
  posts,
}: {
  subscriberEmail: string;
  movies: BoxOfficeRow[];
  dramas: DramaRow[];
  posts: FranviaPost[];
}): string {
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;

  const moviesSection =
    movies.length > 0
      ? `
      <h2 style="margin:32px 0 12px;font-size:17px;color:#18181b;">This Week&rsquo;s Box Office</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${movies.map(movieRowHtml).join("")}
      </table>`
      : "";

  const dramasSection =
    dramas.length > 0
      ? `
      <h2 style="margin:32px 0 12px;font-size:17px;color:#18181b;">This Week&rsquo;s K-Drama Rankings</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${dramas.map(dramaRowHtml).join("")}
      </table>`
      : "";

  const postsSection =
    posts.length > 0
      ? `
      <h2 style="margin:32px 0 12px;font-size:17px;color:#18181b;">From Franvia</h2>
      ${posts.map(postBlockHtml).join("")}`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Franvia K-Trend Weekly</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#18181b;padding:24px 32px;">
              <span style="color:#fbbf24;font-size:22px;font-weight:800;letter-spacing:0.05em;">FRANVIA</span>
              <span style="color:#ffffff;font-size:15px;font-weight:300;margin-left:8px;">K-TREND WEEKLY</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${moviesSection}
              ${dramasSection}
              ${postsSection}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f4f4f5;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#71717a;">You&rsquo;re receiving this because you subscribed to Franvia K-Trend Chart</p>
              <a href="${unsubscribeUrl}" style="font-size:12px;color:#71717a;text-decoration:underline;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseSecretKey || !resendApiKey) {
    return NextResponse.json(
      { error: "Missing required environment variables" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });
  const resend = new Resend(resendApiKey);

  const [subscriberEmails, movies, dramas, posts] = await Promise.all([
    getActiveSubscriberEmails(supabase),
    getTopBoxOffice(supabase),
    getTopDramas(supabase),
    getFranviaPosts(),
  ]);

  if (subscriberEmails.length === 0) {
    return NextResponse.json({
      message: "No active subscribers",
      sent: 0,
      failed: 0,
    });
  }

  const emails = subscriberEmails.map((subscriberEmail) => ({
    from: FROM_ADDRESS,
    to: subscriberEmail,
    subject: "Franvia K-Trend Weekly",
    html: renderNewsletterHtml({ subscriberEmail, movies, dramas, posts }),
  }));

  let sent = 0;
  let failed = 0;

  // Resend batch send는 최대 100개까지 지원하니 청크로 나눠서 순차 발송하고,
  // 한 청크가 실패해도 나머지 청크는 계속 진행한다.
  for (let i = 0; i < emails.length; i += RESEND_BATCH_SIZE) {
    const chunk = emails.slice(i, i + RESEND_BATCH_SIZE);
    try {
      const { data, error } = await resend.batch.send(chunk);
      if (error) {
        console.error("Resend batch send failed:", error);
        failed += chunk.length;
      } else {
        sent += data?.data?.length ?? chunk.length;
      }
    } catch (err) {
      console.error("Resend batch send threw:", err);
      failed += chunk.length;
    }
  }

  return NextResponse.json({
    message: "Newsletter dispatch complete",
    subscriberCount: subscriberEmails.length,
    moviesIncluded: movies.length,
    dramasIncluded: dramas.length,
    postsIncluded: posts.length,
    sent,
    failed,
  });
}
