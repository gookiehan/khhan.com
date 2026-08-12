/**
 * src/data/*.yml 을 js-yaml 정규 포맷으로 재작성한다.
 *
 * 왜 필요한가:
 * 기존 파일 중 일부는 PyYAML(구 khhan-admin)이 썼고 일부는 손으로 썼기 때문에
 * 배열 들여쓰기 규약(`key:\n- item` vs `key:\n  - item`)과 80칼럼 줄접힘이
 * 파일마다 다르다. /admin 이 js-yaml 로 파일을 쓰기 시작하면 첫 게시 커밋
 * 하나가 1,000줄 넘게 건드려 이후 이력이 읽히지 않는다. 그래서 포맷 변경만
 * 담은 커밋을 먼저 분리해 둔다.
 *
 * 사용법:
 *   node scripts/normalize-yaml.mjs           재작성
 *   node scripts/normalize-yaml.mjs --check   드리프트가 있으면 exit 1 (CI용)
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');

// src/lib/admin/yaml.js 가 게시할 때 쓰는 옵션과 반드시 동일해야 한다.
// 하나라도 어긋나면 게시할 때마다 포맷 드리프트가 되살아난다.
export const DUMP_OPTS = {
  noRefs: true, // 같은 문자열이 반복돼도 앵커/별칭(*ref)을 만들지 않는다
  lineWidth: -1, // 줄 접힘 금지 → 항목 1개 = 라인 1개, git diff 가 사람이 읽힌다
  indent: 2,
  quotingType: '"',
  forceQuotes: false, // ★ true 금지 — 한글/HTML 전체가 이스케이프 재작성돼 diff 폭발
  sortKeys: false, // 키 순서 보존 (PyYAML sort_keys=False 대응)
};

export function dumpYaml(data) {
  return yaml.dump(data, DUMP_OPTS);
}

const files = fs
  .readdirSync(dataDir)
  .filter((name) => name.endsWith('.yml'))
  .sort();

// 워킹트리는 core.autocrlf 때문에 CRLF일 수 있다. 줄바꿈 차이는 git이
// .gitattributes(eol=lf)로 흡수하므로 "포맷 드리프트"로 세면 안 된다.
// 안 그러면 Windows 체크아웃에서 --check 가 영원히 실패한다.
function toLf(text) {
  return text.replace(/\r\n/g, '\n');
}

function countChangedLines(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  let same = 0;
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    if (a[i] === b[i]) same += 1;
  }
  return max - same;
}

function run() {
  const checkOnly = process.argv.includes('--check');
  const drifted = [];
  const crlfOnly = [];
  const errors = [];

  for (const name of files) {
    const filePath = path.join(dataDir, name);
    const raw = fs.readFileSync(filePath, 'utf8');
    const before = toLf(raw);
    const crlf = raw !== before;

    let data;
    try {
      data = yaml.load(before);
    } catch (error) {
      errors.push(`${name}: parse failed — ${error.message}`);
      continue;
    }
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      errors.push(`${name}: top-level must be a mapping`);
      continue;
    }

    const after = dumpYaml(data);

    // 멱등성 확인: 정규화 결과를 다시 통과시켜도 같아야 한다.
    // 아니라면 dump 옵션이 정보를 잃고 있다는 뜻이므로 즉시 멈춘다.
    if (dumpYaml(yaml.load(after)) !== after) {
      errors.push(`${name}: dump is not idempotent — 옵션이 정보를 잃고 있음`);
      continue;
    }

    if (after !== before) {
      drifted.push({ name, lines: countChangedLines(before, after) });
      if (!checkOnly) fs.writeFileSync(filePath, after, 'utf8');
    } else if (crlf && !checkOnly) {
      // 내용은 이미 정규 포맷이고 줄바꿈만 CRLF인 경우 — LF로 통일해 둔다.
      fs.writeFileSync(filePath, after, 'utf8');
      crlfOnly.push(name);
    }
  }

  if (errors.length > 0) {
    console.error('YAML 정규화 실패:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  if (drifted.length === 0) {
    console.log(`OK — ${files.length}개 파일 모두 정규 포맷입니다.`);
    if (crlfOnly.length > 0) {
      console.log(`  (줄바꿈만 LF로 통일: ${crlfOnly.join(', ')})`);
    }
    return;
  }

  const total = drifted.reduce((sum, d) => sum + d.lines, 0);
  if (checkOnly) {
    console.error(`정규 포맷이 아닌 파일 ${drifted.length}개 (총 ${total}줄):`);
    drifted.forEach((d) => console.error(`  - ${d.name} (${d.lines}줄)`));
    console.error('\n`npm run normalize:yaml` 을 실행한 뒤 커밋하세요.');
    process.exit(1);
  }

  console.log(`재작성 ${drifted.length}개 파일 (총 ${total}줄):`);
  drifted.forEach((d) => console.log(`  - ${d.name} (${d.lines}줄)`));
}

// --check / 재작성은 직접 실행할 때만. import 시에는 DUMP_OPTS/dumpYaml만 노출.
// (Windows 경로 때문에 문자열 비교 대신 pathToFileURL 로 정규화한다)
// (process.argv[1] 은 `node -e` 로 import 될 때 undefined 이므로 먼저 확인한다)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}
