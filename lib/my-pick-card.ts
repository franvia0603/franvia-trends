export async function fetchCardImageBlob(imageUrl: string): Promise<Blob> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error("Failed to generate card image");
  }
  return res.blob();
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function downloadCardImage(
  imageUrl: string,
  filename: string,
): Promise<void> {
  const blob = await fetchCardImageBlob(imageUrl);
  triggerBlobDownload(blob, filename);
}
