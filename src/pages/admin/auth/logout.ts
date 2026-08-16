import { clearSession, requireSameOrigin, errorResponse } from '../../../lib/admin/auth.js';

export const prerender = false;

// 로그아웃은 상태를 바꾸므로 POST 로만 받는다(링크 프리페치로 로그아웃되는 것 방지).
export async function POST(context) {
  try {
    requireSameOrigin(context.request);
    clearSession(context);
    // /admin 으로 보내면 곧바로 재로그인되어 로그아웃이 안 된 것처럼 보인다.
    // 세션을 요구하지 않는 착지 페이지로 보낸다.
    return context.redirect('/admin/auth/logged-out', 302);
  } catch (err) {
    return errorResponse(err);
  }
}
