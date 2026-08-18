"use client";

import { useEffect, useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

const ICON_SIZE = 20;
const ICON_BUTTON_CLASS =
  "flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white transition-colors hover:bg-amber-400 hover:text-zinc-900";

function BrandLinkButton({
  href,
  label,
  initial,
}: {
  href: string;
  label: string;
  initial: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={ICON_BUTTON_CLASS}
    >
      {initial}
    </a>
  );
}

export default function ShareButtons({
  url,
  title,
  description,
}: ShareButtonsProps) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const detect = () =>
      setCanNativeShare(
        typeof navigator !== "undefined" && typeof navigator.share === "function",
      );
    detect();
  }, []);

  async function handleNativeShare() {
    try {
      await navigator.share({ title, text: description, url });
    } catch {
      // 사용자가 공유 시트를 취소한 경우 등은 무시
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없는 환경 등은 무시
    }
  }

  function handleKakaoShare() {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!window.Kakao || !kakaoKey) return;

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl: "",
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
    });
  }

  if (canNativeShare) {
    return (
      <button
        type="button"
        onClick={handleNativeShare}
        aria-label="공유하기"
        className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400 hover:text-zinc-900"
      >
        <Share2 size={ICON_SIZE} />
        공유하기
      </button>
    );
  }

  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <BrandLinkButton
        href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        label="X(트위터)에 공유하기"
        initial="X"
      />
      <BrandLinkButton
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        label="Facebook에 공유하기"
        initial="f"
      />
      {kakaoKey && (
        <button
          type="button"
          onClick={handleKakaoShare}
          aria-label="카카오톡으로 공유하기"
          className={ICON_BUTTON_CLASS}
        >
          K
        </button>
      )}
      <BrandLinkButton
        href={`https://line.me/R/msg/text/?${encodeURIComponent(`${title} ${url}`)}`}
        label="LINE으로 공유하기"
        initial="L"
      />
      <BrandLinkButton
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        label="WhatsApp으로 공유하기"
        initial="W"
      />
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={copied ? "링크가 복사됨" : "링크 복사"}
        className={ICON_BUTTON_CLASS}
      >
        {copied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
      </button>
    </div>
  );
}
