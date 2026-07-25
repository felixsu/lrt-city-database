export type LinkPreview = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  publishedAt: Date | null;
};

const EMPTY_PREVIEW: LinkPreview = {
  title: null,
  description: null,
  imageUrl: null,
  publishedAt: null,
};
const MAX_BYTES = 500_000;
const FETCH_TIMEOUT_MS = 8000;

/** Fetches a URL and extracts Open Graph / basic HTML metadata for a link preview card. */
export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    const preview = await fetchYouTubePreview(videoId);
    if (preview) return preview;
    // oEmbed failed (private/deleted video, network error, etc.) — fall through
    // to the generic scrape below as a last-resort fallback.
  }

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
      publishedAt: extractPublishedAt(html),
    };
  } catch {
    return EMPTY_PREVIEW;
  }
}

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

/** Extracts an 11-char YouTube video ID from watch/shorts/embed/youtu.be URLs, or null if not a YouTube video URL. */
function extractYouTubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (!YOUTUBE_HOSTS.has(parsed.hostname)) return null;

  let candidate: string | null = null;
  if (parsed.hostname === "youtu.be") {
    candidate = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (parsed.pathname === "/watch") {
    candidate = parsed.searchParams.get("v");
  } else {
    const match = parsed.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/);
    candidate = match ? match[1] : null;
  }

  return candidate && YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null;
}

/** Fetches title/thumbnail for a YouTube video via the official oEmbed endpoint. Returns null on any failure. */
async function fetchYouTubePreview(videoId: string): Promise<LinkPreview | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
    const res = await fetch(oembedUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();

    return {
      title: typeof data.title === "string" ? data.title : null,
      description: null,
      imageUrl: typeof data.thumbnail_url === "string" ? data.thumbnail_url : null,
      publishedAt: null,
    };
  } catch {
    return null;
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

function extractPublishedAt(html: string): Date | null {
  const raw =
    extractMeta(html, "article:published_time") ??
    html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1] ??
    null;
  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
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
