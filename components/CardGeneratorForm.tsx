"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { downloadCardImage } from "@/lib/my-pick-card";

type SiteLabel = "franvia.com" | "trend.franvia.com";

interface FormValues {
  title: string;
  subtitle: string;
  imageUrl: string;
  badgeText: string;
  siteLabel: SiteLabel;
}

const DEFAULT_VALUES: FormValues = {
  title: "",
  subtitle: "",
  imageUrl: "",
  badgeText: "FRANVIA PICK",
  siteLabel: "franvia.com",
};

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-amber-400";

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

export default function CardGeneratorForm() {
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES);
  const [previewValues, setPreviewValues] = useState<FormValues>(DEFAULT_VALUES);
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const hasRequiredFields = values.title.trim() !== "" && values.imageUrl.trim() !== "";
  const previewReady =
    previewValues.title.trim() !== "" && previewValues.imageUrl.trim() !== "";

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

        {!hasRequiredFields && (
          <p className="text-sm text-zinc-500">
            Title과 Image URL을 입력하면 미리보기와 다운로드가 활성화됩니다.
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
                    aria-label="카드 생성 중"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-zinc-500">
              Title과 Image URL을 입력하면 여기에 미리보기가 표시됩니다.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!previewReady || downloading}
          aria-label="카드 다운로드"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Download size={16} />
          )}
          Download
        </button>
      </div>
    </div>
  );
}
