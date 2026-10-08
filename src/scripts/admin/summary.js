/**
 * 목록 항목을 접었을 때 보이는 한 줄 요약.
 *
 * 예전에는 "첫 번째로 값이 있는 필드"만 보여서, 학력·경력·수상처럼 기간이 첫 필드인 항목은
 * 기간만 보이고 무슨 항목인지 알려면 일일이 펼쳐야 했다. 이제는
 *   기간·일자·연도(있으면)  +  첫 번째 내용 필드(제목·서지정보·이름 등)
 * 를 함께 보여 준다. 서지정보처럼 인라인 HTML(<b>, <a>)이 든 값은 태그를 떼고 글자만 쓴다.
 *
 * DOM 을 쓰지 않는 순수 함수라 node 테스트로 검증한다.
 */
const WHEN_FIELDS = new Set(['period', 'date', 'year']);

/** 인라인 HTML 을 걷어낸 한 줄 평문 */
export function plainText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @returns {{ when: string, text: string }} */
export function itemParts(item, section) {
  if (typeof item === 'string') return { when: '', text: plainText(item) || '(비어 있음)' };
  let when = '';
  let text = '';
  for (const f of section?.fields || []) {
    const v = item?.[f.name];
    if (typeof v !== 'string' || !v.trim()) continue;
    if (WHEN_FIELDS.has(f.name)) {
      if (!when) when = v.trim();
    } else if (!text) {
      text = plainText(v);
    }
  }
  if (!when && !text) return { when: '', text: '(내용 없음)' };
  return { when, text };
}

/** 한 줄 문자열(삭제 확인창, 변경 기록 등에 쓴다) */
export function itemSummary(item, section) {
  const { when, text } = itemParts(item, section);
  return [when, text].filter(Boolean).join(' ');
}
