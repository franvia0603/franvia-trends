interface TickerItem {
  rank: number;
  title: string;
}

interface TopTickerProps {
  movies: TickerItem[];
  dramas: TickerItem[];
}

function TickerColumn({
  emoji,
  label,
  items,
}: {
  emoji: string;
  label: string;
  items: TickerItem[];
}) {
  return (
    <div className="px-6 py-4">
      <p className="text-sm font-bold text-amber-400">
        {emoji} {label}
      </p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item.rank} className="truncate text-sm">
            <span className="font-bold text-amber-400">#{item.rank}</span>
            <span className="ml-1.5 font-normal text-white">
              {item.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TopTicker({ movies, dramas }: TopTickerProps) {
  return (
    <div className="bg-zinc-800">
      <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-zinc-700 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <TickerColumn emoji="🎬" label="Movies" items={movies} />
        <TickerColumn emoji="📺" label="K-Drama" items={dramas} />
      </div>
    </div>
  );
}
