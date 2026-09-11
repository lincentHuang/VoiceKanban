import { NextRequest, NextResponse } from "next/server";
import { LinkPlatform } from "@/core/types/task";
import { LinkPreview } from "@/features/bookmarks/types";
import { detectPlatform, getYouTubeVideoId, normalizeSharedUrl } from "@/features/bookmarks/utils/linkParser";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 6000;
const MAX_HTML_BYTES = 800_000;
// The full video description sits ~1.2MB into a YouTube watch page
const YOUTUBE_MAX_HTML_BYTES = 2_500_000;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_REDIRECTS = 3;
// Meta serves Open Graph tags to its own link-preview crawler even for login-walled IG/Threads pages
const CRAWLER_UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

/**
 * Rejects non-http(s) URLs and obvious private/loopback hosts so this route can't be used to
 * probe the server's internal network. (Hostnames that *resolve* to private IPs aren't checked.)
 */
function isPublicHttpUrl(url: URL): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  if (!host || host === "localhost" || /\.(localhost|local|internal)$/.test(host) || host.startsWith("[")) {
    return false;
  }
  const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return false;
    }
  }
  return true;
}

/** Follows redirects manually so every hop is re-validated against isPublicHttpUrl. */
async function fetchPublic(target: URL): Promise<{ res: Response; finalUrl: URL } | null> {
  let current = target;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!isPublicHttpUrl(current)) return null;
    const res = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": CRAWLER_UA,
        Accept: "text/html,application/xhtml+xml",
        // English keeps IG/Threads og:title in the `X on Instagram: "…"` shape shapePreview parses
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return null;
      current = new URL(location, current);
      continue;
    }
    return { res, finalUrl: current };
  }
  return null;
}

async function readLimitedText(res: Response, maxBytes = MAX_HTML_BYTES): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  reader.cancel().catch(() => {});
  return new TextDecoder("utf-8").decode(Buffer.concat(chunks));
}

function decodeEntities(text: string): string {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

function readAttr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
  return match ? (match[1] ?? match[2]) : null;
}

function parseMetaTags(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const [tag] of html.matchAll(/<meta\s[^>]*>/gi)) {
    const key = readAttr(tag, "property") || readAttr(tag, "name");
    const content = readAttr(tag, "content");
    if (key && content && !(key.toLowerCase() in meta)) {
      meta[key.toLowerCase()] = decodeEntities(content).trim();
    }
  }
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (title && !meta.title) meta.title = decodeEntities(title[1]).trim();
  return meta;
}

function shapePreview(platform: LinkPlatform, meta: Record<string, string>, baseUrl: URL): LinkPreview {
  const ogTitle = meta["og:title"] || meta["twitter:title"] || meta.title || null;
  const ogDescription = meta["og:description"] || meta["twitter:description"] || meta.description || null;
  const rawImage = meta["og:image"] || meta["twitter:image"] || null;
  let thumbnailUrl: string | null = null;
  try {
    thumbnailUrl = rawImage ? new URL(rawImage, baseUrl).toString() : null;
  } catch {}

  // Profile pages title as `Name (@handle) • …`, posts as `Name (@handle) on Threads`
  const handleAuthor = ogTitle?.match(/^(.*?\(@[\w.]+\))/)?.[1]?.trim() || null;

  if (platform === "instagram") {
    // og:title: `Name on Instagram: "caption"`; og:description: `12 likes, 3 comments - user on June 1, 2025: "caption"`
    const titleMatch = ogTitle?.match(/^(.*?) on Instagram:\s*["“]([\s\S]*)["”]\s*$/);
    const descMatch = ogDescription?.match(/-\s*(\S+) on [^:]+:\s*["“]([\s\S]*?)["”]\.?\s*$/);
    return {
      title: titleMatch?.[2]?.trim() || descMatch?.[2]?.trim() || ogTitle,
      description: titleMatch?.[2]?.trim() || descMatch?.[2]?.trim() || ogDescription,
      thumbnailUrl,
      author: titleMatch?.[1]?.trim() || descMatch?.[1] || handleAuthor,
      siteName: "Instagram",
    };
  }

  if (platform === "threads") {
    // og:description holds the post text
    const author = ogTitle?.match(/^(.*?)\s+on Threads$/i)?.[1]?.trim() || handleAuthor;
    return {
      title: ogDescription || ogTitle,
      description: ogDescription,
      thumbnailUrl,
      author,
      siteName: "Threads",
    };
  }

  return {
    title: ogTitle,
    description: ogDescription,
    thumbnailUrl,
    author: meta.author || null,
    siteName: meta["og:site_name"] || baseUrl.hostname.replace(/^www\./, ""),
  };
}

