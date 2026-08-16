/**
 * 자산 업로드 규칙.
 *
 * khhan-admin/app/services/upload_service.py 의 규칙을 그대로 옮겼다.
 * 파일명을 ASCII 로 정규화하고 날짜와 짧은 해시를 붙여 충돌을 막는다.
 * (저장소에 이미 20260505_2023_4_bd424a.jpg 같은 이름이 있는 이유다.)
 */
import { HttpError } from './auth.js';

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const DOC_EXT = ['pdf'];
export const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
};

/** 확장자에 따라 저장 위치가 갈린다. 그 외 확장자는 받지 않는다. */
export function directoryFor(ext) {
  if (IMAGE_EXT.includes(ext)) return 'assets/images';
  if (DOC_EXT.includes(ext)) return 'assets/docs';
  return null;
}

export function extensionOf(fileName) {
  const m = String(fileName || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

/**
 * 파일명을 안전한 ASCII 로 바꾼다.
 * 한글 파일명이 그대로 URL 에 들어가면 인코딩 문제가 생기므로 걷어낸다.
 */
function asciiStem(fileName) {
  const stem = String(fileName || '').replace(/\.[^.]*$/, '');
  const ascii = stem
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // 분리된 발음기호 제거
    .replace(/[^A-Za-z0-9]+/g, '_') // 나머지 비ASCII·기호는 밑줄로
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return ascii || 'file';
}

function todayStamp(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`;
}

function shortHash() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 6);
}

/**
 * 업로드된 파일을 검사하고 저장소 경로를 정한다.
 * @param {File} file
 * @returns {{path:string, ext:string, mime:string, size:number}}
 */
export function planUpload(file) {
  if (!file || typeof file.name !== 'string') {
    throw new HttpError(400, '파일이 없습니다.');
  }
  const ext = extensionOf(file.name);
  const dir = directoryFor(ext);
  if (!dir) {
    throw new HttpError(
      400,
      `허용되지 않는 형식입니다: .${ext || '?'} — 이미지(${IMAGE_EXT.join(', ')}) 또는 pdf 만 올릴 수 있습니다.`
    );
  }
  if (file.size === 0) throw new HttpError(400, '빈 파일입니다.');
  if (file.size > MAX_BYTES) {
    throw new HttpError(400, `파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). 최대 10MB.`);
  }

  const name = `${todayStamp()}_${asciiStem(file.name)}_${shortHash()}.${ext}`;
  return { path: `${dir}/${name}`, ext, mime: MIME[ext] || 'application/octet-stream', size: file.size };
}

/** 첨부 행에 채워 넣을 기본값. 구 앱과 같은 아이콘 규칙. */
export function suggestFileMeta(originalName, ext) {
  return {
    icon: DOC_EXT.includes(ext) ? '📄' : '🖼️',
    tip: String(originalName || '').replace(/\.[^.]*$/, '').slice(0, 60),
  };
}
