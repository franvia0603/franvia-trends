"use client";

import { useEffect, useState } from "react";
import { Playfair_Display } from "next/font/google";
import { ArrowRight } from "lucide-react";

// 이 배너에만 쓰는 헤드카피 폰트라, 전역 폰트(app/layout.tsx의 Geist)와
// 별개로 컴포넌트 범위에서 직접 로드한다.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
});

const TYPED_TEXT = "the real Korea, told from Korea.";

export default function FranviaBanner() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function step() {
      if (!deleting) {
        if (i <= TYPED_TEXT.length) {
          setTyped(TYPED_TEXT.slice(0, i));
          i++;
          timeoutId = setTimeout(step, 45);
        } else {
          deleting = true;
          timeoutId = setTimeout(step, 1800);
        }
      } else {
        if (i > 0) {
          i--;
          setTyped(TYPED_TEXT.slice(0, i));
          timeoutId = setTimeout(step, 25);
        } else {
          deleting = false;
          timeoutId = setTimeout(step, 500);
        }
      }
    }

    timeoutId = setTimeout(step, 400);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <a
      href="https://www.franvia.com?utm_source=trend_franvia&utm_medium=banner&utm_campaign=cross_promo"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Read Franvia — explore the Franvia K-Culture magazine"
      className="block rounded-lg border-[3px] border-amber-400 bg-[#0a0a0a] px-[22px] py-4 max-[420px]:px-4 max-[420px]:py-3.5 no-underline"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-[260px] flex-1">
          <span className="mb-1.5 block text-[10px] font-bold tracking-[0.12em] text-amber-400">
            FRANVIA · BEYOND K-VIBE
          </span>
          <p
            className={`${playfair.className} m-0 text-[17px] font-medium leading-[1.5] text-white max-[420px]:text-sm`}
          >
            From K-media and food to Hangeul and daily life —
          </p>
          <p
            className={`${playfair.className} m-0 min-h-[26px] text-[17px] font-medium leading-[1.5] text-amber-400 max-[420px]:text-sm`}
          >
            {typed}
            <span className="ml-0.5 inline-block h-4 w-[2px] animate-cta-cursor bg-amber-400 align-[-3px]" />
          </p>
        </div>
        <div className="animate-cta-blink inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-bold text-amber-400 max-[420px]:text-xs">
          Read Franvia
          <ArrowRight size={15} />
        </div>
      </div>
    </a>
  );
}
