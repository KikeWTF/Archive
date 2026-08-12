import { existsSync, statSync } from 'node:fs';
import type { APIContext } from 'astro';
import { allReferences, categoryLabel, type Reference } from '../lib/references';

const SITE = 'https://kike.wtf';
const BASE = '/archive';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function enclosureType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const types: Record<string, string> = {
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return types[ext] ?? 'application/octet-stream';
}

function enclosureLength(url: string): number {
  if (!url.startsWith('./')) return 0;
  const file = url.replace(/^\.\//, '');
  try {
    if (existsSync(file)) return statSync(file).size;
  } catch {
    // ignore
  }
  return 0;
}

export async function GET(context: APIContext): Promise<Response> {
  const site = context.site?.toString().replace(/\/$/, '') ?? SITE;
  const base = BASE.replace(/\/$/, '');
  const feedUrl = `${site}${base}/feed.xml`;

  const items = allReferences
    .map((ref: Reference) => {
      const link = ref.url ?? site;
      const description = Array.isArray(ref.description)
        ? ref.description.join('\n\n')
        : ref.description;
      const cover = `${site}${base}/covers/${ref.image}`;
      const enclosure = ref.archive
        ? `<enclosure url="${escapeXml(ref.archive)}" length="${enclosureLength(
            ref.archive
          )}" type="${enclosureType(ref.archive)}" />`
        : '';

      return `<item>
    <title>${escapeXml(ref.name)}</title>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="false">${escapeXml(ref.id)}</guid>
    <pubDate>${new Date(ref.date).toUTCString()}</pubDate>
    <description>${escapeXml(description)}</description>
    <category>${escapeXml(categoryLabel(ref.category))}</category>
    ${(ref.tags ?? []).map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n    ')}
    <media:thumbnail url="${escapeXml(cover)}" />
    ${enclosure}
  </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kike's Archive</title>
    <link>${site}${base}/</link>
    <description>Personal time machine compiling Kike Fontán's media appearances: talks, press, podcasts and projects.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
