# khhan.com 운영 매뉴얼 (VS Code + Codex + GitHub)

이 문서는 `README.md`보다 실무 중심으로, 운영자가 그대로 복사해서 사용할 수 있는 절차를 정리한 문서입니다.

## 1) 기본 운영 흐름

1. `main` 최신화
2. 새 작업 브랜치 생성
3. Codex에 작업 요청
4. `npm run validate`
5. `npm run build`
6. 커밋
7. 푸시
8. PR 생성
9. GitHub Actions 확인
10. `https://khhan.com` 확인

```bash
git switch main
git pull origin main
git switch -c content/update-YYYYMMDD
npm run validate
npm run build
git add .
git commit -m "docs/content: update publications"
git push -u origin content/update-YYYYMMDD
```

---

## 2) 자주 쓰는 터미널 명령어

### main 최신화
```bash
git switch main
git pull origin main
```

### 새 브랜치 만들기
```bash
git switch -c content/update-YYYYMMDD
```

### 변경 파일 확인
```bash
git status
git diff
```

### CNAME 개행 이슈 정리 (Windows)
```bash
git restore --source=HEAD --worktree --staged public/CNAME
```

### 커밋
```bash
git add .
git commit -m "content: add new award entry"
```

### push
```bash
git push -u origin <branch-name>
```

### 테스트 브랜치 삭제
```bash
git switch main
git branch -D <test-branch>
git push origin --delete <test-branch>
```

---

## 3) 새 논문 추가용 Codex 프롬프트

```text
현재 브랜치에서 src/data/publications.yml에 새 논문 1건을 추가해줘.
조건:
1) 기존 항목 의미/순서 규칙 유지
2) 필요한 경우 files[] 링크 추가
3) 기존 항목 수정 금지(신규 항목만 추가)
4) npm run validate 실행
5) npm run build 실행
완료 후:
- 수정 파일
- 추가 위치
- validate/build 결과
- 커밋 메시지 제안
```

---

## 4) 새 수상/활동/특허/자료 추가용 Codex 프롬프트

### awards.yml
```text
src/data/awards.yml에 새 수상 항목 1개를 추가해줘.
기존 순서/형식 유지, files[].url 필요 시 추가, validate/build 실행, 커밋 메시지 제안.
```

### activities.yml
```text
src/data/activities.yml의 적절한 하위 카테고리에 새 활동 1개 추가해줘.
기존 섹션 구조/정렬 유지, validate/build 실행, 커밋 메시지 제안.
```

### patents.yml
```text
src/data/patents.yml에 특허 관련 링크/문구를 1건 추가해줘.
기존 구조 유지, validate/build 실행, 커밋 메시지 제안.
```

### qea.yml 또는 research.yml
```text
src/data/qea.yml 또는 src/data/research.yml에 자료 1건 추가해줘.
기존 의미/순서/링크 구조 유지, validate/build 실행, 커밋 메시지 제안.
```

---

## 5) PDF/이미지 파일 추가 절차

1. 파일을 아래 경로 중 하나에 추가
   - `assets/docs` (PDF 등 문서)
   - `assets/images` (이미지)
2. YAML에서 `assets/...` 경로로 연결
3. 검증/빌드 실행

```bash
npm run validate
npm run build
```

---

## 6) 콘텐츠 추가 테스트 절차

```bash
git switch main
git pull origin main
git switch -c test/content-check-YYYYMMDD
```

1. 대상 YAML에 `[TEST ONLY]` 항목 추가
2. `npm run validate`
3. `npm run build`
4. 확인 후 되돌리기

```bash
git restore src/data/awards.yml
git status
```

5. 테스트 브랜치 삭제
```bash
git switch main
git branch -D test/content-check-YYYYMMDD
```

---

## 7) 배포 확인 절차

