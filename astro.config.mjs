import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://khhan.com',

  // 기본은 정적. /admin/* 만 각 파일에서 `export const prerender = false` 로
  // SSR 을 opt-in 한다. 공개 페이지는 지금까지처럼 빌드 타임에 렌더된다.
  //
  // Cloudflare Workers 의 static assets 가 dist/ 파일 구조로 먼저 매칭하고,
  // 없으면 Worker 로 폴백한다. Pages 시절 필요했던 _routes.json 관리가 사라졌다.
  output: 'static',

  // ★ 'jsx'(Astro 7 기본값) 로 두지 말 것.
  // 실측 결과 인라인 요소 사이의 필요한 공백까지 지운다:
  //   상단 내비 "학력 경력 연구 QEA…" → "학력경력연구QEA…"
  //   "기업인 삼영기계" → "기업인삼영기계"
  // true 는 반대로 공백을 더하는 방향(블록 경계)이라 표시가 깨지지 않는다.
  compressHTML: true,

  adapter: cloudflare({
    // Cloudflare Images 를 쓰지 않으므로 이미지 최적화는 통과시킨다.
    imageService: 'passthrough',
    // astro dev 에서 .dev.vars 와 바인딩을 실제처럼 쓰기 위해.
    platformProxy: { enabled: true },
  }),
});
