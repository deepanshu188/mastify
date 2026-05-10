export type Segment =
  | { type: 'text'; content: string }
  | { type: 'hashtag'; content: string }
  | { type: 'mention'; content: string }
  | { type: 'link'; content: string; href: string };

export function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function stripTags(s: string, trim = true): string {
  const result = decodeEntities(
    s.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, ''),
  );
  return trim ? result.trim() : result;
}

export function parseContent(html: string): Segment[] {
  const segments: Segment[] = [];
  const linkRegex = /<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const before = stripTags(html.slice(lastIndex, match.index), false);
      if (before.trim()) {
        segments.push({ type: 'text', content: before });
      } else if (before.length > 0) {
        segments.push({ type: 'text', content: ' ' });
      }
    }

    const href = match[1];
    const inner = decodeEntities(match[2].replace(/<[^>]+>/g, '').trim());

    if (inner.startsWith('#')) {
      segments.push({ type: 'hashtag', content: inner });
    } else if (inner.startsWith('@')) {
      segments.push({ type: 'mention', content: inner });
    } else {
      segments.push({ type: 'link', content: inner || href, href });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    const tail = stripTags(html.slice(lastIndex), false);
    if (tail.trim()) segments.push({ type: 'text', content: tail });
  }

  return segments;
}
