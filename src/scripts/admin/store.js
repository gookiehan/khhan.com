/**
 * 초안 보관소.
 *
 * 서버(Worker)는 상태를 갖지 않으므로 게시 전 초안은 브라우저에 둔다.
 * 구 앱(khhan-admin)은 초안을 서버 메모리에 들고 있어서 재시작하면 날아갔는데,
 * 여기서는 새로고침해도 살아남는다.
 *
 * 초안에는 "바뀐 파일"과 "그 파일을 편집하기 시작한 기준 내용(bases)"만 담는다.
 * 예전(v1)에는 13개 파일 전체를 담았는데, main 이 그 사이 움직인 뒤 초안을 다시 얹으면
 * 손대지 않은 파일까지 예전 내용으로 "변경됨"이 되어, 게시할 때 남의 변경을 되돌렸다.
 * 이제는 최신 원본 위에 바뀐 파일만 다시 얹는다(rebaseDraft).
 *
 * 업로드한 자산(assets: [{ path, blobSha, size }])도 함께 담는다. 빠지면 새로고침 뒤
 * 첨부 경로만 남고 blob 정보가 사라져, 게시할 때 "저장소에 없는 자산"으로 거부된다.
 *
 * 이 파일의 makeDraft / rebaseDraft 는 DOM 을 쓰지 않는 순수 함수라 node 테스트로 검증한다.
 */
const KEY = 'khhan-admin:draft:v1';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

export function loadDraft() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.files) return null;
    return parsed;
  } catch {
    // 손상된 초안 때문에 화면이 아예 안 뜨는 일은 없어야 한다.
    return null;
  }
}

/** makeDraft 가 만든 초안을 그대로 저장한다(assets 포함). */
export function saveDraft(draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
    return true;
  } catch (err) {
    // 용량 초과 등. 조용히 실패하면 사용자가 작업을 잃으므로 알린다.
    console.error('초안 저장 실패', err);
    return false;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 지우기 실패는 치명적이지 않다 */
  }
}

/**
 * 편집 상태 → 저장할 초안. 원본과 달라진 파일만, 그 파일의 기준 내용과 함께 담는다.
 * @returns {{ version: 2, baseSha, files, bases, changeLog, assets }}
 */
export function makeDraft({ baseSha, original, draft, changeLog, assets }) {
  const files = {};
  const bases = {};
  for (const name of Object.keys(draft || {})) {
    if (!same(draft[name], original?.[name])) {
      files[name] = clone(draft[name]);
      bases[name] = clone(original?.[name]);
    }
  }
  return { version: 2, baseSha, files, bases, changeLog: [...(changeLog || [])], assets: [...(assets || [])] };
}

/**
 * 초안을 최신 원본(original, currentSha) 위에 다시 얹는다.
 *
 * - 초안에 없는 파일은 최신 원본 그대로 → 손대지 않은 파일은 절대 되돌리지 않는다.
 * - 초안에 있는 파일은 초안 내용으로. 그런데 그 파일이 초안의 기준 이후 main 에서도
 *   바뀌었다면 conflicts 에 넣는다(게시하면 main 쪽 변경이 덮어써지므로 알려야 한다).
 * - v1 초안(bases 없음)은 기준을 알 수 없다. 같은 커밋 기준일 때만 원본과 다른 파일을
 *   변경분으로 보고, 커밋이 다르면 안전하게 합칠 수 없으므로 unsafe 를 돌려준다.
 *
 * @returns {{ draft: object, conflicts: string[], unsafe: boolean }}
 */
export function rebaseDraft(kept, original, currentSha) {
  const draft = clone(original) || {};
  const conflicts = [];
  let files = kept?.files || {};
  let bases = kept?.bases;

  if (!bases) {
    if (kept?.baseSha !== currentSha) return { draft, conflicts, unsafe: true };
    files = Object.fromEntries(Object.entries(files).filter(([n, v]) => n in draft && !same(v, original[n])));
    bases = original;
  }

  for (const [name, value] of Object.entries(files)) {
    if (!(name in draft)) continue; // 관리 대상에서 빠진 파일
    if (!same(bases[name], original[name])) conflicts.push(name);
    draft[name] = clone(value);
  }
  return { draft, conflicts, unsafe: false };
}
