/**
 * 게시 전 서버측 검증.
 *
 * 이것이 관문이다. main 직접 커밋 방식이라 CI 는 게시 이후에야 돌기 때문에,
 * 잘못된 내용이 main 에 들어가는 것을 막는 마지막 지점이 여기다.
 *
 * ★ scripts/validate-content.mjs / validate-links.mjs 와 같은 content-schema.mjs 를
 *   쓴다. 그래서 여기를 통과한 내용은 CI 도 통과한다. 검사 항목을 늘릴 때는
 *   두 곳이 어긋나지 않는지 항상 확인할 것.
 */
import { SCHEMA, getSectionScope, isListKind } from '../content-schema.mjs';

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/**
 * 콘텐츠에 허용하는 인라인 HTML.
 * src/utils/richText.js 의 sanitizeRichText allowlist 와 같아야 한다.
 * 빌드 타임에 실제 살균은 그쪽이 하고, 여기서는 명백히 위험한 것을 미리 거부한다.
 * (sanitize-html 은 무거워서 Worker 번들에 넣지 않는다 — 정규식 검사로 충분하다.)
 */
const DANGEROUS = [
  { re: /<\s*script\b/i, why: '<script> 는 넣을 수 없습니다.' },
  { re: /<\s*iframe\b/i, why: '<iframe> 은 넣을 수 없습니다.' },
  { re: /<\s*style\b/i, why: '<style> 은 넣을 수 없습니다.' },
  { re: /<\s*object\b|<\s*embed\b/i, why: '<object>/<embed> 는 넣을 수 없습니다.' },
  { re: /\son\w+\s*=/i, why: 'onclick 같은 이벤트 속성은 넣을 수 없습니다.' },
  { re: /javascript\s*:/i, why: 'javascript: 스킴은 넣을 수 없습니다.' },
  { re: /data\s*:\s*text\/html/i, why: 'data:text/html 은 넣을 수 없습니다.' },
];

function checkDangerousHtml(value, where, errors) {
  if (typeof value !== 'string') return;
  for (const { re, why } of DANGEROUS) {
    if (re.test(value)) errors.push(`${where}: ${why}`);
  }
}

/** files[].url 과 orgUrl 등에 허용하는 형태 */
export function isAllowedUrl(url) {
  if (typeof url !== 'string') return false;
  const u = url.trim();
  if (!u) return false;
  return (
    u.startsWith('assets/') ||
    u.startsWith('/assets/') ||
    u.startsWith('http://') ||
    u.startsWith('https://') ||
    u.startsWith('mailto:')
  );
}

/** 한 항목의 files[] 배열을 검사한다(파일 여러 개를 검사하는 validateFiles 와 다르다). */
function validateAttachments(files, where, errors, knownAssets) {
  if (files === undefined) return;
  if (!Array.isArray(files)) {
    errors.push(`${where}.files: 배열이어야 합니다.`);
    return;
  }
  files.forEach((f, i) => {
    const at = `${where}.files[${i}]`;
    if (!isObject(f)) {
      errors.push(`${at}: 객체여야 합니다.`);
      return;
    }
    if (isBlank(f.url)) {
      errors.push(`${at}.url: 필수입니다.`);
      return;
    }
    if (!isAllowedUrl(f.url)) {
      errors.push(`${at}.url: 허용되지 않는 형식입니다 — ${f.url}`);
      return;
    }
    // 로컬 자산은 실제로 저장소에 있어야 한다. CI 의 validate-links 와 같은 검사를
    // 게시 전으로 당겨온 것이다(이 검사가 없으면 깨진 링크가 main 에 들어간 뒤에야
    // CI 가 빨개진다).
    if (knownAssets && (f.url.startsWith('assets/') || f.url.startsWith('/assets/'))) {
      const key = f.url.startsWith('/') ? f.url.slice(1) : f.url;
      if (!knownAssets.has(key)) {
        errors.push(`${at}.url: 저장소에 없는 자산입니다 — ${f.url}`);
      }
    }
    for (const k of ['icon', 'tip']) {
      if (f[k] !== undefined && typeof f[k] !== 'string') {
        errors.push(`${at}.${k}: 문자열이어야 합니다.`);
      }
    }
    checkDangerousHtml(f.tip, `${at}.tip`, errors);
  });
}

