// 단위 테스트: 표시용 도우미, 살균, 테마 등록, 관리 화면 검증.
// 실행: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

import {
  formatPeriod,
  isOngoing,
  safeHref,
  siteUrl,
  describeFiles,
  linkKind,
  splitName,
  paragraphs,
  plainText,
} from '../src/lib/format.js';
import { sanitizeRichText } from '../src/utils/richText.js';
import { THEMES, THEME_IDS, DEFAULT_THEME } from '../src/themes/registry.mjs';
import { SCHEMA, MANAGED_FILES, optionValues } from '../src/lib/content-schema.mjs';
import { validateFile } from '../src/lib/admin/validate.js';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');
const load = (name) => yaml.load(fs.readFileSync(path.join(dataDir, name), 'utf8'));

// ── 날짜 표기 ───────────────────────────────────────────
test('formatPeriod: 대표 형식', () => {
  assert.equal(formatPeriod('2018.07.~현재'), '2018.07 – 현재');
  assert.equal(formatPeriod('2025. 9.'), '2025.09');
  assert.equal(formatPeriod('2018. 09. – 2021. 09.'), '2018.09 – 2021.09');
  assert.equal(formatPeriod('2019. 04. – 2020. 02'), '2019.04 – 2020.02');
  assert.equal(formatPeriod('2003.03.14.'), '2003.03.14');
  assert.equal(formatPeriod('2022.~현재'), '2022 – 현재');
  assert.equal(formatPeriod('1990'), '1990');
  assert.equal(formatPeriod(''), '');
  assert.equal(formatPeriod(undefined), '');
  assert.equal(formatPeriod('2026년 봄'), '2026년 봄', '모르는 형식은 그대로');
});

test('formatPeriod: 실제 데이터의 모든 날짜가 정규 형식으로 바뀐다', () => {
  const DATE = String.raw`\d{4}(\.\d{2}){0,2}`;
  const ok = new RegExp(`^${DATE}( – (${DATE}|현재))?$`);
  const bad = [];
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        if ((k === 'period' || k === 'date') && typeof x === 'string') {
          const out = formatPeriod(x);
          if (!ok.test(out)) bad.push(`${x} → ${out}`);
        } else walk(x);
      }
    }
  };
  for (const f of fs.readdirSync(dataDir).filter((n) => n.endsWith('.yml'))) walk(load(f));
  assert.deepEqual(bad, []);
});

test('isOngoing', () => {
  assert.equal(isOngoing('2018.07.~현재'), true);
  assert.equal(isOngoing('2013.08.~2018.06.'), false);
  assert.equal(isOngoing(undefined), false);
});

// ── 링크 안전성 ────────────────────────────────────────
test('safeHref: 허용 스킴만 통과', () => {
  assert.equal(safeHref('assets/docs/a.pdf'), '/assets/docs/a.pdf');
  assert.equal(safeHref('/assets/images/a.jpg'), '/assets/images/a.jpg');
  assert.equal(safeHref('https://example.com/x'), 'https://example.com/x');
  assert.equal(safeHref('http://example.com'), 'http://example.com');
  assert.equal(safeHref('mailto:a@b.c'), 'mailto:a@b.c');
  for (const evil of [
    'javascript:alert(1)',
    ' JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:x',
    '//evil.example',
    '../secret',
    'assets',
    '',
    null,
    undefined,
    42,
  ]) {
    assert.equal(safeHref(evil), null, String(evil));
  }
});

test('siteUrl: 상대 자산 경로만 루트 기준으로', () => {
  assert.equal(siteUrl('assets/x.pdf'), '/assets/x.pdf');
  assert.equal(siteUrl('https://a.b/assets/x'), 'https://a.b/assets/x');
});

test('describeFiles: 종류 판별, 중복 번호, 위험 링크 제거', () => {
  const rows = describeFiles([
    { url: 'assets/docs/t.pdf', icon: '📄', tip: '박사논문 PDF' },
    { url: 'https://www.hankyung.com/a', icon: '📰', tip: '한경 기사' },
    { url: 'https://youtu.be/1', icon: '🎬', tip: 'YouTube' },
    { url: 'https://youtu.be/2', icon: '🎬', tip: 'YouTube' },
    { url: 'assets/docs/x.pdf', icon: '📄', tip: 'PDF' },
    { url: 'javascript:alert(1)', icon: '📄', tip: 'evil' },
    { url: 'https://rdcu.be/x', icon: '📄', tip: 'PDF' },
  ]);
  assert.deepEqual(rows, [
    { href: '/assets/docs/t.pdf', kind: 'PDF', text: '박사논문' },
    { href: 'https://www.hankyung.com/a', kind: '기사', text: '한경' },
    { href: 'https://youtu.be/1', kind: '영상', text: 'YouTube 1' },
    { href: 'https://youtu.be/2', kind: '영상', text: 'YouTube 2' },
    { href: '/assets/docs/x.pdf', kind: 'PDF', text: '' },
    { href: 'https://rdcu.be/x', kind: '문서', text: 'PDF' },
  ]);
  assert.deepEqual(describeFiles(undefined), []);
  assert.deepEqual(describeFiles('nope'), []);
});

