/**
 * 테마들이 같이 쓰는 표시용 도우미. Astro 에 의존하지 않아 node 테스트에서 바로 쓴다.
 * 데이터는 고치지 않고, 화면에 그릴 때의 모양만 정한다.
 */

/**
 * 데이터의 상대 경로(assets/…)를 사이트 루트 기준(/assets/…)으로 바꾼다.
 * /preview/<테마>/ 처럼 깊은 경로에서도 같은 파일을 가리키게 하려는 것이다.
 */
export function siteUrl(url) {
  if (typeof url !== 'string') return '';
  const u = url.trim();
  return u.startsWith('assets/') ? `/${u}` : u;
}

/**
 * href 에 넣어도 되는 URL 만 통과시킨다. 나머지(javascript: 등)는 null.
 * 관리 화면과 CI 가 이미 같은 규칙으로 막지만, 화면에서도 한 번 더 막는다.
 */
export function safeHref(url) {
  const u = siteUrl(url);
  if (!u) return null;
  if (u.startsWith('/assets/')) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (/^mailto:/i.test(u)) return u;
  return null;
}

/**
 * 날짜·기간 표기를 통일한다.
 *   "2018.07.~현재"      → "2018.07 – 현재"
 *   "2025. 9."           → "2025.09"
 *   "2018. 09. – 2021. 09." → "2018.09 – 2021.09"
 *   "2003.03.14."        → "2003.03.14"
 *   "2022.~현재"         → "2022 – 현재"
 * 모르는 형식은 앞뒤 공백만 정리해 그대로 둔다.
 */
export function formatPeriod(value) {
  if (value == null) return '';
  const text = String(value).trim();
  if (!text) return '';
  const parts = text.split(/\s*(?:~|–|—|-(?=\s))\s*/);
  return parts.map(formatDate).filter((p, i) => p || i === 0).join(' – ');
}

function formatDate(part) {
  const p = part.trim();
  const m = p.match(/^(\d{4})\.?(?:\s*(\d{1,2})\.?)?(?:\s*(\d{1,2})\.?)?$/);
  if (!m) return p;
  const [, y, mo, d] = m;
  let out = y;
  if (mo) out += `.${mo.padStart(2, '0')}`;
  if (d) out += `.${d.padStart(2, '0')}`;
  return out;
}

/** "현재" 로 끝나는 기간인가 */
export function isOngoing(value) {
  return typeof value === 'string' && /현재\s*$/.test(value.trim());
}

const ICON_KIND = {
  '📄': 'PDF',
  '🖼️': '이미지',
  '🖼': '이미지',
  '📰': '기사',
  '🎬': '영상',
  '🌐': '웹',
  '📦': '자료',
};

/**
 * 첨부 링크의 종류. 데이터의 이모지 아이콘은 그대로 두고 종류 판별에만 쓴다.
 * 아이콘이 없거나 모르는 것이면 URL 로 추정한다.
 */
export function linkKind(file) {
  const url = typeof file?.url === 'string' ? file.url.toLowerCase() : '';
  const byIcon = ICON_KIND[file?.icon?.trim?.()];
  if (byIcon === 'PDF' && /^https?:/.test(url) && !url.endsWith('.pdf')) return '문서';
  if (byIcon) return byIcon;
  if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) return '영상';
  if (url.endsWith('.pdf')) return 'PDF';
  if (/\.(jpe?g|png|gif|webp|bmp)$/.test(url)) return '이미지';
  if (/\.(zip|7z|rar)$/.test(url)) return '자료';
  return '링크';
}

/**
 * 첨부 목록 → 화면용 [{ href, kind, text }].
 * - href 가 안전하지 않은 항목은 버린다.
 * - 설명(tip)이 종류와 같거나 비어 있으면 종류만 보인다("PDF").
 * - 같은 글자가 여러 번 나오면 번호를 붙인다("YouTube 1", "YouTube 2").
 */
export function describeFiles(files) {
  if (!Array.isArray(files)) return [];
  const rows = [];
  for (const f of files) {
    const href = safeHref(f?.url);
    if (!href) continue;
    const kind = linkKind(f);
    const tip = stripKindWord(typeof f.tip === 'string' ? f.tip.trim() : '', kind);
    const same = !tip || tip.toLowerCase() === kind.toLowerCase();
    rows.push({ href, kind, text: same ? '' : tip });
  }
  const key = (r) => `${r.kind}|${r.text}`;
  const totals = new Map();
  for (const r of rows) totals.set(key(r), (totals.get(key(r)) ?? 0) + 1);
  const seen = new Map();
  for (const r of rows) {
    const k = key(r);
    if (totals.get(k) > 1) {
      const n = (seen.get(k) ?? 0) + 1;
      seen.set(k, n);
      r.text = r.text ? `${r.text} ${n}` : String(n);
    }
  }
  return rows;
}

/** 설명 앞뒤에 붙은 종류 단어를 뗀다: ("박사논문 PDF", "PDF") → "박사논문", ("한경 기사", "기사") → "한경" */
function stripKindWord(tip, kind) {
  if (!tip) return '';
  const esc = kind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const out = tip.replace(new RegExp(`^${esc}\\s+|\\s+${esc}$`, 'i'), '').trim();
  return out || tip;
}

/** "한국현 (Kuk-Hyun Han, Ph.D.)" → { primary: "한국현", secondary: "Kuk-Hyun Han, Ph.D." } */
export function splitName(name) {
  const text = String(name ?? '').trim();
  const m = text.match(/^(.+?)\s*\((.+)\)\s*$/);
  return m ? { primary: m[1], secondary: m[2] } : { primary: text, secondary: '' };
}

/** 태그를 걷어낸 평문(메타 설명 등에 쓴다) */
export function plainText(html) {
  return String(html ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 빈 줄로 나뉜 글을 문단 배열로 */
export function paragraphs(text) {
  return String(text ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s*\r?\n\s*/g, ' ').trim())
    .filter(Boolean);
}
