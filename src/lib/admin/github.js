/**
 * GitHub REST 클라이언트 (Worker 런타임용, fetch 기반).
 *
 * khhan-admin/app/github_client.py 를 대체한다. 다만 게시 방식이 달라졌다:
 * 구 앱은 파일마다 PUT /contents 를 호출해 커밋을 N개 만들었지만, 여기서는
 * Git Data API(blob → tree → commit → ref)로 **한 커밋**을 만든다. 원자적이고
 * 부분 실패가 없다. (게시 구현은 다음 단계)
 *
 * 토큰은 env.GITHUB_TOKEN 이며 브라우저로 절대 나가지 않는다.
 */
import { env } from 'cloudflare:workers';
import { HttpError } from './auth.js';

const API = 'https://api.github.com';

function repo() {
  const r = env.GITHUB_REPO;
  if (!r) throw new HttpError(503, 'GITHUB_REPO 가 설정되지 않았습니다.');
  return r;
}

function headers() {
  if (!env.GITHUB_TOKEN) {
    throw new HttpError(503, 'GITHUB_TOKEN 이 설정되지 않았습니다.');
  }
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'khhan-admin',
  };
}

/** 남은 호출 수. 여유가 없으면 UI 가 경고할 수 있도록 노출한다. */
let lastRateLimitRemaining = null;
export function getRateLimitRemaining() {
  return lastRateLimitRemaining;
}

async function api(pathname, init = {}) {
  const res = await fetch(`${API}${pathname}`, { ...init, headers: { ...headers(), ...(init.headers || {}) } });

  const remaining = res.headers.get('x-ratelimit-remaining');
  if (remaining !== null) lastRateLimitRemaining = Number(remaining);

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message || '';
    } catch {
      /* 본문이 JSON 이 아니면 상태 코드만으로 보고한다 */
    }
    // 토큰 문제는 원인이 분명하도록 따로 표현한다.
    if (res.status === 401) throw new HttpError(502, `GitHub 인증 실패 — GITHUB_TOKEN 을 확인하세요. ${detail}`);
    if (res.status === 403 && detail.includes('rate limit')) {
      throw new HttpError(502, `GitHub API 호출 한도를 초과했습니다. ${detail}`);
    }
    if (res.status === 404) {
      throw new HttpError(502, `GitHub 리소스를 찾을 수 없습니다 (${pathname}). 토큰 권한 범위를 확인하세요. ${detail}`);
    }
    throw new HttpError(502, `GitHub API ${res.status} (${pathname}) ${detail}`);
  }
  return res.json();
}

/** main 브랜치가 가리키는 커밋 sha. 모든 읽기/쓰기의 기준점이 된다. */
export async function getBranchSha(branch = 'main') {
  const ref = await api(`/repos/${repo()}/git/ref/heads/${branch}`);
  return ref.object.sha;
}

/** 디렉터리 목록 (파일별 blob sha 포함). ref 는 커밋 sha 를 넘긴다. */
export async function listDirectory(dirPath, ref) {
  const entries = await api(`/repos/${repo()}/contents/${dirPath}?ref=${encodeURIComponent(ref)}`);
  if (!Array.isArray(entries)) {
    throw new HttpError(502, `${dirPath} 가 디렉터리가 아닙니다.`);
  }
  return entries;
}

/** base64 를 UTF-8 문자열로. atob 은 바이트만 주므로 TextDecoder 로 다시 푼다. */
function decodeBase64Utf8(b64) {
  const binary = atob(b64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

/** blob 내용을 문자열로 */
export async function getBlobText(sha) {
  const blob = await api(`/repos/${repo()}/git/blobs/${sha}`);
  if (blob.encoding !== 'base64') {
    throw new HttpError(502, `예상하지 못한 blob 인코딩: ${blob.encoding}`);
  }
  return decodeBase64Utf8(blob.content);
}

/**
 * src/data 의 관리 대상 파일들을 한 커밋 시점 기준으로 읽는다.
 * 파일별 sha 를 쓰지 않고 커밋 sha 하나를 기준으로 삼아 원자성을 확보한다
 * (읽는 도중 main 이 움직여도 서로 다른 시점이 섞이지 않는다).
 */
export async function readDataFiles(fileNames, commitSha) {
  const entries = await listDirectory('src/data', commitSha);
  const byName = new Map(entries.map((e) => [e.name, e]));

  const results = await Promise.all(
    fileNames.map(async (name) => {
      const entry = byName.get(name);
      if (!entry) return [name, { error: 'src/data 에 파일이 없습니다.' }];
      try {
        return [name, { raw: await getBlobText(entry.sha), blobSha: entry.sha }];
      } catch (err) {
        return [name, { error: err.message }];
      }
    })
  );
  return Object.fromEntries(results);
}
