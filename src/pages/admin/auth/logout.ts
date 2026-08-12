import { clearSession, requireSameOrigin, errorResponse } from '../../../lib/admin/auth.js';

export const prerender = false;

// 로그아웃은 상태를 바꾸므로 POST 로만 받는다(링크 프리페치로 로그아웃되는 것 방지).
export async function POST(context) {
  try {
    requireSameOrigin(context.request);
    clearSession(context);
    return context.redirect('/admin', 302);
  } catch (err) {
    return errorResponse(err);
  }
}
