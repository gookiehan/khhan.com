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

/**
 * PAT 만료일. GitHub 이 응답 헤더로 알려준다(만료일이 설정된 토큰에 한함).
 *
 * 왜 필요한가: 이 토큰은 관리 화면의 거의 모든 동작에 쓰이므로, 만료되면 화면이
 * 아예 열리지 않는다. 예고 없이 그렇게 되면 원인을 찾는 데 시간이 걸리므로,
 * 미리 경고할 수 있게 값을 꺼내 둔다.
 */
let lastTokenExpiry = null;
export function getTokenExpiry() {
  return lastTokenExpiry;
}

async function api(pathname, init = {}) {
  const res = await fetch(`${API}${pathname}`, { ...init, headers: { ...headers(), ...(init.headers || {}) } });

  const remaining = res.headers.get('x-ratelimit-remaining');
  if (remaining !== null) lastRateLimitRemaining = Number(remaining);

  // 만료일이 없는 토큰에는 이 헤더가 붙지 않는다. 없으면 그대로 둔다.
  const expiry = res.headers.get('github-authentication-token-expiration');
  if (expiry) lastTokenExpiry = expiry;

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

/**
 * 저장소에 존재하는 자산 경로 목록('assets/...').
 * 게시 전에 "저장소에 없는 파일을 가리키는 링크"를 잡기 위해 쓴다.
 * 트리 한 번으로 끝나므로 호출 비용이 작다.
 */
export async function listAssetPaths(commitSha) {
  const commit = await api(`/repos/${repo()}/git/commits/${commitSha}`);
  const tree = await api(`/repos/${repo()}/git/trees/${commit.tree.sha}?recursive=1`);
  const paths = new Set();
  for (const node of tree.tree || []) {
    if (node.type === 'blob' && node.path.startsWith('assets/')) paths.add(node.path);
  }
  // truncated 면 일부만 받은 것이므로, 잘못된 "없는 자산" 오류를 내지 않도록 알린다.
  return { paths, truncated: Boolean(tree.truncated) };
}

/** UTF-8 문자열 → base64 (btoa 는 바이트만 받으므로 먼저 인코딩한다) */
function encodeBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const CHUNK = 0x8000; // 인자 개수 제한을 피하려고 나눠 넣는다
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** 바이트를 그대로 blob 으로 올린다(이미지·PDF 용). 반환된 sha 는 게시할 때 트리에 넣는다. */
export async function createBinaryBlob(bytes) {
  let binary = '';
  const CHUNK = 0x8000;
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i += CHUNK) {
    binary += String.fromCharCode(...view.subarray(i, i + CHUNK));
  }
  const blob = await api(`/repos/${repo()}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content: btoa(binary), encoding: 'base64' }),
  });
  return blob.sha;
}

/**
 * 여러 파일을 한 커밋으로 main 에 올린다.
 *
 * 구 앱(khhan-admin)은 파일마다 PUT /contents 를 호출해 커밋이 N개 생겼고, 중간에
 * 실패하면 절반만 반영된 상태가 남았다. 여기서는 Git Data API 로 blob → tree →
 * commit → ref 순서로 진행해 **한 커밋**을 만든다.
 *
 * @param {{baseSha:string, files:Record<string,string>, message:string}} args
 *        files 는 저장소 경로 → 내용(문자열)
 * @returns {{commitSha:string, commitUrl:string}}
 */
export async function commitFiles({ baseSha, files, assets = [], message }) {
  const entries = Object.entries(files);
  if (entries.length === 0 && assets.length === 0) {
    throw new HttpError(400, '변경된 파일이 없습니다.');
  }

  // 1) 텍스트 파일을 blob 으로 올린다(아직 어떤 ref 에도 매달리지 않는다).
  const blobs = await Promise.all(
    entries.map(async ([path, content]) => {
      const blob = await api(`/repos/${repo()}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: encodeBase64Utf8(content), encoding: 'base64' }),
      });
      return { path, mode: '100644', type: 'blob', sha: blob.sha };
    })
  );

  // 업로드 때 이미 만들어 둔 자산 blob 들을 같은 트리에 합류시킨다.
  // 자산과 그것을 가리키는 YAML 이 한 커밋에 들어가므로, 중간 상태(링크는
  // 있는데 파일은 없는)가 생기지 않는다.
  for (const asset of assets) {
    blobs.push({ path: asset.path, mode: '100644', type: 'blob', sha: asset.blobSha });
  }

  // 2) 기준 커밋의 트리 위에 얹는다.
  const baseCommit = await api(`/repos/${repo()}/git/commits/${baseSha}`);
  const tree = await api(`/repos/${repo()}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: blobs }),
  });

  // 3) 커밋 생성
  const commit = await api(`/repos/${repo()}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [baseSha] }),
  });

  // 4) main 을 앞으로 옮긴다. force:false 라 fast-forward 만 허용되므로,
  //    그 사이 main 이 움직였으면 여기서 실패한다(2차 레이스 가드).
  try {
    await api(`/repos/${repo()}/git/refs/heads/main`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
  } catch (err) {
    throw new HttpError(409, 'main 이 그 사이 변경되어 게시하지 못했습니다. 다시 불러온 뒤 시도하세요.');
  }

  return {
    commitSha: commit.sha,
    commitUrl: `https://github.com/${repo()}/commit/${commit.sha}`,
  };
}