test('linkKind: 아이콘이 없으면 URL 로 추정', () => {
  assert.equal(linkKind({ url: 'https://www.youtube.com/watch?v=1' }), '영상');
  assert.equal(linkKind({ url: 'assets/images/a.JPG' }), '이미지');
  assert.equal(linkKind({ url: 'assets/docs/a.zip' }), '자료');
  assert.equal(linkKind({ url: 'https://example.com' }), '링크');
});

test('splitName / paragraphs / plainText', () => {
  assert.deepEqual(splitName('한국현 (Kuk-Hyun Han, Ph.D.)'), { primary: '한국현', secondary: 'Kuk-Hyun Han, Ph.D.' });
  assert.deepEqual(splitName('한국현'), { primary: '한국현', secondary: '' });
  assert.deepEqual(paragraphs('a\nb\n\nc\r\n\r\n\n'), ['a b', 'c']);
  assert.deepEqual(paragraphs(undefined), []);
  assert.equal(plainText('<b>A</b>&nbsp;&amp; <i>B</i>'), 'A & B');
});

// ── 살균 ──────────────────────────────────────────────
test('sanitizeRichText: 스크립트·이벤트·위험 스킴 제거', () => {
  const out = sanitizeRichText(
    '<b>ok</b><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">x</a><a href="https://a.b" onclick="x()">y</a><span style="color:red" class="c">z</span>',
  );
  assert.ok(out.includes('<b>ok</b>'));
  assert.ok(!/script|onerror|onclick|javascript:|<img|style=/i.test(out), out);
  assert.ok(out.includes('href="https://a.b"'));
  assert.ok(out.includes('rel="noopener noreferrer"'));
  assert.ok(out.includes('target="_blank"'));
});

// ── 테마 등록 ──────────────────────────────────────────
test('테마 등록이 일관된다', () => {
  assert.ok(THEME_IDS.includes(DEFAULT_THEME));
  assert.equal(new Set(THEME_IDS).size, THEME_IDS.length, 'id 중복');
  const indexSrc = fs.readFileSync(path.join(root, 'src', 'themes', 'index.js'), 'utf8');
  for (const t of THEMES) {
    assert.match(t.id, /^[a-z0-9-]+$/, `${t.id}: URL 에 쓰이므로 소문자·숫자·- 만`);
    assert.ok(t.id !== 'preview');
    assert.ok(fs.existsSync(path.join(root, 'src', 'themes', t.id, 'Home.astro')), `${t.id}/Home.astro 없음`);
    assert.match(indexSrc, new RegExp(`\\b${t.id}: \\[`), `index.js PAGES 에 ${t.id} 없음`);
  }
});

test('site.yml 의 테마가 등록되어 있다', () => {
  const site = load('site.yml');
  assert.ok(THEME_IDS.includes(site.theme), site.theme);
});

test('스키마: 사이트 테마 선택지 = 등록된 테마', () => {
  const field = SCHEMA.find((f) => f.file === 'site.yml').sections[0].fields[0];
  assert.deepEqual(optionValues(field), THEME_IDS);
});

// ── 관리 화면 게시 전 검증 ─────────────────────────────
test('현재 데이터는 관리 화면 검증을 모두 통과한다', () => {
  for (const name of MANAGED_FILES) {
    assert.deepEqual(validateFile(name, load(name)), [], name);
  }
});

test('관리 화면 검증: 등록되지 않은 테마를 거부한다', () => {
  assert.deepEqual(validateFile('site.yml', { theme: 'paper' }), []);
  assert.equal(validateFile('site.yml', { theme: 'hacker' }).length, 1);
  assert.equal(validateFile('site.yml', { theme: '' }).length > 0, true);
  assert.equal(validateFile('site.yml', {}).length > 0, true);
  assert.equal(validateFile('site.yml', { theme: 'paper', extra: 1 }).length, 1, '스키마에 없는 키');
});

test('관리 화면 검증: 새 프로필 항목', () => {
  const base = load('profile.yml');
  const clone = () => structuredClone(base);

  const noTitle = clone();
  noTitle.highlights = [{ year: '2025', title: '' }];
  assert.ok(validateFile('profile.yml', noTitle).some((e) => e.includes('highlights[0].title')));

  const evilLink = clone();
  evilLink.links = [{ label: 'x', url: 'javascript:alert(1)' }];
  assert.ok(validateFile('profile.yml', evilLink).some((e) => e.includes('links[0].url')));

  const evilHl = clone();
  evilHl.highlights = [{ year: '2025', title: '<img src=x onerror=alert(1)>' }];
  assert.ok(validateFile('profile.yml', evilHl).some((e) => e.includes('이벤트 속성')));

  const emptyIntro = clone();
  emptyIntro.intro = '';
  assert.deepEqual(validateFile('profile.yml', emptyIntro), [], '소개문은 비워도 된다');
});

