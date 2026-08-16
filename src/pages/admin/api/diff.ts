/**
 * POST /admin/api/diff
 *
 * 초안을 받아 현재 main 과의 unified diff 를 돌려준다.
 * 게시 전에 무엇이 바뀌는지 눈으로 확인하기 위한 것이고, 아무것도 쓰지 않는다.
 *
 * req  { baseSha, files: { 'awards.yml': {…}, … } }
 * res  { stale, currentBaseSha, diffs: [{ file, added, removed, hunks }] }
 */
import { requireSession, requireSameOrigin, errorResponse, HttpError } from '../../../lib/admin/auth.js';
import { getBranchSha, readDataFiles } from '../../../lib/admin/github.js';
import { dumpYaml, loadYaml, toLf } from '../../../lib/admin/yaml.js';
import { unifiedDiff } from '../../../lib/admin/diff.js';
import { MANAGED_FILES } from '../../../lib/content-schema.mjs';

export const prerender = false;

export async function POST(context) {
  try {
    await requireSession(context);
    requireSameOrigin(context.request);

    const body = await context.request.json();
    const draft = body?.files;
    if (!draft || typeof draft !== 'object') {
      throw new HttpError(400, 'files 가 없습니다.');
    }
    const names = Object.keys(draft).filter((n) => MANAGED_FILES.includes(n));
    if (names.length === 0) {
      return Response.json({ stale: false, currentBaseSha: body?.baseSha, diffs: [] });
    }

    const currentBaseSha = await getBranchSha('main');
    const original = await readDataFiles(names, currentBaseSha);

    const diffs = [];
    for (const name of names) {
      const before = original[name]?.raw;
      if (before === undefined) {
        throw new HttpError(502, `${name} 을 읽지 못했습니다.`);
      }
      // 원본도 dump 를 거쳐 비교한다. 그래야 "정규 포맷 차이"가 아니라
      // 실제 내용 변화만 보인다.
      const beforeNormalized = dumpYaml(loadYaml(toLf(before)));
      const afterText = dumpYaml(draft[name]);
      const d = unifiedDiff(beforeNormalized, afterText);
      if (d.added || d.removed) diffs.push({ file: `src/data/${name}`, ...d });
    }

    return Response.json({
      stale: Boolean(body?.baseSha) && body.baseSha !== currentBaseSha,
      currentBaseSha,
      diffs,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