function validateItem(item, section, where, errors, knownAssets) {
  if (!isObject(item)) {
    errors.push(`${where}: 객체여야 합니다.`);
    return;
  }
  for (const field of section.fields) {
    const value = item[field.name];
    const at = `${where}.${field.name}`;

    if (field.required && isBlank(value)) {
      errors.push(`${at}: "${field.label}" 은(는) 필수입니다.`);
      continue;
    }
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') {
      errors.push(`${at}: 문자열이어야 합니다.`);
      continue;
    }
    if (field.type === 'url' && !isBlank(value) && !isAllowedUrl(value)) {
      errors.push(`${at}: 허용되지 않는 URL 형식입니다 — ${value}`);
    }
    // textarea/text 는 HTML 을 쓰지 않는 필드이므로 richtext 보다 엄격히 볼 수도
    // 있으나, 기존 데이터에 <br> 등이 섞여 있을 수 있어 위험한 것만 막는다.
    checkDangerousHtml(value, at, errors);
  }
  if (section.files) validateAttachments(item.files, where, errors, knownAssets);
}

/**
 * 파일 하나를 검증한다.
 * @param {string} fileName  예: 'awards.yml'
 * @param {any} data         파싱된 내용
 * @param {Set<string>} [knownAssets]  저장소에 존재하는 자산 경로('assets/...')
 * @returns {string[]} 오류 메시지 배열 (비면 통과)
 */
export function validateFile(fileName, data, knownAssets) {
  const errors = [];
  const fileSchema = SCHEMA.find((f) => f.file === fileName);
  if (!fileSchema) {
    errors.push(`${fileName}: 관리 대상 파일이 아닙니다.`);
    return errors;
  }
  if (!isObject(data)) {
    errors.push(`${fileName}: 최상위는 객체여야 합니다.`);
    return errors;
  }
  if (fileSchema.container && !isObject(data[fileSchema.container])) {
    errors.push(`${fileName}.${fileSchema.container}: 객체여야 합니다.`);
    return errors;
  }

  const scope = getSectionScope(fileName, data);
  const label = fileSchema.container ? `${fileName}.${fileSchema.container}` : fileName;

  // 스키마에 없는 키가 생기면 사이트가 조용히 무시하므로 미리 알린다.
  const known = new Set(fileSchema.sections.map((s) => s.key));
  for (const key of Object.keys(scope)) {
    if (!known.has(key)) errors.push(`${label}.${key}: 스키마에 없는 항목입니다.`);
  }

  for (const section of fileSchema.sections) {
    const where = `${label}.${section.key}`;
    if (!(section.key in scope)) {
      errors.push(`${where}: 없어서는 안 되는 항목입니다.`);
      continue;
    }
    const value = scope[section.key];

    if (section.kind === 'scalar') {
      if (typeof value !== 'string') {
        errors.push(`${where}: 문자열이어야 합니다.`);
      } else {
        if (section.fields[0]?.required && isBlank(value)) errors.push(`${where}: 필수입니다.`);
        if (section.fields[0]?.type === 'url' && !isBlank(value) && !isAllowedUrl(value)) {
          errors.push(`${where}: 허용되지 않는 URL 형식입니다 — ${value}`);
        }
        checkDangerousHtml(value, where, errors);
      }
      continue;
    }

    if (section.kind === 'dict') {
      validateItem(value, section, where, errors, knownAssets);
      continue;
    }

    if (!Array.isArray(value)) {
      errors.push(`${where}: 배열이어야 합니다.`);
      continue;
    }
    value.forEach((item, i) => {
      const at = `${where}[${i}]`;
      if (section.kind === 'list-scalar') {
        if (typeof item !== 'string') {
          errors.push(`${at}: 문자열이어야 합니다.`);
        } else if (isBlank(item)) {
          errors.push(`${at}: 비어 있을 수 없습니다.`);
        } else {
          checkDangerousHtml(item, at, errors);
        }
        return;
      }
      validateItem(item, section, at, errors, knownAssets);
    });
  }

  return errors;
}

/** 여러 파일을 한꺼번에. 반환값이 비면 게시해도 좋다는 뜻이다. */
export function validateFiles(filesByName, knownAssets) {
  const errors = [];
  for (const [name, data] of Object.entries(filesByName)) {
    errors.push(...validateFile(name, data, knownAssets));
  }
  return errors;
}
