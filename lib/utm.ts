export function buildUtmUrl(
  baseUrl: string,
  source: string,
  medium: string,
  campaign: string,
): string {
  const trimmed = baseUrl.trim();
  if (!trimmed) return "";

  const separator = trimmed.includes("?") ? "&" : "?";
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
  });
  return `${trimmed}${separator}${params.toString()}`;
}
