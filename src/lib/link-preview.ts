export type LinkPreview = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};

const EMPTY_PREVIEW: LinkPreview = { title: null, description: null, imageUrl: null };
const MAX_BYTES = 500_000;
const FETCH_TIMEOUT_MS = 8000;

/** Fetches a URL and extracts Open Graph / basic HTML metadata for a link preview card. */
export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LRTCityTebetBot/1.0; +link-preview)" },
    });
    clearTimeout(timeout);

    if (!res.ok) return EMPTY_PREVIEW;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return EMPTY_PREVIEW;

    const html = await readBoundedText(res);

    const title = extractMeta(html, "og:title") ?? extractTag(html, "title");
    const description = extractMeta(html, "og:description") ?? extractMeta(html, "description");
    const rawImage = extractMeta(html, "og:image");

    return {
      title,
      description,
      imageUrl: rawImage ? resolveUrl(rawImage, url) : null,
    };
  } catch {
    return EMPTY_PREVIEW;
  }
}

async function readBoundedText(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return res.text();

  const decoder = new TextDecoder();
  let html = "";
  let bytes = 0;

  while (bytes < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    html += decoder.decode(value, { stream: true });
  }
  reader.cancel().catch(() => {});
  return html;
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function extractTag(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function resolveUrl(maybeRelative: string, base: string): string {
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}
