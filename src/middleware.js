/**
 * /admin/* 응답은 절대 캐시되지 않게 한다.
 *
 * 왜: 관리 화면과 그 API 는 세션에 따라 내용이 달라지므로 공유 캐시에 올라가면
 * 안 된다. 실제로 이 사이트에서 엣지가 /admin 의 404 를 물고 있어(대시보드가 만든
 * 빈 Worker 가 잠시 모든 경로에 404 를 주던 시기) 특정 지역에서만 접속이 안 되는
 * 일이 있었다. wrangler 의 run_worker_first 로 자산 라우터를 건너뛰게 했고,
 * 여기서 캐시 금지를 한 번 더 못 박는다.
 */
export async function onRequest(context, next) {
  const response = await next();
  if (!new URL(context.request.url).pathname.startsWith('/admin')) return response;

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
