"use client";

import { useState } from "react";
import { Sparkles, Download, Share2, Loader2 } from "lucide-react";
import {
  fetchCardImageBlob,
  triggerBlobDownload,
  downloadCardImage,
} from "@/lib/my-pick-card";

interface MyPickCardButtonProps {
  slug: string;
  contentType: "movie" | "drama";
  title: string;
  rank: number;
  posterUrl?: string;
}

const SITE_LABEL = "trend.franvia.com";
const BUTTON_CLASS =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50";

export default function MyPickCardButton({
  slug,
  title,
  rank,
  posterUrl,
}: MyPickCardButtonProps) {
  const [open, setOpen] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const cardImageUrl = `/api/my-pick-card?${new URLSearchParams({
    title,
    rank: String(rank),
    posterUrl: posterUrl ?? "",
    siteLabel: SITE_LABEL,
  }).toString()}`;

  const filename = `franvia-my-pick-${slug}.png`;

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadCardImage(cardImageUrl, filename);
    } catch {
      // 다운로드 실패는 조용히 무시하고 버튼 상태만 원복한다
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    setSharing(true);
    try {
      const blob = await fetchCardImageBlob(cardImageUrl);
      const file = new File([blob], filename, { type: "image/png" });

      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: `${title} — My Pick` });
      } else {
        triggerBlobDownload(blob, filename);
      }
    } catch {
      // 사용자가 공유를 취소한 경우 등은 무시
    } finally {
      setSharing(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="My Pick 카드 만들기"
        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-400 hover:text-zinc-900"
      >
        <Sparkles size={18} />
        Create My Pick Card
      </button>
    );
  }

  return (
    <div className="mt-4 w-full max-w-xs">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-900">
        {!imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cardImageUrl}
            alt={`${title} My Pick card`}
            onLoad={() => setImageReady(true)}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-zinc-500">
            Failed to load card
          </div>
        )}
        {!imageReady && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
            <Loader2
              className="animate-spin text-amber-400"
              size={28}
              aria-label="카드 생성 중"
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          aria-label="My Pick 카드 다운로드"
          className={BUTTON_CLASS}
        >
          {downloading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Download size={16} />
          )}
          Download
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          aria-label="My Pick 카드 공유"
          className={BUTTON_CLASS}
        >
          {sharing ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Share2 size={16} />
          )}
          Share
        </button>
      </div>
    </div>
  );
}
