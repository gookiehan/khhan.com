/**
 * POST /admin/api/publish
 *
 * 초안을 main 에 단일 커밋으로 올린다. 이 사이트에서 저장소에 쓰는 유일한 지점이다.
 *
 * 순서가 중요하다:
 *   1) 세션 확인 (관문)
 *   2) baseSha 대조 → 다르면 409, 아무것도 쓰지 않음
 *   3) 스키마 검증 → 실패하면 400, 아무것도 쓰지 않음
 *   4) 실제 변경이 있는 파일만 추려 커밋
 * main 직접 커밋이라 CI 는 사후에 돌기 때문에, 3)이 마지막 방어선이다.
 *
 * req  { baseSha, files, changeLog? }
 * res  { commitSha, commitUrl, changedFiles }
 */
import { requireSession, requireSameOrigin, errorResponse, HttpError } from '../../../lib/admin/auth.js';
import { getBranchSha, readDataFiles, listAssetPaths, commitFiles } from '../../../lib/admin/github.js';
import { dumpYaml, loadYaml, toLf } from '../../../lib/admin/yaml.js';
import { validateFiles } from '../../../lib/admin/validate.js';
import { MANAGED_FILES } from '../../../lib/content-schema.mjs';

export const prerender = false;

function buildMessage(changedFiles, changeLog, login, assets = []) {
  const subject =
    changedFiles.length === 1
      ? `content: update ${changedFiles[0]}`
      : changedFiles.length === 0
        ? `content: add ${assets.length} asset(s)`
        : `content: update ${changedFiles.length} files`;

  const lines = [subject, ''];
  if (changedFiles.length) {
    lines.push('변경된 파일:');
    for (const f of changedFiles) lines.push(`- src/data/${f}`);
  }
  if (assets.length) {
    lines.push('', '추가된 자산:');
    for (const a of assets) lines.push(`- ${a.path}`);
  }
  if (Array.isArray(changeLog) && changeLog.length) {
    lines.push('', '변경 내역:');
    for (const entry of changeLog.slice(0, 50)) lines.push(`- ${String(entry).slice(0, 200)}`);
  }
  lines.push('', `khhan.com/admin 에서 ${login} 이(가) 게시함`);
  return lines.join('\n');
}

export async function POST(context) {
  try {
    const session = await requireSession(context);
    requireSameOrigin(context.request);

    const body = await context.request.json();
    const draft = body?.files;
    if (!draft || typeof draft !== 'object') throw new HttpError(400, 'files 가 없습니다.');
    if (!body?.baseSha) throw new HttpError(400, 'baseSha 가 없습니다.');

    const names = Object.keys(draft).filter((n) => MANAGED_FILES.includes(n));
    const unknown = Object.keys(draft).filter((n) => !MANAGED_FILES.includes(n));
    if (unknown.length) throw new HttpError(400, `관리 대상이 아닌 파일: ${unknown.join(', ')}`);
    if (names.length === 0) throw new HttpError(400, '변경된 파일이 없습니다.');

    // ── 2) main 이 그 사이 움직였는지
    const currentBaseSha = await getBranchSha('main');
    if (currentBaseSha !== body.baseSha) {
      return Response.json(
        { error: 'main 이 그 사이 변경되었습니다. 다시 불러온 뒤 시도하세요.', stale: true, currentBaseSha },
        { status: 409 }
      );
    }

    // 이번 게시에 함께 올릴 자산(업로드 때 blob 만 만들어 둔 것들)
    const assets = Array.isArray(body?.assets) ? body.assets : [];
    for (const a of assets) {
      if (!a?.path || !a?.blobSha) throw new HttpError(400, '자산 정보가 올바르지 않습니다.');
      if (!a.path.startsWith('assets/images/') && !a.path.startsWith('assets/docs/')) {
        throw new HttpError(400, `자산 경로가 허용 범위를 벗어납니다: ${a.path}`);
      }
    }

    // ── 3) 검증. 자산 존재 확인까지 포함한다.
    const { paths: assetPaths, truncated } = await listAssetPaths(currentBaseSha);
    // 방금 올린 자산은 아직 저장소 트리에 없지만 이 커밋에 함께 들어가므로
    // "있는 것"으로 쳐야 한다. 안 그러면 자기가 올린 파일을 자기가 거부한다.
    for (const a of assets) assetPaths.add(a.path);

    const errors = validateFiles(
      Object.fromEntries(names.map((n) => [n, draft[n]])),
      truncated ? undefined : assetPaths
    );
    if (errors.length) {
      return Response.json({ error: '검증에 실패했습니다.', errors }, { status: 400 });
    }

    // ── 4) 실제로 달라진 파일만 커밋한다(내용이 같으면 빈 커밋이 생기지 않게).
    const original = await readDataFiles(names, currentBaseSha);
    const toCommit = {};
    const changedFiles = [];
    for (const name of names) {
      const before = original[name]?.raw;
      if (before === undefined) throw new HttpError(502, `${name} 을 읽지 못했습니다.`);
      const beforeNormalized = dumpYaml(loadYaml(toLf(before)));
      const afterText = dumpYaml(draft[name]);
      if (afterText !== beforeNormalized) {
        toCommit[`src/data/${name}`] = afterText;
        changedFiles.push(name);
      }
    }
    // 실제로 참조되는 자산만 커밋한다. 올렸다가 첨부에서 지운 파일이
    // 저장소에 쓰레기로 남지 않게 하려는 것이다.
    const referenced = new Set();
    const collect = (v) => {
      if (Array.isArray(v)) return v.forEach(collect);
      if (v && typeof v === 'object') {
        if (Array.isArray(v.files)) {
          for (const f of v.files) {
            if (typeof f?.url === 'string') referenced.add(f.url.replace(/^\//, ''));
          }
        }
        for (const [k, child] of Object.entries(v)) if (k !== 'files') collect(child);
      }
    };
    for (const n of names) collect(draft[n]);
    const usedAssets = assets.filter((a) => referenced.has(a.path));

    if (changedFiles.length === 0 && usedAssets.length === 0) {
      return Response.json({ error: '바뀐 내용이 없습니다.', noChanges: true }, { status: 400 });
    }

    const result = await commitFiles({
      baseSha: currentBaseSha,
      files: toCommit,
      assets: usedAssets,
      message: buildMessage(changedFiles, body.changeLog, session.login, usedAssets),
    });

    return Response.json({ ...result, changedFiles, uploadedAssets: usedAssets.map((a) => a.path) });
  } catch (err) {
    return errorResponse(err);
  }
}
