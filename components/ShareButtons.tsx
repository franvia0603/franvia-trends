"use client";

import { useEffect, useState } from "react";
import { Share2, Copy, Check, Mail } from "lucide-react";
import { SiX, SiFacebook, SiReddit, SiPinterest, SiWhatsapp } from "react-icons/si";
import type { IconType } from "react-icons";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

const ICON_SIZE = 20;
const ICON_BUTTON_CLASS =
  "flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white transition-colors hover:bg-amber-400 hover:text-zinc-900";

function BrandLinkButton({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: IconType;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center text-amber-400 transition-opacity hover:opacity-75"
    >
      <Icon size={ICON_SIZE} />
    </a>
  );
}

export default function ShareButtons({
  url,
  title,
  description,
  imageUrl,
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

  const mailtoHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description ?? ""}\n\n${url}`)}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <BrandLinkButton
        href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        label="X(트위터)에 공유하기"
        Icon={SiX}
      />
      <BrandLinkButton
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        label="Facebook에 공유하기"
        Icon={SiFacebook}
      />
      <BrandLinkButton
        href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
        label="Reddit에 공유하기"
        Icon={SiReddit}
      />
      {imageUrl && (
        <BrandLinkButton
          href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`}
          label="Pinterest에 저장하기"
          Icon={SiPinterest}
        />
      )}
      <BrandLinkButton
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        label="WhatsApp으로 공유하기"
        Icon={SiWhatsapp}
      />
      <a
        href={mailtoHref}
        aria-label="이메일로 공유하기"
        className={ICON_BUTTON_CLASS}
      >
        <Mail size={ICON_SIZE} />
      </a>
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
