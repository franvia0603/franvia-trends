import Image from "next/image";

interface FranviaPost {
  title: string;
  url: string;
  publishedAt: string;
  summary: string | null;
  thumbnailUrl: string | null;
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

function extractSummary(contentHtml: string, maxLength = 160): string | null {
  const stripped = contentHtml
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<div class="blogger-post-footer">[\s\S]*?<\/div>/i, "")
    .replace(/<a[^>]*>\s*Read more[^<]*<\/a>/gi, "")
    .replace(/<table[\s\S]*?<\/table>/gi, "")
    .replace(/<[^>]+>/g, " ");

  const text = decodeEntities(stripped).replace(/\s+/g, " ").trim();

  if (!text) return null;
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

// Blogger 이미지 URL 끝에 붙는 =s72-c 같은 축소 사이즈 파라미터를 더 큰 사이즈로 교체한다.
function upsizeBloggerImage(url: string, size = 600): string {
  const match = url.match(/=s(\d+)(-c)?$/i);
  if (match && Number(match[1]) < size) {
    return url.replace(/=s\d+(-c)?$/i, `=s${size}`);
  }
  return url;
}

function extractThumbnailUrl(contentHtml: string): string | null {
  const match = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return null;
  return upsizeBloggerImage(match[1]);
}

// Blogger의 기본 Atom 피드를 가벼운 정규식 파서로 처리한다 (별도 XML 파서 의존성 없이).
function parseFeed(xml: string, limit: number): FranviaPost[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const posts: FranviaPost[] = [];

  for (const entry of entries.slice(0, limit)) {
    const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);
    const contentMatch = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/);
    const linkMatch = entry.match(
      /<link\s+rel=(['"])alternate\1[^>]*href=(['"])([^'"]*)\2/,
    );

    if (!titleMatch || !publishedMatch || !linkMatch) {
      continue;
    }

    const decodedContent = contentMatch
      ? decodeEntities(contentMatch[1])
      : null;

    posts.push({
      title: decodeEntities(titleMatch[1].trim()),
      publishedAt: publishedMatch[1].trim(),
      url: linkMatch[3],
      summary: decodedContent ? extractSummary(decodedContent) : null,
      thumbnailUrl: decodedContent ? extractThumbnailUrl(decodedContent) : null,
    });
  }

  return posts;
}

async function getLatestFranviaPosts(): Promise<FranviaPost[]> {
  try {
    const res = await fetch(
      "https://www.franvia.com/feeds/posts/default?max-results=6",
    );

    if (!res.ok) {
      return [];
    }

    const xml = await res.text();
    return parseFeed(xml, 6);
  } catch {
    return [];
  }
}

export default async function FranviaEditorial() {
  const posts = await getLatestFranviaPosts();

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 pb-16">
      <h2 className="text-xl font-bold tracking-tight text-zinc-900">
        More from Franvia
      </h2>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.url}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300"
            >
              <div className="relative aspect-video w-full bg-zinc-100">
                {post.thumbnailUrl && (
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.title}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-zinc-400">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-1 text-base font-semibold text-zinc-900">
                  {post.title}
                </p>
                {post.summary && (
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                    {post.summary}
                  </p>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
