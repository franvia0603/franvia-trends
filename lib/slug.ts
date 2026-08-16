export function generateSlug(
  title: string,
  dateStr?: string,
  fallbackId?: string,
): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  // 제목이 슬러그화할 수 없는 문자뿐이면(예: 한글만 있는 경우) fallbackId를 그대로 쓰고,
  // 이미 날짜 정보를 담고 있는 fallbackId에는 연도를 다시 덧붙이지 않는다.
  if (!base) {
    return fallbackId ?? "";
  }

  const year = dateStr?.match(/^\d{4}/)?.[0];
  return year ? `${base}-${year}` : base;
}
