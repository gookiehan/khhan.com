/**
 * 테마 id → 그 테마가 만드는 페이지들.
 *
 * 테마마다 페이지 구성이 달라도 된다(한 페이지짜리, 여러 페이지짜리).
 * slug 는 사이트 루트 기준 경로이고 '' 는 첫 페이지다.
 *
 * 빌드 결과:
 *   - site.yml 이 고른 테마 → khhan.com/<slug>
 *   - 모든 테마            → khhan.com/preview/<id>/<slug>  (noindex)
 */
import { THEMES } from './registry.mjs';
import { getSiteConfig } from '../lib/content.js';
import ClassicHome from './classic/Home.astro';
import PaperHome from './paper/Home.astro';

const PAGES = {
  classic: [{ slug: '', component: ClassicHome }],
  paper: [{ slug: '', component: PaperHome }],
};

/** 미리보기 경로의 접두사. 공개 페이지 slug 가 이것으로 시작하면 안 된다. */
export const PREVIEW_PREFIX = 'preview';

export function getPageComponent(themeId, slug) {
  const page = PAGES[themeId]?.find((p) => p.slug === slug);
  if (!page) throw new Error(`[themes] ${themeId} 테마에 "${slug}" 페이지가 없습니다.`);
  return page.component;
}

/** [...slug].astro 의 getStaticPaths 가 쓰는 경로 목록 */
export function buildThemeRoutes() {
  const active = getSiteConfig().theme;
  const routes = [];
  for (const { id } of THEMES) {
    const pages = PAGES[id];
    if (!pages?.length) throw new Error(`[themes] ${id} 테마의 페이지 목록이 없습니다(src/themes/index.js).`);
    for (const { slug } of pages) {
      if (slug === PREVIEW_PREFIX || slug.startsWith(`${PREVIEW_PREFIX}/`)) {
        throw new Error(`[themes] ${id} 테마의 "${slug}" 는 미리보기 경로와 겹칩니다.`);
      }
      if (id === active) {
        routes.push({ params: { slug: slug || undefined }, props: { themeId: id, slug, preview: false } });
      }
      routes.push({
        params: { slug: [PREVIEW_PREFIX, id, slug].filter(Boolean).join('/') },
        props: { themeId: id, slug, preview: true },
      });
    }
  }
  return routes;
}
