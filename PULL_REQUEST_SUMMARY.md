# PR Summary: Astro Migration Finalization

## 목적

기존 정적 사이트(`index.html` + `data.js`)를 운영 안정성을 유지한 채 Astro + YAML 기반 관리 구조로 전환하고, 배포 전 검증/배포 자동화를 확립합니다.

## 주요 변경사항

- Astro 기반 정적 사이트 구조 도입 및 페이지 렌더링 전환
- 콘텐츠를 `src/data/*.yml`로 분리하여 관리 가능 구조로 정리
- 공통 컴포넌트 1차 분리:
  - `src/components/Section.astro`
  - `src/components/FileLinks.astro`
  - `src/components/ListSection.astro`
- 콘텐츠 검증 스크립트 추가:
  - `scripts/validate-content.mjs`
- 링크 검증 스크립트 추가:
  - `scripts/validate-links.mjs`
- npm 스크립트 체계 정리:
  - `validate:content`, `validate:links`, `validate`, `build`
- GitHub Pages workflow 추가:
  - PR 검증만 수행
  - `main` push 시 artifact 업로드 + 배포
  - `dist/CNAME` 값 검증 포함
- 운영 문서 추가/업데이트:
  - `README.md`
  - `MIGRATION.md`
  - `CONTENT_MIGRATION_REPORT.md`
  - `LINK_VALIDATION_REPORT.md`

## 콘텐츠 마이그레이션 결과

- 총 콘텐츠 항목: **227 / 227**
- `files[]` 링크 엔트리: **177 / 177**
- 고유 URL: **146 / 146**
- 고유 로컬 asset URL: **109 / 109**
- `dist` 기준 누락 로컬 asset: **0**

## 검증 결과

최종 점검 시 아래 명령 모두 통과:

- `npm run validate:content`
- `npm run validate:links`
- `npm run validate`
- `npm run build`

추가 확인:

- `dist/CNAME` 존재 및 값 `khhan.com` 확인

## 배포 영향

- PR에서는 검증/빌드만 수행하며 배포하지 않습니다.
- `main` 브랜치 push/merge 시에만 GitHub Pages 배포가 실행됩니다.
- `public/CNAME`이 `dist/CNAME`으로 복사되어 custom domain(`khhan.com`)이 유지됩니다.

## Known Issues

- `?edit` admin 보조 경로는 아직 `data.js` fetch에 의존합니다.
- 기존 `index.html`, `data.js`, `style.css`는 비교/롤백 목적의 레거시 기준선으로 보존 중입니다.

## 롤백 방법

1. `before-astro-migration` 태그 기준 상태를 확인합니다.
2. `main`에서 복구 브랜치를 생성해 필요한 상태로 되돌립니다.
3. 복구 PR에서 아래를 다시 확인합니다.
   - `npm run validate`
   - `npm run build`

예시:

```bash
git fetch --tags
git show before-astro-migration
git switch -c hotfix/rollback-main main
```

## 리뷰어 확인 사항

- YAML 콘텐츠가 실제 렌더링 결과와 일치하는지
- `validate` 체인이 CI/로컬에서 동일하게 통과하는지
- workflow가 PR 비배포 / main 배포 정책을 지키는지
- `dist/CNAME` 검증 step이 custom domain 보호에 충분한지
- 레거시 파일 보존 정책(비교/롤백 목적)이 현재 릴리즈 전략과 맞는지
