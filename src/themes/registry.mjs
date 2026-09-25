/**
 * 사이트 테마 목록.
 *
 * 테마 = 화면 디자인 + 페이지 구성. 콘텐츠(src/data/*.yml)는 모든 테마가 같이 쓴다.
 * 어떤 테마를 khhan.com 에 띄울지는 src/data/site.yml 의 theme 값이 정한다.
 * 나머지 테마도 함께 빌드되어 /preview/<id>/ 에서 볼 수 있다(검색 제외).
 *
 * 이 파일은 Astro 에 의존하지 않는다. 관리 화면(Worker)과 CI 검증 스크립트(node)도
 * 여기서 테마 id 목록을 가져가므로, .astro 를 import 하면 안 된다.
 * 화면 컴포넌트와의 연결은 src/themes/index.js 가 맡는다.
 *
 * 새 테마를 추가할 때:
 *   1) src/themes/<id>/ 폴더를 만들고 페이지 컴포넌트를 둔다
 *   2) 아래 THEMES 에 한 줄 추가
 *   3) src/themes/index.js 의 PAGES 에 페이지 목록 추가
 * 예전 테마는 지우지 않고 남겨 두면 언제든 site.yml 한 줄로 되돌릴 수 있다.
 */
export const THEMES = [
  { id: 'classic', label: '클래식 — 2026.05 디자인 (어두운 배경, 한 페이지)' },
  { id: 'paper', label: '페이퍼 — 2026.09 디자인 (밝은 이력서형, 소개 + 한 페이지)' },
];

export const THEME_IDS = THEMES.map((t) => t.id);

/** site.yml 이 비어 있거나 theme 이 없을 때 쓰는 값 */
export const DEFAULT_THEME = 'classic';
