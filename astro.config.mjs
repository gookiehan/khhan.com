import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://khhan.com',

  // 기본은 정적. /admin/* 만 각 파일에서 `export const prerender = false` 로
  // SSR 을 opt-in 한다. 공개 페이지는 지금까지처럼 빌드 타임에 렌더된다.
  output: 'static',

  // @astrojs/cloudflare 는 v12 로 고정한다.
  //   v12.6.13 → peer astro ^5.7.0, Cloudflare Pages Functions 타깃
  //   v13+     → peer astro ^6/^7, Pages 미지원(Workers 전용)
  // Astro 를 6/7 로 올릴 때 Workers static assets 로 함께 이전해야 한다.
  // _routes.json 은 public/_routes.json 으로 직접 관리한다.
  // 어댑터가 자동 생성하면 include:["/*"] + 정적 파일 전수 exclude 형태가 되는데,
  // Cloudflare 의 100개 한도에 걸려 목록이 잘리고(자산 118개) 남은 자산 요청이
  // Worker 로 샌다. 어댑터는 dist/_routes.json 이 이미 있으면 생성을 건너뛴다.
  // ★ SSR 라우트를 추가하면 public/_routes.json 의 include 도 함께 갱신할 것.
  adapter: cloudflare({
    // Cloudflare Images 를 쓰지 않으므로 이미지 최적화는 통과시킨다.
    imageService: 'passthrough',
    // astro dev 에서 .dev.vars 와 바인딩을 실제처럼 쓰기 위해.
    platformProxy: { enabled: true },
  }),
});
