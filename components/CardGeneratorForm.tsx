"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Copy, Check } from "lucide-react";
import { downloadCardImage } from "@/lib/my-pick-card";
import { buildUtmUrl } from "@/lib/utm";

type SiteLabel = "franvia.com" | "trend.franvia.com";
type Platform = "Instagram" | "Pinterest" | "Facebook";

interface FormValues {
  title: string;
  subtitle: string;
  imageUrl: string;
  badgeText: string;
  siteLabel: SiteLabel;
  articleUrl: string;
  platform: Platform;
  caption: string;
}

const DEFAULT_VALUES: FormValues = {
  title: "",
  subtitle: "",
  imageUrl: "",
  badgeText: "FRANVIA PICK",
  siteLabel: "franvia.com",
  articleUrl: "",
  platform: "Instagram",
  caption: "",
};

const PLATFORMS: Platform[] = ["Instagram", "Pinterest", "Facebook"];

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-amber-400";

const COPY_BUTTON_CLASS =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50";

function slugifyForFilename(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return slug || "card";
}

function buildCardUrl(values: FormValues): string {
  const params = new URLSearchParams({
    title: values.title,
    subtitle: values.subtitle,
    imageUrl: values.imageUrl,
    badgeText: values.badgeText,
    siteLabel: values.siteLabel,
  });
  return `/api/my-pick-card?${params.toString()}`;
}

function buildShareUrl(articleUrl: string, platform: Platform): string {
  return buildUtmUrl(articleUrl, platform.toLowerCase(), "manual", "my_pick_card");
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없는 환경 등은 무시
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      aria-label="Copy"
      className={COPY_BUTTON_CLASS}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function CardGeneratorForm() {
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES);
  const [previewValues, setPreviewValues] = useState<FormValues>(DEFAULT_VALUES);
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);

  const hasRequiredFields = values.title.trim() !== "" && values.imageUrl.trim() !== "";
  const previewReady =
    previewValues.title.trim() !== "" && previewValues.imageUrl.trim() !== "";
  const shareUrl = buildShareUrl(values.articleUrl, values.platform);

  // 입력할 때마다 바로 요청을 보내지 않고, 타이핑이 잠시 멈췄을 때만
  // 미리보기를 갱신해 /api/my-pick-card 호출 횟수를 줄인다.
  useEffect(() => {
    const timer = setTimeout(() => {
      setImageReady(false);
      setImageError(false);
      setPreviewValues(values);
    }, 400);
    return () => clearTimeout(timer);
  }, [values]);

  // articleUrl 입력이 잠시 멈추면 franvia.com 계열 페이지의 메타
  // 디스크립션을 가져와 caption을 자동으로 채운다. caption을 이미
  // 직접 입력한 경우에는 덮어쓰지 않는다.
  useEffect(() => {
    const articleUrl = values.articleUrl.trim();
    if (!articleUrl) {
      const reset = () => setCaptionLoading(false);
      reset();
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setCaptionLoading(true);
      try {
        const res = await fetch(
          `/api/extract-description?url=${encodeURIComponent(articleUrl)}`,
        );
        const data: { description?: string | null } = await res.json();
        if (!cancelled && data.description) {
          setValues((prev) =>
            prev.caption.trim() === ""
              ? { ...prev, caption: data.description as string }
              : prev,
          );
        }
      } catch {
        // franvia.com 계열이 아니거나 fetch 실패 시 조용히 무시하고
        // 사용자가 caption을 직접 입력하도록 둔다.
      } finally {
        if (!cancelled) setCaptionLoading(false);
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [values.articleUrl]);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDownload() {
    if (!previewReady) return;
    setDownloading(true);
    try {
      const filename = `franvia-${slugifyForFilename(previewValues.title)}.png`;
      await downloadCardImage(buildCardUrl(previewValues), filename);
    } catch {
      // 다운로드 실패는 조용히 무시하고 버튼 상태만 원복한다
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mt-10 grid gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <label className="block text-sm font-medium text-zinc-300">
          Title *
          <input
            type="text"
            value={values.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Kimchi Fried Rice"
            className={INPUT_CLASS}
          />
        </label>

        <label className="block text-sm font-medium text-zinc-300">
          Subtitle / category
          <input
            type="text"
            value={values.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder="e.g. K-Food · Recipe"
            className={INPUT_CLASS}
          />
        </label>

        <label className="block text-sm font-medium text-zinc-300">
          Image URL *
          <input
            type="url"
            value={values.imageUrl}
            onChange={(e) => updateField("imageUrl", e.target.value)}
            placeholder="https://..."
            className={INPUT_CLASS}
          />
        </label>

        <label className="block text-sm font-medium text-zinc-300">
          Badge text
          <input
            type="text"
            value={values.badgeText}
            onChange={(e) => updateField("badgeText", e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-zinc-300">
            Site label
          </legend>
          <div className="mt-1 flex gap-4">
            {(["franvia.com", "trend.franvia.com"] as const).map((option) => (
              <label
                key={option}
                className="flex items-center gap-1.5 text-sm text-zinc-300"
              >
                <input
                  type="radio"
                  name="siteLabel"
                  value={option}
                  checked={values.siteLabel === option}
                  onChange={() => updateField("siteLabel", option)}
                  className="accent-amber-400"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-zinc-300">
          Article URL
          <input
            type="url"
            value={values.articleUrl}
            onChange={(e) => updateField("articleUrl", e.target.value)}
            placeholder="https://www.franvia.com/..."
            className={INPUT_CLASS}
          />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-zinc-300">
            Platform
          </legend>
          <div className="mt-1 flex gap-4">
            {PLATFORMS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-1.5 text-sm text-zinc-300"
              >
                <input
                  type="radio"
                  name="platform"
                  value={option}
                  checked={values.platform === option}
                  onChange={() => updateField("platform", option)}
                  className="accent-amber-400"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-zinc-300">
          Caption
          <textarea
            value={values.caption}
            onChange={(e) => updateField("caption", e.target.value)}
            placeholder="Enter the caption for your post"
            rows={4}
            className={`${INPUT_CLASS} resize-none`}
          />
          {captionLoading && (
            <span className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <Loader2 className="animate-spin" size={12} />
              Fetching description...
            </span>
          )}
        </label>

        {!hasRequiredFields && (
          <p className="text-sm text-zinc-500">
            Enter a Title and Image URL to enable preview and download.
          </p>
        )}
      </div>

      <div className="flex flex-col items-start">
        <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-zinc-800">
          {previewReady ? (
            <>
              {!imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={buildCardUrl(previewValues)}
                  src={buildCardUrl(previewValues)}
                  alt={`${previewValues.title} card preview`}
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
                    aria-label="Generating card"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-zinc-500">
              Enter a Title and Image URL to see the preview here.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!previewReady || downloading}
          aria-label="Download card"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Download size={16} />
          )}
          Download
        </button>

        <div className="mt-8 w-full">
          <p className="text-sm font-medium text-zinc-300">Share URL</p>
          {shareUrl ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 outline-none"
              />
              <CopyButton value={shareUrl} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">
              Enter an Article URL to generate a share link with UTM
              parameters here.
            </p>
          )}
        </div>

        <div className="mt-6 w-full">
          <p className="text-sm font-medium text-zinc-300">Caption</p>
          {values.caption ? (
            <div className="mt-1 flex items-start gap-2">
              <textarea
                readOnly
                value={values.caption}
                rows={4}
                className="min-w-0 flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 outline-none"
              />
              <CopyButton value={values.caption} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">
              Enter a caption to see it here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
