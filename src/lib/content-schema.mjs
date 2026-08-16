/**
 * src/data/*.yml 의 구조를 선언한 단일 진실원천(single source of truth).
 *
 * 왜 이게 필요한가:
 * 지금까지 콘텐츠 구조 지식이 두 곳에 흩어져 있었다 —
 *   1) khhan-admin(FastAPI)의 GENERIC_FILE_SCHEMAS + awards/activities/publications
 *      전용 매니저 약 800줄
 *   2) scripts/validate-content.mjs 의 하드코딩된 구조 검사
 * 두 벌을 손으로 맞추다 보면 반드시 어긋나고, 그러면 "관리 화면은 통과시켰는데
 * CI 가 막는" 상황이 생긴다.
 *
 * 이 파일 하나가 앞으로 세 곳을 구동한다:
 *   - /admin UI 렌더링 (섹션 목록, 필드, 입력 종류)
 *   - 서버측 게시 전 검증 (src/lib/admin/validate.js)
 *   - CI 검증 (scripts/validate-content.mjs, scripts/validate-links.mjs)
 * 그래서 "admin 이 통과시킨 내용은 CI 도 통과"가 구조적으로 보장된다.
 *
 * ── 용어 ────────────────────────────────────────────────────────────────
 * kind
 *   scalar       섹션 값이 문자열 하나            예: profile.yml 의 scholarUrl
 *   dict         객체 하나                        예: publications.yml 의 phdThesis
 *   list         객체 배열                        예: awards.yml 의 awards
 *   list-scalar  문자열 배열                      예: research.yml 의 researchInterests
 *
 * field.type
 *   text      한 줄 입력
 *   textarea  여러 줄 입력(HTML 불가)
 *   richtext  여러 줄 입력 + 인라인 HTML 허용
 *             (허용 태그는 src/utils/richText.js 의 sanitizeRichText 와 같다)
 *   url       한 줄 입력 + URL 형식 검사
 *
 * required 는 실제 데이터의 출현율을 조사해 정했다. 100% 채워져 있고 의미상
 * 없으면 안 되는 것만 필수로 둔다. 예를 들어 career.desc 는 9건 중 1건만
 * 채워져 있어 선택이고, education.orgUrl 은 6/6 이지만 URL 없는 기관도 있을 수
 * 있으므로 선택으로 둔다.
 */

/** 모든 files[] 원소의 구조. url 만 필수이고, 나머지는 FileLinks.astro 가 기본값을 준다. */
export const FILE_FIELDS = [
  { name: 'url', label: '경로 또는 URL', type: 'url', required: true },
  { name: 'icon', label: '아이콘', type: 'text' },
  { name: 'tip', label: '설명', type: 'text' },
];

// 여러 섹션에서 반복되는 필드 정의. 개별 섹션에서 { ...F.date, required: true }
// 처럼 덮어써서 쓴다.
const F = {
  period: { name: 'period', label: '기간', type: 'text' },
  date: { name: 'date', label: '일자', type: 'text' },
  title: { name: 'title', label: '제목', type: 'richtext', required: true },
  citation: { name: 'citation', label: '서지정보', type: 'richtext', required: true },
  desc: { name: 'desc', label: '설명', type: 'richtext' },
};

