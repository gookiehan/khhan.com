/**
 * /admin 인증 — GitHub OAuth (authorization code flow).
 *
 * 왜 이 방식인가:
 * 원래는 Cloudflare Access 로 문을 지키려 했으나, Zero Trust 는 Free 플랜이라도
 * 결제수단 등록을 요구한다. 그래서 Worker 안에서 직접 구현한다. 정적 사이트였다면
 * client_secret 을 숨길 곳이 없어 불가능했지만, 지금은 Worker 가 서버이므로
 * code↔token 교환을 서버측에서 완결할 수 있다.
 *
 * GitHub 을 고른 이유: /admin 이 하는 일이 gookiehan/khhan.com 에 커밋하는 것이므로
 * "이 저장소를 다룰 자격이 있는 계정인가" 로 문을 지키는 게 의미상 정확하다.
 *
 * ★ requireSession() 은 GITHUB_TOKEN 을 지키는 유일한 관문이다.
 *   /admin/api/* 의 모든 핸들러가 첫 줄에서 이걸 호출해야 한다.
 */
import { SignJWT, jwtVerify } from 'jose';
// Astro v6 에서 Astro.locals.runtime.env 가 제거되어 이 모듈로 바뀌었다.
// vars / secrets / 바인딩이 모두 여기로 들어온다.
import { env } from 'cloudflare:workers';

const SESSION_COOKIE = '__Secure-khhan_admin';
const STATE_COOKIE = '__Secure-khhan_oauth_state';
const SESSION_TTL = 60 * 60 * 24; // 24시간
const STATE_TTL = 60 * 10; // 10분 — 로그인 왕복에만 쓰인다

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token';
const GITHUB_USER = 'https://api.github.com/user';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export { env };

function signingKey(env) {
  if (!env.SESSION_SECRET) {
    throw new HttpError(503, 'SESSION_SECRET 이 설정되지 않았습니다.');
  }
  return new TextEncoder().encode(env.SESSION_SECRET);
}

