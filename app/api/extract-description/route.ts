import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTNAMES = new Set([
  "franvia.com",
  "www.franvia.com",
  "trend.franvia.com",
]);

const FETCH_TIMEOUT_MS = 5000;

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'");
}

// content가 앞이든 뒤든(예: <meta content="..." property="og:description">)
// 상관없이 잡아내기 위해 두 방향 모두 시도한다.
function extractMetaContent(html: string, attr: string, value: string): string | null {
  const forward = new RegExp(
    `<meta[^>]+${attr}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const backward = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${value}["'][^>]*>`,
    "i",
  );

  const match = html.match(forward) ?? html.match(backward);
  return match?.[1] ? decodeHtmlEntities(match[1]) : null;
}

function extractDescription(html: string): string | null {
  return (
    extractMetaContent(html, "property", "og:description") ??
    extractMetaContent(html, "name", "description")
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json(
      { description: null, error: "Missing url parameter" },
      { status: 400 },
    );
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json(
      { description: null, error: "Invalid url" },
      { status: 400 },
    );
  }

  // 임의의 외부 URL을 서버가 대신 fetch하지 않도록 franvia.com 계열만 허용한다.
  if (!ALLOWED_HOSTNAMES.has(target.hostname)) {
    return NextResponse.json(
      { description: null, error: "Hostname not allowed" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(target.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      return NextResponse.json({
        description: null,
        error: `Fetch failed with status ${res.status}`,
      });
    }

    const html = await res.text();
    return NextResponse.json({ description: extractDescription(html) });
  } catch (err) {
    return NextResponse.json({
      description: null,
      error: err instanceof Error ? err.message : "Fetch failed",
    });
  }
}