export const SCHEMA = [
  {
    // 사이트 첫 화면(히어로) 내용. 예전에는 index.astro 에 하드코딩되어 있어
    // 관리 화면에서 고칠 수 없었다.
    file: 'profile.yml',
    label: '프로필 (첫 화면)',
    sections: [
      {
        key: 'name',
        label: '이름',
        kind: 'scalar',
        fields: [{ name: 'value', label: '이름', type: 'text', required: true }],
      },
      {
        key: 'tagline',
        label: '한 줄 소개',
        kind: 'scalar',
        fields: [{ name: 'value', label: '소개', type: 'text', required: true }],
      },
      {
        // 항목 사이의 구분자(|)는 화면이 넣으므로 데이터에 두지 않는다.
        key: 'affiliations',
        label: '소속·직함',
        kind: 'list-scalar',
        fields: [{ name: 'value', label: '소속·직함', type: 'richtext', required: true }],
      },
      {
        key: 'photoUrl',
        label: '사진 경로',
        kind: 'scalar',
        fields: [{ name: 'value', label: '경로', type: 'url', required: true }],
      },
      {
        key: 'photoAlt',
        label: '사진 대체텍스트',
        kind: 'scalar',
        fields: [{ name: 'value', label: '대체텍스트', type: 'text', required: true }],
      },
      {
        key: 'scholarUrl',
        label: 'Google Scholar URL',
        kind: 'scalar',
        fields: [{ name: 'value', label: 'URL', type: 'url', required: true }],
      },
    ],
  },

  {
    file: 'education.yml',
    label: '학력사항',
    sections: [
      {
        key: 'education',
        label: '학력',
        kind: 'list',
        files: true,
        fields: [
          { ...F.period, required: true },
          F.title,
          { name: 'org', label: '기관', type: 'text', required: true },
          { name: 'orgUrl', label: '기관 URL', type: 'url' },
          F.desc,
        ],
      },
    ],
  },

  {
    file: 'career.yml',
    label: '경력사항',
    sections: [
      {
        key: 'career',
        label: '경력',
        kind: 'list',
        files: true,
        fields: [{ ...F.period, required: true }, F.title, F.desc],
      },
    ],
  },

  {
    file: 'research.yml',
    label: '연구',
    sections: [
      {
        key: 'researchInterests',
        label: '관심분야',
        kind: 'list-scalar',
        fields: [{ name: 'value', label: '관심분야', type: 'text', required: true }],
      },
      {
        key: 'projects',
        label: '주요 연구과제 (프로젝트)',
        kind: 'list',
        files: true,
        fields: [
          { ...F.period, required: true },
          F.title,
          { name: 'org', label: '기관', type: 'richtext', required: true },
          { name: 'role', label: '역할', type: 'text', required: true },
        ],
      },
    ],
  },

  {
    file: 'qea.yml',
    label: 'QEA',
    sections: [
      {
        key: 'qeaAbstract',
        label: '개요',
        kind: 'scalar',
        fields: [{ name: 'value', label: '개요', type: 'textarea', required: true }],
      },
      { key: 'qeaThesis', label: 'Ph.D Thesis', kind: 'dict', files: true, fields: [F.citation] },
      { key: 'qeaJournals', label: 'International Journal Papers (QEA)', kind: 'list', files: true, fields: [F.citation] },
      { key: 'qeaConferences', label: 'International Conference Papers (QEA)', kind: 'list', files: true, fields: [F.citation] },
      { key: 'qeaDomestic', label: 'Domestic Conference Paper (QEA)', kind: 'list', files: true, fields: [F.citation] },
      { key: 'qeaPatent', label: 'Patent (QEA)', kind: 'dict', files: true, fields: [F.citation] },
    ],
  },

  {
    file: 'awards.yml',
    label: '수상경력',
    sections: [
      {
        key: 'awards',
        label: '수상',
        kind: 'list',
        files: true,
        fields: [{ ...F.date, required: true }, F.title],
      },
    ],
  },

  {
    file: 'activities.yml',
    label: '활동',
    // 이 파일만 최상위에 activities 라는 한 겹이 더 있다.
    container: 'activities',
    sections: [
      { key: 'board', label: '이사 등 활동', kind: 'list', files: true, fields: [{ ...F.period, required: true }, F.title] },
      { key: 'committee', label: '전문위원 활동', kind: 'list', files: true, fields: [{ ...F.period, required: true }, F.title] },
      { key: 'standardization', label: '표준화', kind: 'list', files: true, fields: [{ ...F.period, required: true }, F.title] },
      { key: 'invitedTalks', label: '초청강연', kind: 'list', files: true, fields: [{ ...F.date, required: true }, F.title] },
      { key: 'teaching', label: '강의', kind: 'list', files: true, fields: [{ ...F.date, required: true }, F.title] },
      { key: 'judges', label: '심사위원', kind: 'list', files: true, fields: [{ ...F.period, required: true }, F.title] },
      {
        key: 'reviewers',
        label: '저널 리뷰어',
        kind: 'list-scalar',
        fields: [{ name: 'value', label: '저널명', type: 'richtext', required: true }],
      },
    ],
  },

  {
    file: 'publications.yml',
    label: '논문·저서',
    sections: [
      { key: 'phdThesis', label: 'Ph.D Thesis', kind: 'dict', files: true, fields: [F.citation] },
      { key: 'intlJournals', label: 'International Journal Papers', kind: 'list', files: true, fields: [F.citation] },
      { key: 'intlConferences', label: 'International Conference Papers', kind: 'list', files: true, fields: [F.citation] },
      { key: 'domesticPapers', label: 'Domestic Conference & Journal Papers', kind: 'list', files: true, fields: [F.citation] },
      { key: 'magazineArticles', label: 'Magazine Articles', kind: 'list', files: true, fields: [F.citation] },
      { key: 'books', label: 'Books', kind: 'list', files: true, fields: [F.citation] },
    ],
  },

  {
    file: 'patents.yml',
    label: '특허',
    sections: [
      {
        key: 'patentNote',
        label: '특허 요약',
        kind: 'scalar',
        fields: [{ name: 'value', label: '요약', type: 'textarea', required: true }],
      },
      {
        key: 'patentSearchUrls',
        label: '특허 검색 링크',
        kind: 'list',
        fields: [
          { name: 'label', label: '링크 이름', type: 'text', required: true },
          { name: 'url', label: 'URL', type: 'url', required: true },
        ],
      },
    ],
  },

  {
    file: 'honors.yml',
    label: 'Honors',
    sections: [{ key: 'honors', label: 'Honors', kind: 'list', files: true, fields: [F.title] }],
  },

  {
    file: 'ta.yml',
    label: '조교활동',
    sections: [
      {
        key: 'taActivities',
        label: '조교활동',
        kind: 'list',
        files: true,
        fields: [{ ...F.period, required: true }, F.title],
      },
    ],
  },

  {
    file: 'clubs.yml',
    label: '동아리활동',
    sections: [{ key: 'clubs', label: '동아리', kind: 'list', files: true, fields: [F.title, F.desc] }],
  },
];

/** 관리 대상 파일 이름 목록. 이 배열에 없는 파일은 admin 이 건드리지 않는다. */
export const MANAGED_FILES = SCHEMA.map((f) => f.file);

/** 파일 이름 → 스키마 정의 */
export function getFileSchema(fileName) {
  return SCHEMA.find((f) => f.file === fileName);
}

/** 그 파일에서 섹션들이 들어 있는 객체를 꺼낸다(activities.yml 의 한 겹을 흡수). */
export function getSectionScope(fileName, data) {
  const schema = getFileSchema(fileName);
  if (!schema || data == null) return undefined;
  return schema.container ? data[schema.container] : data;
}

/** 리스트형 섹션인가 (list | list-scalar) */
export function isListKind(kind) {
  return kind === 'list' || kind === 'list-scalar';
}

/** 모든 (파일, 섹션) 쌍을 평평하게 순회. UI 와 검증에서 공통으로 쓴다. */
export function* eachSection() {
  for (const file of SCHEMA) {
    for (const section of file.sections) {
      yield { file, section };
    }
  }
}
