/**
 * 초안 보관소.
 *
 * 서버(Worker)는 상태를 갖지 않으므로 게시 전 초안은 브라우저에 둔다.
 * 구 앱(khhan-admin)은 초안을 서버 메모리에 들고 있어서 재시작하면 날아갔는데,
 * 여기서는 새로고침해도 살아남는다.
 *
 * 초안이 순수 JSON 이라 가능한 구조다(업로드 파일도 나중에 blob sha 로 치환한다).
 * 전체가 150KB 안팎이라 localStorage 5MB 한도에 여유가 크다.
 */
const KEY = 'khhan-admin:draft:v1';

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

export function saveDraft({ baseSha, files, changeLog }) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ baseSha, files, changeLog, savedAt: new Date().toISOString() })
    );
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
