/**
 * Health Workforce News Digest — Vercel Edge Function
 *
 * GET /api/health-workforce/v1/digest
 *   ?tiers=1,2    (default: 1,2)
 *   &category=nursing
 *
 * Returns categorized, classified health workforce news from RSS feeds.
 */

export const config = { runtime: 'edge' };

import { ALL_FEEDS, feedsByTier, type FeedEntry, type Category } from './_feeds';
import { classify, type ThreatLevel } from './_classifier';

interface NewsItem {
  source: string;
  title: string;
  link: string;
  publishedAt: number;
  isAlert: boolean;
  threat: { level: ThreatLevel; category: string };
  feedCategory: Category;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const FEED_TIMEOUT = 6_000;
const DEADLINE = 25_000;
const CONCURRENCY = 15;
const ITEMS_PER_FEED = 8;

function extractTag(xml: string, tag: string): string {
  const cdata = xml.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i'));
  if (cdata) return cdata[1]!.trim();
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
  return plain ? plain[1]!.trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)) : '';
}

function parseItems(xml: string, feed: FeedEntry): NewsItem[] {
  const items: NewsItem[] = [];
  const isAtom = !/<item[\s>]/i.test(xml);
  const re = isAtom ? /<entry[\s>]([\s\S]*?)<\/entry>/gi : /<item[\s>]([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  let count = 0;
  while ((m = re.exec(xml)) && count < ITEMS_PER_FEED) {
    const block = m[1]!;
    const title = extractTag(block, 'title');
    if (!title) continue;
    const link = isAtom
      ? (block.match(/<link[^>]+href=["']([^"']+)["']/)?.[1] ?? '')
      : extractTag(block, 'link');
    const dateStr = isAtom
      ? (extractTag(block, 'published') || extractTag(block, 'updated'))
      : extractTag(block, 'pubDate');
    const d = dateStr ? new Date(dateStr) : new Date();
    const publishedAt = Number.isNaN(d.getTime()) ? Date.now() : d.getTime();
    const { level, category } = classify(title);
    items.push({
      source: feed.name,
      title,
      link,
      publishedAt,
      isAlert: level === 'CRITICAL' || level === 'HIGH',
      threat: { level, category },
      feedCategory: feed.category,
    });
    count++;
  }
  return items;
}

async function fetchFeed(feed: FeedEntry, signal: AbortSignal): Promise<NewsItem[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FEED_TIMEOUT);
  const onAbort = () => ctrl.abort();
  signal.addEventListener('abort', onAbort, { once: true });
  try {
    const resp = await fetch(feed.url, {
      headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
      signal: ctrl.signal,
    });
    if (!resp.ok) return [];
    return parseItems(await resp.text(), feed);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

export default async function handler(req: Request): Promise<Response> {
  const cors: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors });

  const url = new URL(req.url);
  const tierParam = url.searchParams.get('tiers') || '1,2';
  const tiers = tierParam.split(',').map(Number).filter(n => n >= 1 && n <= 3);
  const catFilter = url.searchParams.get('category') as Category | null;

  let feeds = tiers.length ? feedsByTier(...tiers) : ALL_FEEDS;
  if (catFilter) feeds = feeds.filter(f => f.category === catFilter);

  const deadline = new AbortController();
  const deadlineTimer = setTimeout(() => deadline.abort(), DEADLINE);

  const allItems: NewsItem[] = [];
  for (let i = 0; i < feeds.length; i += CONCURRENCY) {
    if (deadline.signal.aborted) break;
    const batch = feeds.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(f => fetchFeed(f, deadline.signal)));
    for (const r of results) {
      if (r.status === 'fulfilled') allItems.push(...r.value);
    }
  }
  clearTimeout(deadlineTimer);

  // Deduplicate by normalized title
  const seen = new Set<string>();
  const deduped = allItems.filter(item => {
    const key = item.title.toLowerCase().replace(/\s*[-–—|]\s*[^\s].{1,40}$/, '').replace(/[''"".,;:!?]/g, '').trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Group by feedCategory
  const categories: Record<string, { items: NewsItem[] }> = {};
  for (const item of deduped) {
    (categories[item.feedCategory] ??= { items: [] }).items.push(item);
  }
  // Sort each category: alerts first, then by publishedAt desc
  const levelOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  for (const bucket of Object.values(categories)) {
    bucket.items.sort((a, b) => (levelOrder[a.threat.level] ?? 4) - (levelOrder[b.threat.level] ?? 4) || b.publishedAt - a.publishedAt);
    bucket.items = bucket.items.slice(0, 30);
  }

  return Response.json(
    { categories, generatedAt: new Date().toISOString(), feedCount: feeds.length, articleCount: deduped.length },
    { headers: { ...cors, 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' } },
  );
}