function allowedLogins(env) {
  return String(env.ADMIN_ALLOWED_LOGINS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * 로컬 개발 우회. 프로덕션에서 켜지지 않도록 두 조건을 모두 요구한다:
 * import.meta.env.DEV 가 true 이고(=astro dev), .dev.vars 에 플래그가 있을 것.
 * 빌드된 Worker 에서는 import.meta.env.DEV 가 false 로 인라인되므로 죽은 코드가 된다.
 */
function devBypass(env) {
  return import.meta.env.DEV && env.ADMIN_DEV_BYPASS === '1';
}

const COOKIE_BASE = {
  path: '/admin',
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
};

/**
 * 세션이 있으면 { login } 을 돌려주고, 없으면 던진다.
 * API 라우트는 이 예외를 401 로 변환하고, 페이지는 로그인으로 리디렉트한다.
 */
export async function requireSession({ cookies }) {
  // env 는 모듈 스코프(cloudflare:workers)에서 온다.
  if (devBypass(env)) return { login: 'dev-bypass', dev: true };

  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new HttpError(401, '로그인이 필요합니다.');

  let payload;
  try {
    ({ payload } = await jwtVerify(token, signingKey(env), {
      issuer: 'khhan-admin',
      audience: 'khhan-admin',
    }));
  } catch {
    throw new HttpError(401, '세션이 만료되었거나 유효하지 않습니다.');
  }

  // 쿠키 발급 이후 allow-list 가 좁아졌을 수 있으므로 매 요청 다시 대조한다.
  const login = String(payload.login || '').toLowerCase();
  if (!allowedLogins(env).includes(login)) {
    throw new HttpError(403, `허용되지 않은 계정입니다: ${payload.login}`);
  }
  return { login: payload.login };
}

/**
 * 변형 요청(POST 등)에 대한 CSRF 방어.
 * SameSite=Lax 가 이미 대부분을 막지만, Origin 대조를 한 겹 더 둔다.
 */
export function requireSameOrigin(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return;
  const origin = request.headers.get('Origin');
  if (!origin) throw new HttpError(403, 'Origin 헤더가 없습니다.');
  if (new URL(origin).origin !== new URL(request.url).origin) {
    throw new HttpError(403, `교차 출처 요청이 거부되었습니다: ${origin}`);
  }
}

function redirectUri(request) {
  return new URL('/admin/auth/callback', request.url).toString();
}

/** 로그인 시작 — state 를 서명 쿠키에 심고 GitHub 으로 보낸다. */
export async function beginLogin({ request, cookies }, returnTo = "/admin") {
  // env 는 모듈 스코프(cloudflare:workers)에서 온다.
  if (!env.GITHUB_OAUTH_CLIENT_ID) {
    throw new HttpError(503, 'GITHUB_OAUTH_CLIENT_ID 가 설정되지 않았습니다.');
  }

  const nonce = crypto.randomUUID();
  const stateToken = await new SignJWT({ nonce, returnTo })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL}s`)
    .setIssuer('khhan-admin')
    .setAudience('khhan-admin-state')
    .sign(signingKey(env));

  cookies.set(STATE_COOKIE, stateToken, { ...COOKIE_BASE, maxAge: STATE_TTL });

  const url = new URL(GITHUB_AUTHORIZE);
  url.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri(request));
  // scope 를 비워 최소 권한으로 받는다. /user 의 공개 프로필(login)만 있으면 된다.
  url.searchParams.set('scope', '');
  url.searchParams.set('state', nonce);
  url.searchParams.set('allow_signup', 'false');
  return url.toString();
}

/** 콜백 처리 — state 대조 → code 교환 → 계정 확인 → 세션 발급. 돌아갈 경로를 반환. */
export async function completeLogin({ request, cookies }) {
  // env 는 모듈 스코프(cloudflare:workers)에서 온다.
  const params = new URL(request.url).searchParams;

  const error = params.get('error');
  if (error) {
    throw new HttpError(400, `GitHub 인증이 거부되었습니다: ${params.get('error_description') || error}`);
  }

  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) throw new HttpError(400, 'code 또는 state 가 없습니다.');

  const stateToken = cookies.get(STATE_COOKIE)?.value;
  if (!stateToken) throw new HttpError(400, 'state 쿠키가 없습니다. 로그인을 다시 시작하세요.');
  cookies.delete(STATE_COOKIE, { path: COOKIE_BASE.path });

  let statePayload;
  try {
    ({ payload: statePayload } = await jwtVerify(stateToken, signingKey(env), {
      issuer: 'khhan-admin',
      audience: 'khhan-admin-state',
    }));
  } catch {
    throw new HttpError(400, 'state 가 만료되었거나 위조되었습니다.');
  }
  if (statePayload.nonce !== state) {
    throw new HttpError(400, 'state 가 일치하지 않습니다.');
  }

  // code → access token (서버측, client_secret 사용)
  const tokenRes = await fetch(GITHUB_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      code,
      redirect_uri: redirectUri(request),
    }),
  });
  if (!tokenRes.ok) {
    throw new HttpError(502, `GitHub 토큰 교환 실패 (${tokenRes.status})`);
  }
  const tokenJson = await tokenRes.json();
  if (tokenJson.error || !tokenJson.access_token) {
    throw new HttpError(502, `GitHub 토큰 교환 실패: ${tokenJson.error_description || tokenJson.error}`);
  }

  // 누구인지 확인 (User-Agent 없으면 GitHub 이 403 을 준다)
  const userRes = await fetch(GITHUB_USER, {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'khhan-admin',
    },
  });
  if (!userRes.ok) throw new HttpError(502, `GitHub 사용자 조회 실패 (${userRes.status})`);
  const user = await userRes.json();

  const login = String(user.login || '');
  if (!allowedLogins(env).includes(login.toLowerCase())) {
    throw new HttpError(403, `허용되지 않은 계정입니다: ${login}`);
  }

  const session = await new SignJWT({ login })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .setIssuer('khhan-admin')
    .setAudience('khhan-admin')
    .sign(signingKey(env));

  cookies.set(SESSION_COOKIE, session, { ...COOKIE_BASE, maxAge: SESSION_TTL });

  // 오픈 리디렉트 방지 — 우리 사이트의 /admin 이하 경로만 허용한다.
  const returnTo = String(statePayload.returnTo || '/admin');
  return returnTo.startsWith('/admin') && !returnTo.startsWith('//') ? returnTo : '/admin';
}

export function clearSession({ cookies }) {
  cookies.delete(SESSION_COOKIE, { path: COOKIE_BASE.path });
}

/** HttpError 를 JSON 응답으로. API 라우트의 catch 에서 쓴다. */
export function errorResponse(err) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : '서버 오류가 발생했습니다.';
  if (status >= 500) console.error('[admin]', err);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
