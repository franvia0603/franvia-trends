"use client";

import { useEffect, useState } from "react";

interface KstParts {
  date: string;
  time: string;
}

// hour12: false를 en-US 로케일과 같이 쓰면 자정에 "24:00:00"이 나오는
// Intl 버그가 있어, 이를 피하기 위해 en-GB 로케일로 24시간 포맷을 만든다.
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  weekday: "short",
  month: "short",
  day: "numeric",
});

function getKstParts(): KstParts {
  const now = new Date();
  return {
    date: dateFormatter.format(now),
    time: timeFormatter.format(now),
  };
}

export default function LiveClock() {
  const [parts, setParts] = useState<KstParts | null>(null);

  useEffect(() => {
    const tick = () => setParts(getKstParts());
    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-[60] bg-zinc-700">
      <div className="mx-auto max-w-5xl px-6 py-1.5 text-left text-xs text-zinc-400">
        🕐 Seoul, Korea · {parts ? `${parts.date} · ` : ""}
        <span className="font-semibold text-amber-400">
          {parts ? `${parts.time} KST` : "--:--:--"}
        </span>
      </div>
    </div>
  );
}
