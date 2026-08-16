/**
 * 콘텐츠 YAML 의 정규 직렬화 형식.
 *
 * ★ 이 옵션은 scripts/normalize-yaml.mjs 와 반드시 같아야 한다.
 *   하나라도 어긋나면 /admin 이 게시할 때마다 포맷 드리프트가 되살아나고,
 *   CI 의 validate:yaml-format 이 매번 실패한다. 그래서 여기에만 정의하고
 *   normalize-yaml.mjs 가 이 파일을 가져다 쓴다.
 *
 * 이 파일은 Worker 번들에 들어가므로 node: 내장 모듈을 import 하지 않는다.
 */
import yaml from 'js-yaml';

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

export function loadYaml(text) {
  return yaml.load(text);
}

/**
 * 워킹트리가 CRLF 일 수 있으므로 비교 전 줄바꿈을 통일한다.
 * git 은 .gitattributes(eol=lf)로 흡수하지만, 우리가 직접 비교할 때는 필요하다.
 */
export function toLf(text) {
  return text.replace(/\r\n/g, '\n');
}
