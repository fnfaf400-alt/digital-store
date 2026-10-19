export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function createLicenseKey(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const chunk = (size: number) =>
    Array.from({ length: size }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${chunk(4)}-${chunk(4)}-${chunk(4)}-${chunk(4)}`;
}

export function createDownloadToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