test('관리 화면 검증: 학력 구분 선택지', () => {
  const edu = load('education.yml');
  const ok = structuredClone(edu);
  ok.education[0].group = 'program';
  assert.deepEqual(validateFile('education.yml', ok), []);
  const bad = structuredClone(edu);
  bad.education[0].group = 'phd';
  assert.equal(validateFile('education.yml', bad).length, 1);
});

// ── 관리 화면 초안(store.js) ───────────────────────────
import { makeDraft, rebaseDraft, saveDraft, loadDraft, clearDraft } from '../src/scripts/admin/store.js';

const V1 = { 'career.yml': { career: ['c1'] }, 'awards.yml': { awards: ['a1'] }, 'site.yml': { theme: 'classic' } };
const withChange = (base, name, value) => ({ ...structuredClone(base), [name]: value });

test('makeDraft: 바뀐 파일과 그 기준 내용만 담는다', () => {
  const draft = withChange(V1, 'career.yml', { career: ['c1', 'c2'] });
  const d = makeDraft({ baseSha: 'A', original: V1, draft, changeLog: ['x'], assets: [{ path: 'assets/images/p.jpg', blobSha: 'b1', size: 1 }] });
  assert.deepEqual(Object.keys(d.files), ['career.yml']);
  assert.deepEqual(d.bases['career.yml'], V1['career.yml']);
  assert.equal(d.assets[0].blobSha, 'b1');
  assert.equal(d.version, 2);
});

test('rebaseDraft: 남이 바꾼 다른 파일은 되돌리지 않는다 (Codex 지적 1)', () => {
  const kept = makeDraft({ baseSha: 'A', original: V1, draft: withChange(V1, 'career.yml', { career: ['c1', 'c2'] }) });
  // 그 사이 main 에서 awards 가 바뀌었다
  const V2 = withChange(V1, 'awards.yml', { awards: ['a1', 'a2'] });
  const r = rebaseDraft(kept, V2, 'B');
  assert.equal(r.unsafe, false);
  assert.deepEqual(r.draft['awards.yml'], { awards: ['a1', 'a2'] }, '남의 변경 유지');
  assert.deepEqual(r.draft['career.yml'], { career: ['c1', 'c2'] }, '내 변경 유지');
  assert.deepEqual(r.conflicts, []);
  // 다시 초안을 만들면 게시 대상은 내가 바꾼 파일뿐
  assert.deepEqual(Object.keys(makeDraft({ baseSha: 'B', original: V2, draft: r.draft }).files), ['career.yml']);
});

test('rebaseDraft: 같은 파일이 양쪽에서 바뀌면 conflicts 로 알린다', () => {
  const kept = makeDraft({ baseSha: 'A', original: V1, draft: withChange(V1, 'career.yml', { career: ['mine'] }) });
  const V2 = withChange(V1, 'career.yml', { career: ['theirs'] });
  const r = rebaseDraft(kept, V2, 'B');
  assert.deepEqual(r.conflicts, ['career.yml']);
  assert.deepEqual(r.draft['career.yml'], { career: ['mine'] });
});

test('rebaseDraft: 예전(v1) 초안 — 같은 커밋이면 적용, 다르면 unsafe', () => {
  const v1Same = { baseSha: 'A', files: withChange(V1, 'career.yml', { career: ['c9'] }) };
  const r1 = rebaseDraft(v1Same, V1, 'A');
  assert.equal(r1.unsafe, false);
  assert.deepEqual(r1.draft['career.yml'], { career: ['c9'] });
  assert.deepEqual(r1.draft['awards.yml'], V1['awards.yml']);
  const r2 = rebaseDraft({ baseSha: 'A', files: V1 }, V1, 'B');
  assert.equal(r2.unsafe, true);
});

test('saveDraft/loadDraft: 업로드 자산 정보를 잃지 않는다 (Codex 지적 2)', () => {
  const mem = new Map();
  globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
  };
  try {
    const asset = { path: 'assets/images/new.jpg', blobSha: 'abc123', size: 10 };
    saveDraft(makeDraft({ baseSha: 'A', original: V1, draft: V1, assets: [asset] }));
    assert.deepEqual(loadDraft().assets, [asset]);
    clearDraft();
    assert.equal(loadDraft(), null);
  } finally {
    delete globalThis.localStorage;
  }
});

test('관리 화면 검증: 사진 경로 등 url 필드의 로컬 자산 존재 확인 (Codex 지적 5)', () => {
  const profile = load('profile.yml');
  const known = new Set(['assets/images/profile.jpg']);
  assert.deepEqual(validateFile('profile.yml', profile, known), []);
  const bad = structuredClone(profile);
  bad.photoUrl = '/assets/images/nope.jpg';
  assert.ok(validateFile('profile.yml', bad, known).some((e) => e.includes('photoUrl') && e.includes('저장소에 없는 자산')));
  // 자산 목록을 모를 때(트리 조회가 잘린 경우)는 막지 않는다
  assert.deepEqual(validateFile('profile.yml', bad, undefined), []);
});
