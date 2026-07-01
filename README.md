# khhan.com 관리 가이드

## 1) 사이트 개요

- 이 저장소는 **Astro 기반 정적 사이트**입니다.
- 화면 렌더링은 `src/pages/index.astro`가 담당합니다.
- 콘텐츠 원본은 `src/data/*.yml`(YAML)입니다.
- 배포 대상은 `dist/`이며, GitHub Pages로 배포됩니다.

## 2) 로컬 실행 방법

```bash
npm ci
npm run dev
```

- 개발 서버 실행 후 브라우저에서 안내된 로컬 주소를 열면 됩니다.

## 3) 콘텐츠 수정 위치

- 프로필/기본 정보: `src/data/profile.yml`
- QEA: `src/data/qea.yml`
- 학력: `src/data/education.yml`
- 경력: `src/data/career.yml`
- 연구/프로젝트: `src/data/research.yml`
- 수상: `src/data/awards.yml`
- 활동: `src/data/activities.yml`
- 논문/저서: `src/data/publications.yml`
- 특허: `src/data/patents.yml`
- 영예: `src/data/honors.yml`
- TA: `src/data/ta.yml`
- 동아리: `src/data/clubs.yml`

참고: `?edit` 레거시 editor는 제거되었습니다. 콘텐츠 수정은 `src/data/*.yml`에서 진행해야 합니다.

## 4) 새 논문 추가 방법

1. `src/data/publications.yml`에서 맞는 섹션(`intlJournals`, `intlConferences`, `domesticPapers` 등)을 찾습니다.
2. 기존 항목 형식을 그대로 복사해 새 항목을 추가합니다.
3. `files`가 필요하면 `files: [{ label: "...", url: "..." }]` 형태로 추가합니다.
4. 저장 후 아래 검증을 실행합니다.

## 5) 새 특허/자료 링크 추가 방법

- 특허: `src/data/patents.yml`
  - `patentSearchUrls`에 링크를 추가합니다.
- 일반 자료 링크(PDF/발표자료/기사 등):
  - 해당 콘텐츠 항목의 `files[]`에 `url`을 추가합니다.
  - `label`은 선택입니다.

## 6) PDF/이미지 파일 추가 방법

1. 파일을 `assets/` 하위(기존 폴더 구조 권장)에 넣습니다.
2. YAML의 `files[].url`에는 `assets/...` 또는 `/assets/...` 경로를 사용합니다.
3. 파일명 대소문자/확장자를 실제 파일과 정확히 맞춥니다.
4. 검증 스크립트로 누락 여부를 확인합니다.

## 7) 검증 명령어

```bash
npm run validate:content
npm run validate:links
npm run validate
```

- `validate:content`: 콘텐츠 구조/개수 검증
- `validate:links`: `files[].url` 링크 형식/로컬 파일 존재 검증
- `validate`: 위 두 검증을 순서대로 실행

새 콘텐츠 추가로 항목 수(예: 논문/수상/링크 개수)가 증가하는 것은 정상입니다. 현재 검증은 고정 개수 일치가 아니라 구조/필수 필드 유효성 중심으로 통과 여부를 판단합니다.
링크 검증도 동일하게 운영형으로 동작하며, 링크 수 증가는 정상으로 허용되고 링크 형식/허용 스킴/로컬 파일 존재 여부만 엄격히 검증합니다.

## 8) 빌드 명령어

```bash
npm run build
npm run preview
```

- `build`는 `scripts/sync-static.mjs`를 먼저 실행한 뒤 Astro 빌드를 수행합니다.

## 9) GitHub Pages 배포 방식

- 워크플로우: `.github/workflows/deploy.yml`
- PR: `npm ci` + `npm run validate` + `npm run build`만 실행 (배포 없음)
- `main` push/merge: 검증+빌드 후 Pages artifact 업로드 및 배포 실행

## 10) khhan.com custom domain / CNAME 유지 방식

- `public/CNAME` 파일에 `khhan.com`이 들어 있습니다.
- Astro 빌드 시 `public/` 내용이 `dist/`로 복사되어 `dist/CNAME`이 생성됩니다.
- 워크플로우에서 `dist/CNAME` 존재와 값(`khhan.com`)을 확인합니다.

## 11) 문제 발생 시 롤백 방법

1. 배포 이슈 시 `before-astro-migration` 태그를 기준으로 비교합니다.
2. 필요한 경우 `main`에서 안정 커밋으로 되돌린 브랜치를 만들어 PR로 복구합니다.
3. 복구 전후에 반드시 아래를 확인합니다.
   - `npm run validate`
   - `npm run build`

예시(참고):

```bash
git fetch --tags
git show before-astro-migration
git switch -c hotfix/rollback-main main
```

## 12) Codex에게 작업 맡길 때 권장 방식

- 요청에 아래를 항상 포함하면 안정적입니다.
  - 변경 금지 파일 명시 (`index.html`, `data.js`, `style.css`, `public/CNAME` 등)
  - 목표 범위 명시 (예: 문서만 수정, 스크립트만 추가)
  - 완료 조건 명시 (예: `npm run validate`, `npm run build` 통과)
  - 보고 형식 명시 (변경 파일 목록, 실행 결과, 커밋 메시지)
- 콘텐츠 수정 작업에서는 “자동 수정 금지, 오류는 보고만” 조건을 함께 주는 것을 권장합니다.

## 13) 레거시 정리 상태

- 루트 `index.html`, `data.js`, `scripts/export-data-to-yaml.mjs`는 최종 정리 단계에서 제거되었습니다.
- 현재 운영 기준 콘텐츠 소스는 `src/data/*.yml`입니다.
- 렌더링/배포에 필요한 정적 리소스는 `style.css`, `assets/`, `CNAME`입니다.
