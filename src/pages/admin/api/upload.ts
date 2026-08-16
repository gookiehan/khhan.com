/**
 * POST /admin/api/upload   (multipart/form-data, 필드명 file)
 *
 * 파일을 검사해 저장소 경로를 정하고, GitHub 에 **blob 만** 만들어 둔다.
 * blob 은 아직 어떤 커밋·브랜치에도 매달리지 않으므로, 게시하지 않고 그만두면
 * 저장소에는 아무것도 남지 않는다(GitHub 이 회수한다).
 *
 * 이 설계 덕분에
 *   - Worker 가 파일을 들고 있지 않아도 되고(상태 없음)
 *   - 초안이 순수 JSON 이라 localStorage 에 그대로 보관되며
 *   - 게시할 때 자산과 YAML 이 한 커밋에 함께 들어간다.
 *
 * res { path, blobSha, size, icon, tip }
 */
import { requireSession, requireSameOrigin, errorResponse, HttpError } from '../../../lib/admin/auth.js';
import { createBinaryBlob } from '../../../lib/admin/github.js';
import { planUpload, suggestFileMeta, MAX_BYTES } from '../../../lib/admin/upload.js';

export const prerender = false;

export async function POST(context) {
  try {
    await requireSession(context);
    requireSameOrigin(context.request);

    // 본문을 읽기 전에 크기부터 본다. 큰 파일을 통째로 메모리에 올릴 이유가 없다.
    const declared = Number(context.request.headers.get('Content-Length') || 0);
    if (declared && declared > MAX_BYTES * 1.4) {
      throw new HttpError(413, '파일이 너무 큽니다. 최대 10MB.');
    }

    const form = await context.request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') throw new HttpError(400, '파일이 없습니다.');

    const plan = planUpload(file);
    const bytes = await file.arrayBuffer();
    const blobSha = await createBinaryBlob(bytes);
    const meta = suggestFileMeta(file.name, plan.ext);

    return Response.json({
      path: plan.path,
      blobSha,
      size: plan.size,
      mime: plan.mime,
      ...meta,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
