import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const CARD_SIZE = { width: 1080, height: 1080 };

async function verifyImageUrl(url: string | null): Promise<string | null> {
  if (!url) return null;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return null;
    return url;
  } catch {
    return null;
  }
}

function ImageOrFallback({ imageUrl }: { imageUrl: string | null }) {
  // next/og(satori)는 flex:1 + width:100%만으로는 <img>의 cover 크기를
  // 정확히 계산하지 못해, 크기가 확정된 relative 컨테이너 안에 이미지를
  // absolute로 채우는 방식으로 우회한다.
  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        borderRadius: 6,
        backgroundColor: "#27272a",
        display: "flex",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
    </div>
  );
}

function CardLayout({
  title,
  subtitle,
  siteLabel,
  badgeText,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  siteLabel: string;
  badgeText: string;
  imageUrl: string | null;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        backgroundColor: "#0a0a0a",
        border: "3px solid #fbbf24",
        borderRadius: 8,
        padding: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          alignSelf: "flex-start",
          backgroundColor: "#fbbf24",
          color: "#412402",
          padding: "8px 20px",
          borderRadius: 4,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        {badgeText}
      </div>

      <ImageOrFallback imageUrl={imageUrl} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{ display: "flex", fontSize: 32, fontWeight: 500, color: "#ffffff" }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{ display: "flex", fontSize: 24, fontWeight: 600, color: "#fbbf24" }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 1,
            backgroundColor: "#27272a",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#ffffff",
            }}
          >
            FRANVIA
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#71717a" }}>
            {siteLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCard(
  title: string,
  subtitle: string,
  siteLabel: string,
  badgeText: string,
  imageUrl: string | null,
) {
  return new ImageResponse(
    (
      <CardLayout
        title={title}
        subtitle={subtitle}
        siteLabel={siteLabel}
        badgeText={badgeText}
        imageUrl={imageUrl}
      />
    ),
    CARD_SIZE,
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "Untitled";
  const badgeText = searchParams.get("badgeText") || "MY PICK";
  const siteLabel = searchParams.get("siteLabel") || "franvia.com";

  // subtitle/imageUrl이 새 파라미터명. rank/posterUrl은 movies·dramas
  // 상세페이지가 이미 쓰고 있던 구 파라미터라, 값이 오면 그대로 매핑해
  // 호출부를 건드리지 않고도 계속 동작하도록 하위 호환을 유지한다.
  const rawSubtitle = searchParams.get("subtitle");
  const rank = searchParams.get("rank");
  const subtitle = rawSubtitle ?? (rank ? `#${rank} this week` : "");

  const rawImageUrl = searchParams.get("imageUrl");
  const posterUrl = searchParams.get("posterUrl");
  const rawImage = rawImageUrl ?? posterUrl;

  // imageUrl이 실제로 유효한 이미지로 응답하는지 미리 확인해서, next/og
  // 렌더링 도중 원격 이미지 fetch가 실패해 500이 나는 상황을 피한다.
  const imageUrl = await verifyImageUrl(rawImage);

  try {
    return renderCard(title, subtitle, siteLabel, badgeText, imageUrl);
  } catch {
    try {
      return renderCard(title, subtitle, siteLabel, badgeText, null);
    } catch {
      return renderCard("Franvia K-Trend Chart", "", siteLabel, badgeText, null);
    }
  }
}
