/**
 * Worker 앞단 공통 처리.
 *
 * 1) workers.dev 로 들어온 공개 페이지 요청은 실제 사이트로 넘긴다.
 *    지금은 공개 사이트를 GitHub Pages(khhan.com)가, 관리 화면을 Cloudflare Worker
 *    가 맡는 이원 구조다. Worker 빌드에는 공개 페이지도 함께 들어 있어서 그대로
 *    두면 khhan.com 과 같은 내용이 workers.dev 에서도 열린다. 그 사본은
 *    wrangler deploy 를 할 때만 갱신되므로 실제 사이트와 어긋난다.
 *
 *    ★ 다만 이 분기만으로는 부족하다. wrangler 의 run_worker_first 가 /admin 만
 *      가리키므로, 정적 파일이 있는 경로(/, /style.css, /assets/**)는 자산 라우터가
 *      바로 응답하고 Worker 자체가 호출되지 않는다. 그쪽은 public/_headers 의
 *      noindex 로 막는다. 여기 분기는 Worker 까지 도달하는 나머지 경로용이다.
 *
 * 2) /admin/* 응답은 절대 캐시되지 않게 한다.
 *    세션에 따라 내용이 달라지므로 공유 캐시에 올라가면 안 된다. 실제로 엣지가
 *    /admin 의 404 를 물고 있어 특정 지역에서만 접속이 안 되는 일이 있었다.
 *    wrangler 의 run_worker_first 로 자산 라우터를 건너뛰게 했고, 여기서 캐시
 *    금지를 한 번 더 못 박는다.
 */
const PUBLIC_SITE = 'https://khhan.com';

export async function onRequest(context, next) {
  const url = new URL(context.request.url);
  const isAdmin = url.pathname === '/admin' || url.pathname.startsWith('/admin/');

  // workers.dev 로 들어온 공개 페이지 요청은 실제 사이트로 보낸다.
  if (!isAdmin && url.hostname.endsWith('.workers.dev')) {
    return Response.redirect(`${PUBLIC_SITE}${url.pathname}${url.search}`, 302);
  }

  const response = await next();
  if (!isAdmin) return response;

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  headers.set('Pragma', 'no-cache');
  // 검색엔진에 잡힐 이유가 없다.
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
