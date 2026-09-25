/**
 * 빌드 결과(dist/client) 점검. npm run build 다음에 실행한다(CI 포함).
 *
 *  - 필요한 페이지가 모두 만들어졌는가(공개 첫 페이지, 404, 테마별 미리보기)
 *  - khhan.com 첫 페이지가 site.yml 이 고른 테마인가, 검색 허용인가
 *  - 미리보기 페이지는 모두 검색 제외(noindex)인가
 *  - 페이지 안의 로컬 링크(/assets/…, /_astro/…)가 실제 파일을 가리키는가
 *  - 페이지 안 앵커(#id)의 대상이 있는가
 *  - 위험한 링크(javascript:), 외부 스크립트, noopener 없는 새 창 링크가 없는가
 *  - "undefined" 같은 렌더링 사고 흔적이 없는가
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { THEME_IDS } from '../src/themes/registry.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist', 'client');
const errors = [];
const fail = (msg) => errors.push(msg);

const active = yaml.load(fs.readFileSync(path.join(root, 'src', 'data', 'site.yml'), 'utf8'))?.theme;

const pages = ['index.html', '404.html', 'preview/index.html', ...THEME_IDS.map((id) => `preview/${id}/index.html`)];

for (const rel of pages) {
  const file = path.join(dist, rel);
  if (!fs.existsSync(file)) {
    fail(`${rel}: 없음`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const noindex = /<meta name="robots" content="noindex/.test(html);

  if (rel === 'index.html') {
    if (noindex) fail('index.html: 공개 첫 페이지가 noindex 입니다');
    const theme = html.match(/<meta name="khhan-theme" content="([^"]+)"/)?.[1];
    if (theme !== active) fail(`index.html: 테마가 ${theme} 입니다(site.yml 은 ${active})`);
  } else if (rel.startsWith('preview/') && !noindex) {
    fail(`${rel}: 미리보기인데 noindex 가 없습니다`);
  }
  if (rel.startsWith('preview/') && rel !== 'preview/index.html') {
    const id = rel.split('/')[1];
    const theme = html.match(/<meta name="khhan-theme" content="([^"]+)"/)?.[1];
    if (theme !== id) fail(`${rel}: 테마 표시가 ${theme} 입니다`);
  }

  // 렌더링 사고 흔적(태그 밖 텍스트에서만 본다)
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  for (const bad of ['undefined', '[object Object]', 'NaN']) {
    if (new RegExp(`(^|[^A-Za-z])${bad.replace(/[[\]]/g, '\\$&')}([^A-Za-z]|$)`).test(text)) fail(`${rel}: 본문에 "${bad}"`);
  }

  // 링크 점검
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/<(a|link|img|script)\b([^>]*)>/g)) {
    const [tag, attrs] = [m[1], m[2]];
    const url = attrs.match(/\s(?:href|src)="([^"]*)"/)?.[1];
    if (tag === 'script' && url) fail(`${rel}: 외부 스크립트 ${url}`);
    if (url == null) continue;
    const u = url.replace(/&amp;/g, '&').trim();
    if (/^(javascript|vbscript|data):/i.test(u)) fail(`${rel}: 위험한 링크 ${u.slice(0, 60)}`);
    if (u.startsWith('#')) {
      if (u.length > 1 && !ids.has(decodeURIComponent(u.slice(1)))) fail(`${rel}: 대상 없는 앵커 ${u}`);
      continue;
    }
    if (u.startsWith('/') && !u.startsWith('//')) {
      const p = decodeURIComponent(u.split(/[?#]/)[0]);
      const target = path.join(dist, p);
      const ok = fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')));
      if (!ok) fail(`${rel}: 없는 파일을 가리킴 ${u}`);
    } else if (!/^(https?:|mailto:)/i.test(u)) {
      fail(`${rel}: 상대 경로 링크 ${u} (미리보기 경로에서 깨짐)`);
    }
    if (tag === 'a' && /\starget="_blank"/.test(attrs) && !/\srel="[^"]*noopener/.test(attrs)) {
      fail(`${rel}: noopener 없는 새 창 링크 ${u.slice(0, 60)}`);
    }
  }
}

// 새 테마는 이모지 아이콘을 보이지 않는다(데이터에는 남아 있음)
for (const id of THEME_IDS.filter((t) => t !== 'classic')) {
  const file = path.join(dist, 'preview', id, 'index.html');
  if (fs.existsSync(file) && /[📄🖼📰🎬🌐📦]/u.test(fs.readFileSync(file, 'utf8'))) {
    fail(`preview/${id}: 이모지 아이콘이 화면에 남아 있습니다`);
  }
}

if (errors.length) {
  console.error(`빌드 결과 점검 실패 (${errors.length}건):`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`OK — ${pages.length}개 페이지 점검 통과 (공개 테마: ${active})`);
