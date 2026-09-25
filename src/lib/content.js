import yaml from 'js-yaml';
import { THEME_IDS, DEFAULT_THEME } from '../themes/registry.mjs';

// Vite 가 빌드 타임에 src/data/*.yml 을 문자열로 인라인한다.
// node:fs + process.cwd() 를 쓰지 않으므로
//   - astro 를 저장소 루트 밖에서 실행해도 깨지지 않고
//   - Cloudflare 어댑터가 번들할 때 node 내장 모듈이 끼어들지 않는다.
const rawYaml = import.meta.glob('../data/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * src/data/<fileName> 을 파싱해 돌려준다.
 * 호출할 때마다 새 객체를 만든다. 여러 테마가 같은 데이터를 쓰므로, 한 테마가
 * 객체를 고쳐도 다른 테마에 번지지 않게 하려는 것이다.
 * 없는 파일명을 넘기면 조용히 undefined 를 돌려주지 않고 빌드를 멈춘다.
 */
export function loadYaml(fileName) {
  const source = rawYaml[`../data/${fileName}`];
  if (source === undefined) {
    throw new Error(`[content] src/data/${fileName} 을 찾을 수 없습니다.`);
  }
  return yaml.load(source);
}

/** site.yml → { theme }. 등록되지 않은 테마면 빌드를 멈춘다(빈 사이트가 배포되지 않게). */
export function getSiteConfig() {
  const data = loadYaml('site.yml') ?? {};
  const theme = data.theme || DEFAULT_THEME;
  if (!THEME_IDS.includes(theme)) {
    throw new Error(
      `[content] site.yml 의 theme "${theme}" 은(는) 등록되지 않은 테마입니다. 사용 가능: ${THEME_IDS.join(', ')}`,
    );
  }
  return { theme };
}
