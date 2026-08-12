import { beginLogin, errorResponse } from '../../../lib/admin/auth.js';

export const prerender = false;

export async function GET(context) {
  try {
    const returnTo = new URL(context.request.url).searchParams.get('returnTo') || '/admin';
    return context.redirect(await beginLogin(context, returnTo), 302);
  } catch (err) {
    return errorResponse(err);
  }
}
