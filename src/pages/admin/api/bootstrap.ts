/**
 * GET /admin/api/bootstrap
 *
 * 관리 화면이 처음 뜰 때 필요한 것을 한 번에 준다:
 *   - baseSha : 읽은 시점의 main 커밋 sha. 나중에 게시할 때 이 값을 되돌려 보내
 *               그 사이 main 이 움직였는지(409 stale) 판정한다.
 *   - files   : 12개 YAML 을 파싱한 결과 + 원문
 *   - schema  : 렌더링에 필요한 스키마 (클라이언트가 따로 가져오지 않도록)
 */
import { requireSession, errorResponse, HttpError, env } from '../../../lib/admin/auth.js';
import { getBranchSha, readDataFiles, getRateLimitRemaining, getTokenExpiry } from '../../../lib/admin/github.js';
import { loadYaml } from '../../../lib/admin/yaml.js';
import { SCHEMA, MANAGED_FILES } from '../../../lib/content-schema.mjs';

export const prerender = false;

export async function GET(context) {
  try {
    // ★ 첫 줄에서 세션을 확인한다. 이게 GITHUB_TOKEN 을 지키는 관문이다.
    const session = await requireSession(context);

    const baseSha = await getBranchSha('main');
    const raw = await readDataFiles(MANAGED_FILES, baseSha);

    const files: Record<string, unknown> = {};
    const warnings: string[] = [];

    for (const name of MANAGED_FILES) {
      const entry = raw[name];
      if (entry?.error) {
        warnings.push(`${name}: ${entry.error}`);
        continue;
      }
      try {
        files[name] = { data: loadYaml(entry.raw), raw: entry.raw };
      } catch (err) {
        warnings.push(`${name}: YAML 파싱 실패 — ${(err as Error).message}`);
      }
    }

    if (Object.keys(files).length === 0) {
      throw new HttpError(502, '콘텐츠 파일을 하나도 읽지 못했습니다. ' + warnings.join(' / '));
    }

    return new Response(
      JSON.stringify({
        login: session.login,
        repo: env.GITHUB_REPO,
        baseSha,
        schema: SCHEMA,
        files,
        warnings,
        rateLimitRemaining: getRateLimitRemaining(),
        tokenExpiry: getTokenExpiry(),
      }),
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          // 미들웨어가 no-store 를 붙이지만, 이 응답은 특히 캐시되면 안 되므로 명시한다.
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    return errorResponse(err);
  }
}
