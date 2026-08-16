/**
 * unified diff. 의존성 없이 LCS 로 직접 구현한다.
 *
 * 대상이 최대 400줄 남짓(가장 큰 publications.yml)이라 O(n·m) 로 충분하고,
 * diff 라이브러리를 Worker 번들에 넣는 것보다 가볍다.
 */

/** 두 줄 배열의 최장 공통 부분수열을 따라가며 편집 스크립트를 만든다. */
function lcsOps(a, b) {
  const n = a.length;
  const m = b.length;

  // 앞뒤 공통 구간을 먼저 잘라내면 실제 DP 크기가 크게 줄어든다.
  let head = 0;
  while (head < n && head < m && a[head] === b[head]) head++;
  let tail = 0;
  while (tail < n - head && tail < m - head && a[n - 1 - tail] === b[m - 1 - tail]) tail++;

  const aMid = a.slice(head, n - tail);
  const bMid = b.slice(head, m - tail);

  const rows = aMid.length;
  const cols = bMid.length;
  const dp = Array.from({ length: rows + 1 }, () => new Uint32Array(cols + 1));
  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      dp[i][j] = aMid[i] === bMid[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops = [];
  for (let k = 0; k < head; k++) ops.push({ type: ' ', line: a[k] });

  let i = 0;
  let j = 0;
  while (i < rows && j < cols) {
    if (aMid[i] === bMid[j]) {
      ops.push({ type: ' ', line: aMid[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: '-', line: aMid[i] });
      i++;
    } else {
      ops.push({ type: '+', line: bMid[j] });
      j++;
    }
  }
  while (i < rows) ops.push({ type: '-', line: aMid[i++] });
  while (j < cols) ops.push({ type: '+', line: bMid[j++] });

  for (let k = n - tail; k < n; k++) ops.push({ type: ' ', line: a[k] });
  return ops;
}

/**
 * unified diff 를 만든다.
 * @returns {{added:number, removed:number, hunks:Array<{header:string, lines:string[]}>}}
 */
export function unifiedDiff(beforeText, afterText, context = 3) {
  const a = beforeText.replace(/\r\n/g, '\n').split('\n');
  const b = afterText.replace(/\r\n/g, '\n').split('\n');
  const ops = lcsOps(a, b);

  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.type === '+') added++;
    else if (op.type === '-') removed++;
  }
  if (added === 0 && removed === 0) return { added: 0, removed: 0, hunks: [] };

  // 변경 지점 주변 context 줄만 남긴다.
  const keep = new Array(ops.length).fill(false);
  ops.forEach((op, idx) => {
    if (op.type === ' ') return;
    for (let k = Math.max(0, idx - context); k <= Math.min(ops.length - 1, idx + context); k++) {
      keep[k] = true;
    }
  });

  const hunks = [];
  let aLine = 1;
  let bLine = 1;
  let current = null;

  ops.forEach((op, idx) => {
    const startA = aLine;
    const startB = bLine;

    if (keep[idx]) {
      if (!current) current = { startA, startB, countA: 0, countB: 0, lines: [] };
      current.lines.push(op.type + op.line);
      if (op.type !== '+') current.countA++;
      if (op.type !== '-') current.countB++;
    } else if (current) {
      hunks.push(current);
      current = null;
    }

    if (op.type !== '+') aLine++;
    if (op.type !== '-') bLine++;
  });
  if (current) hunks.push(current);

  return {
    added,
    removed,
    hunks: hunks.map((h) => ({
      header: `@@ -${h.startA},${h.countA} +${h.startB},${h.countB} @@`,
      lines: h.lines,
    })),
  };
}