1. PR에서 **Validate and Build** 성공 확인
2. `main` merge 후 GitHub Actions 배포 job 성공 확인
3. GitHub Pages 배포 완료 확인
4. 실제 사이트 확인
   - `https://khhan.com`
   - 필요 시 강력 새로고침(`Ctrl+F5`)

---

## 8) 문제 해결

### public/CNAME이 계속 modified로 표시될 때
```bash
git restore --source=HEAD --worktree --staged public/CNAME
```

### validate-content 실패
- YAML 문법 오류(들여쓰기, 따옴표) 확인
- 배열 필드에 `null`/빈 항목이 들어갔는지 확인
- `files`가 배열인지 확인
- `files[].url` 누락 여부 확인

### validate-links 실패
- `files[].url` 빈 문자열/누락 확인
- 외부 링크는 `http://` 또는 `https://` 형식인지 확인
- 로컬 링크(`assets/...`)의 실제 파일 존재 여부 확인

### npm run build 실패
- 직전 `validate` 오류 먼저 해결
- YAML 구문 오류 우선 점검
- `git diff`로 예상 밖 수정 파일 확인

### 한글이 깨질 때
- 파일 UTF-8 인코딩 저장 확인
- 깨진 문자열만 최소 수정
- 수정 후 `npm run build` + `dist/index.html` 문자열 확인

### 링크가 raw HTML로 보일 때
- 해당 렌더링 코드가 `set:html`을 사용하는지 확인
- 데이터에 HTML 문자열(`<a ...>`)이 있는 필드인지 확인

### GitHub Pages가 예전 화면을 보여줄 때
- Actions 배포 성공 여부 확인
- 브라우저 강력 새로고침
- 잠시 대기 후 재확인(캐시/반영 지연)

---

## 9) 롤백 방법

### 태그 확인
```bash
git fetch --tags
git show before-astro-migration
```

### 특정 커밋으로 복구 브랜치 생성
```bash
git switch main
git pull origin main
git switch -c hotfix/rollback-YYYYMMDD
git revert <bad_commit_sha>
```

### 롤백 PR 생성
- 제목 예: `hotfix: rollback broken content update`
- 본문에 원인/영향/검증 결과(`validate`, `build`) 기재

---

## 10) 앞으로 Codex에게 줄 때의 원칙

1. 한 번에 한 작업만 요청
2. 수정 가능/금지 파일 범위를 명시
3. 항상 `npm run validate`, `npm run build` 실행 요청
4. 커밋 메시지 제안 요청
5. 필요 시 PR 설명문 초안 요청

---

## 11) 자주 쓰는 PR 제목/설명 템플릿

### 콘텐츠 추가 PR
- 제목: `content: add new publication entries`
- 설명:
  - 변경 파일: `src/data/...`
  - 추가 내용 요약
  - 검증: `npm run validate`, `npm run build` 통과

### 링크 수정 PR
- 제목: `content: fix broken asset/external links`
- 설명:
  - 수정 링크 목록
  - 링크 검증 결과 포함

### 문서 수정 PR
- 제목: `docs: update operations guide`
- 설명:
  - 변경한 문서 목록
  - 운영 영향 없음

### 스타일 수정 PR
- 제목: `style: adjust section spacing`
- 설명:
  - 시각 변경 범위
  - 콘텐츠/링크 영향 없음

---

## 12) 운영 체크리스트

### 콘텐츠 추가 전
- [ ] 작업 브랜치 생성
- [ ] 수정 대상 YAML 확정
- [ ] 파일 경로/링크 준비

### PR 올리기 전
- [ ] `npm run validate` 통과
- [ ] `npm run build` 통과
- [ ] `git diff`로 의도한 파일만 변경 확인

### merge 후
- [ ] GitHub Actions 배포 성공 확인
- [ ] `dist/CNAME` 관련 오류 없는지 확인

### 배포 후
- [ ] `https://khhan.com` 데스크톱 확인
- [ ] 모바일 화면 확인
- [ ] 주요 PDF/이미지 링크 샘플 점검