async function fetchYouTubeOEmbed(
  watchUrl: string
): Promise<{ title?: string; author_name?: string; thumbnail_url?: string } | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    );
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** oEmbed has no description; the full text is `shortDescription` in the watch page's player JSON. */
async function fetchYouTubeDescription(videoId: string): Promise<string | null> {
  try {
    const fetched = await fetchPublic(new URL(`https://www.youtube.com/watch?v=${videoId}`));
    if (!fetched || !fetched.res.ok) return null;
    const html = await readLimitedText(fetched.res, YOUTUBE_MAX_HTML_BYTES);
    const match = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
    if (match) {
      try {
        return JSON.parse(`"${match[1]}"`) || null;
      } catch {}
    }
    return parseMetaTags(html)["og:description"] || null;
  } catch {
    return null;
  }
}

async function fetchYouTubePreview(url: string): Promise<LinkPreview> {
  const videoId = getYouTubeVideoId(url);
  // i.ytimg.com thumbnails are stable, unlike the signed IG/Threads CDN URLs
  const stableThumb = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  const [oembed, description] = await Promise.all([
    fetchYouTubeOEmbed(watchUrl),
    videoId ? fetchYouTubeDescription(videoId) : Promise.resolve(null),
  ]);
  return {
    title: oembed?.title ?? null,
    description,
    thumbnailUrl: stableThumb || oembed?.thumbnail_url || null,
    author: oembed?.author_name ?? null,
    siteName: "YouTube",
  };
}

async function fetchOpenGraphPreview(target: URL, platform: LinkPlatform): Promise<LinkPreview | null> {
  const fetched = await fetchPublic(target);
  if (!fetched || !fetched.res.ok) return null;
  if (!(fetched.res.headers.get("content-type") || "").includes("html")) return null;
  const html = await readLimitedText(fetched.res);
  return shapePreview(platform, parseMetaTags(html), fetched.finalUrl);
}

/**
 * GET /api/link/preview?url=<shared link>
 * Best-effort title / thumbnail / author lookup for the 收藏 share sheet.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ success: false, error: "缺少 url 參數" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(normalizeSharedUrl(raw));
  } catch {
    return NextResponse.json({ success: false, error: "連結格式不正確" }, { status: 400 });
  }
  if (!isPublicHttpUrl(target)) {
    return NextResponse.json({ success: false, error: "不支援的連結" }, { status: 400 });
  }

  const platform = detectPlatform(target.toString());
  try {
    const preview =
      platform === "youtube"
        ? await fetchYouTubePreview(target.toString())
        : await fetchOpenGraphPreview(target, platform);

    if (!preview) {
      return NextResponse.json({ success: false, error: "無法取得連結預覽" }, { status: 502 });
    }
    if (preview.description && preview.description.length > MAX_DESCRIPTION_LENGTH) {
      preview.description = `${preview.description.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}…`;
    }
    return NextResponse.json(
      { success: true, preview },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
    );
  } catch (error: any) {
    console.warn("Link preview failed:", target.toString(), error?.message);
    return NextResponse.json({ success: false, error: "無法取得連結預覽" }, { status: 502 });
  }
}
