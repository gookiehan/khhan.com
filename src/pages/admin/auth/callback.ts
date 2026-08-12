import { completeLogin, errorResponse } from '../../../lib/admin/auth.js';

export const prerender = false;

export async function GET(context) {
  try {
    return context.redirect(await completeLogin(context), 302);
  } catch (err) {
    return errorResponse(err);
  }
}
