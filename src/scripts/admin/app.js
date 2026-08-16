/**
 * /admin 클라이언트.
 *
 * 서버가 준 스키마로 화면을 그린다. 섹션 목록·필드 구성이 여기에 하드코딩되어
 * 있지 않으므로, content-schema.mjs 만 고치면 UI 도 따라온다.
 *
 * ★ XSS 주의: 콘텐츠에는 작성자가 넣은 인라인 HTML(<a>, <b>, <i> …)이 들어 있다.
 *   관리 화면에서 그것을 "해석"할 이유가 없고, 해석하면 그 자체가 취약점이 된다.
 *   그래서 모든 값은 textContent / input.value 로만 넣는다.
 *   이 파일에서 innerHTML 은 쓰지 않는다.
 */
import { loadDraft, saveDraft, clearDraft } from './store.js';

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
};

const btn = (label, className, onClick, title) => {
  const b = el('button', className, label);
  b.type = 'button';
  if (title) b.title = title;
  b.addEventListener('click', onClick);
  return b;
};

const clone = (v) => JSON.parse(JSON.stringify(v));

const state = {
  schema: [],
  original: {}, // 서버에서 받은 원본 (비교용)
  draft: {}, // 편집 중인 사본
  baseSha: '',
  changeLog: [],
  current: null,
  editing: null, // { file, sectionKey, index }  index === -1 이면 새 항목
};

// ── 초안 상태 ────────────────────────────────────────────────────────────

function isDirty(file) {
  return JSON.stringify(state.draft[file]) !== JSON.stringify(state.original[file]);
}

function dirtyFiles() {
  return Object.keys(state.draft).filter(isDirty);
}

function note(message) {
  state.changeLog.push(message);
  persist();
}

function persist() {
  saveDraft({ baseSha: state.baseSha, files: state.draft, changeLog: state.changeLog });
}

function scopeOf(fileSchema, data) {
  if (!data) return undefined;
  return fileSchema.container ? data[fileSchema.container] : data;
}

function sectionValue(fileSchema, sectionKey) {
  return scopeOf(fileSchema, state.draft[fileSchema.file])?.[sectionKey];
}

function setSectionValue(fileSchema, sectionKey, value) {
  const scope = scopeOf(fileSchema, state.draft[fileSchema.file]);
  scope[sectionKey] = value;
  persist();
}

function countItems(value, kind) {
  if (kind === 'list' || kind === 'list-scalar') return Array.isArray(value) ? value.length : 0;
  return value === undefined || value === null || value === '' ? 0 : 1;
}

function blankItem(section) {
  if (section.kind === 'list-scalar') return '';
  const item = {};
  for (const f of section.fields) item[f.name] = '';
  // files 는 일부러 만들지 않는다. 첨부를 실제로 추가할 때만 생기게 해서
  // 빈 files: [] 가 데이터에 남지 않게 한다.
  return item;
}

function itemSummary(item, section) {
  if (typeof item === 'string') return item || '(비어 있음)';
  for (const f of section.fields) {
    const v = item?.[f.name];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '(내용 없음)';
}

// ── 편집 폼 ──────────────────────────────────────────────────────────────

function fieldInput(field, value, onInput) {
  const wrap = el('label', 'field-edit');
  const labelText = field.label + (field.required ? ' *' : '');
  wrap.appendChild(el('span', 'field-label', labelText));

  const multiline = field.type === 'textarea' || field.type === 'richtext';
  const input = multiline ? el('textarea') : el('input');
  if (!multiline) input.type = 'text';
  input.value = value ?? '';
  input.addEventListener('input', () => onInput(input.value));
  wrap.appendChild(input);

  if (field.type === 'richtext') {
    wrap.appendChild(el('span', 'hint', '허용 태그: b i em strong a br span'));
  }
  if (field.type === 'url') {
    wrap.appendChild(el('span', 'hint', 'assets/… 또는 http(s)://…'));
  }
  return wrap;
}

function filesEditor(item, rerender) {
  const wrap = el('div', 'files-edit');
  wrap.appendChild(el('div', 'field-label', '첨부'));

  const list = el('div', 'files-rows');
  // 여기서 item.files 를 만들어 두면, 첨부를 추가하지 않고 닫아도 files: [] 가
  // 데이터에 남아 diff 에 무관한 줄이 끼어든다. 실제로 추가할 때만 만든다.
  if (!Array.isArray(item.files)) item.files = [];
  const files = item.files;

  files.forEach((f, i) => {
    const row = el('div', 'file-row');
    for (const [key, ph] of [['icon', '아이콘'], ['tip', '설명'], ['url', 'assets/docs/파일.pdf']]) {
      const input = el('input');
      input.type = 'text';
      input.placeholder = ph;
      input.className = 'file-' + key;
      input.value = f[key] ?? '';
      input.addEventListener('input', () => {
        f[key] = input.value;
        persist();
      });
      row.appendChild(input);
    }
    row.appendChild(
      btn('✕', 'icon-btn', () => {
        files.splice(i, 1);
        persist();
        rerender();
      }, '이 첨부 삭제')
    );
    list.appendChild(row);
  });

  wrap.appendChild(list);
  wrap.appendChild(
    btn('+ 첨부 추가', 'small-btn', () => {
      files.push({ url: '', icon: '', tip: '' });
      persist();
      rerender();
    })
  );
  return wrap;
}

function renderEditor(fileSchema, section, index) {
  const isNew = index === -1;
  const list = sectionValue(fileSchema, section.key);
  const source =
    section.kind === 'dict'
      ? list
      : isNew
        ? blankItem(section)
        : list[index];

  // 편집 중에는 사본을 만들어 두고, 취소하면 버린다.
  let working = clone(source ?? blankItem(section));

  // 원래 files 키가 있었는지 기억해 둔다. 없던 항목에 빈 files: [] 를 남기면
  // 내용은 그대로인데 diff 에 줄이 하나 늘어난다(첫 게시에서 실제로 그랬다).
  const hadFiles =
    source !== null && typeof source === 'object' && !Array.isArray(source) && 'files' in source;

  /** 저장 직전 정리: 빈 첨부 행을 버리고, 없던 files 키는 만들지 않는다. */
  const tidy = (obj) => {
    if (!section.files || typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj.files)) {
      obj.files = obj.files.filter(
        (f) => f && [f.url, f.icon, f.tip].some((v) => typeof v === 'string' && v.trim())
      );
      if (obj.files.length === 0 && !hadFiles) delete obj.files;
    }
    return obj;
  };

  const box = el('div', 'editor');
  const rerender = () => {
    const fresh = renderEditorBody();
    box.replaceChildren(fresh);
  };

  function renderEditorBody() {
    const body = el('div');
    if (section.kind === 'list-scalar') {
      body.appendChild(
        fieldInput(section.fields[0], working, (v) => {
          working = v;
        })
      );
    } else {
      for (const f of section.fields) {
        body.appendChild(
          fieldInput(f, working[f.name], (v) => {
            working[f.name] = v;
          })
        );
      }
      if (section.files) body.appendChild(filesEditor(working, rerender));
    }

    const actions = el('div', 'editor-actions');
    actions.appendChild(
      btn('적용', 'primary-btn', () => {
        tidy(working);
        if (section.kind === 'dict') {
          setSectionValue(fileSchema, section.key, working);
          note(`${fileSchema.label} > ${section.label} 수정`);
        } else if (isNew) {
          const arr = sectionValue(fileSchema, section.key);
          arr.push(working);
          setSectionValue(fileSchema, section.key, arr);
          note(`${fileSchema.label} > ${section.label} 항목 추가`);
        } else {
          const arr = sectionValue(fileSchema, section.key);
          arr[index] = working;
          setSectionValue(fileSchema, section.key, arr);
          note(`${fileSchema.label} > ${section.label} #${index + 1} 수정`);
        }
        state.editing = null;
        render();
      })
    );
    actions.appendChild(
      btn('취소', null, () => {
        state.editing = null;
        render();
      })
    );
    body.appendChild(actions);
    return body;
  }

  box.appendChild(renderEditorBody());
  return box;
}

// ── 목록 렌더링 ──────────────────────────────────────────────────────────

function renderReadonlyDetail(item, section) {
  const box = el('div', 'item-detail');
  if (typeof item === 'string') {
    box.appendChild(row(section.fields[0]?.label || '값', item));
    return box;
  }
  for (const f of section.fields) box.appendChild(row(f.label, item?.[f.name]));
  if (section.files && Array.isArray(item?.files) && item.files.length) {
    const r = el('div', 'field');
    r.appendChild(el('div', 'field-label', '첨부'));
    const val = el('div', 'field-value');
    const chips = el('div', 'files');
    for (const f of item.files) {
      const chip = el('span', 'file-chip');
      chip.appendChild(el('span', 'file-icon', f?.icon || '🔗'));
      chip.appendChild(el('span', 'file-tip', f?.tip || '링크'));
      chip.appendChild(el('span', 'file-url', f?.url || ''));
      chips.appendChild(chip);
    }
    val.appendChild(chips);
    r.appendChild(val);
    box.appendChild(r);
  }
  return box;

  function row(label, value) {
    const r = el('div', 'field');
    r.appendChild(el('div', 'field-label', label));
    const val = el('div', 'field-value');
    if (value === undefined || value === null || value === '') {
      val.classList.add('empty');
      val.textContent = '(비어 있음)';
    } else {
      val.textContent = String(value);
    }
    r.appendChild(val);
    return r;
  }
}

function isEditing(file, sectionKey, index) {
  const e = state.editing;
  return e && e.file === file && e.sectionKey === sectionKey && e.index === index;
}

function renderSection(fileSchema, section) {
  const value = sectionValue(fileSchema, section.key);
  const wrap = el('section', 'section');

  const head = el('div', 'section-head');
  head.appendChild(el('h2', null, section.label));
  head.appendChild(el('span', 'count', countItems(value, section.kind) + '건'));
  wrap.appendChild(head);

  // scalar / dict — 항목이 하나뿐이라 바로 편집한다.
  if (section.kind === 'scalar' || section.kind === 'dict') {
    if (isEditing(fileSchema.file, section.key, 0)) {
      if (section.kind === 'scalar') {
        let working = value ?? '';
        const body = el('div', 'editor');
        body.appendChild(
          fieldInput(section.fields[0], working, (v) => {
            working = v;
          })
        );
        const actions = el('div', 'editor-actions');
        actions.appendChild(
          btn('적용', 'primary-btn', () => {
            setSectionValue(fileSchema, section.key, working);
            note(`${fileSchema.label} > ${section.label} 수정`);
            state.editing = null;
            render();
          })
        );
        actions.appendChild(btn('취소', null, () => { state.editing = null; render(); }));
        body.appendChild(actions);
        wrap.appendChild(body);
      } else {
        wrap.appendChild(renderEditor(fileSchema, section, 0));
      }
    } else {
      wrap.appendChild(
        section.kind === 'scalar'
          ? renderReadonlyDetail({ [section.fields[0].name]: value }, { ...section, files: false })
          : renderReadonlyDetail(value, section)
      );
      const actions = el('div', 'section-actions');
      actions.appendChild(
        btn('편집', 'small-btn', () => {
          state.editing = { file: fileSchema.file, sectionKey: section.key, index: 0 };
          render();
        })
      );
      wrap.appendChild(actions);
    }
    return wrap;
  }

  // list / list-scalar
  const items = Array.isArray(value) ? value : [];
  const list = el('div', 'items');

  items.forEach((item, index) => {
    if (isEditing(fileSchema.file, section.key, index)) {
      const editing = el('div', 'item editing');
      editing.appendChild(el('div', 'editing-head', `#${index + 1} 편집 중`));
      editing.appendChild(renderEditor(fileSchema, section, index));
      list.appendChild(editing);
      return;
    }

    const details = el('details', 'item');
    const summary = el('summary');
    summary.appendChild(el('span', 'idx', index + 1));
    summary.appendChild(el('span', 'summary-text', itemSummary(item, section)));

    const tools = el('span', 'tools');
    tools.appendChild(
      btn('편집', 'small-btn', (e) => {
        e.preventDefault();
        e.stopPropagation();
        state.editing = { file: fileSchema.file, sectionKey: section.key, index };
        render();
      })
    );
    tools.appendChild(
      btn('↑', 'icon-btn', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (index === 0) return;
        const arr = sectionValue(fileSchema, section.key);
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
        setSectionValue(fileSchema, section.key, arr);
        note(`${fileSchema.label} > ${section.label} 순서 변경`);
        render();
      }, '위로')
    );
    tools.appendChild(
      btn('↓', 'icon-btn', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const arr = sectionValue(fileSchema, section.key);
        if (index >= arr.length - 1) return;
        [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
        setSectionValue(fileSchema, section.key, arr);
        note(`${fileSchema.label} > ${section.label} 순서 변경`);
        render();
      }, '아래로')
    );
    tools.appendChild(
      btn('삭제', 'icon-btn danger', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const label = itemSummary(item, section).slice(0, 40);
        if (!confirm(`삭제할까요?\n\n${label}\n\n게시하기 전에는 되돌릴 수 있습니다.`)) return;
        const arr = sectionValue(fileSchema, section.key);
        arr.splice(index, 1);
        setSectionValue(fileSchema, section.key, arr);
        note(`${fileSchema.label} > ${section.label} 항목 삭제: ${label}`);
        render();
      }, '삭제')
    );
    summary.appendChild(tools);

    details.appendChild(summary);
    details.appendChild(renderReadonlyDetail(item, section));
    list.appendChild(details);
  });

  wrap.appendChild(list);

  if (isEditing(fileSchema.file, section.key, -1)) {
    const adding = el('div', 'item editing');
    adding.appendChild(el('div', 'editing-head', '새 항목'));
    adding.appendChild(renderEditor(fileSchema, section, -1));
    wrap.appendChild(adding);
  } else {
    const actions = el('div', 'section-actions');
    actions.appendChild(
      btn('+ 항목 추가', 'small-btn', () => {
        state.editing = { file: fileSchema.file, sectionKey: section.key, index: -1 };
        render();
      })
    );
    wrap.appendChild(actions);
  }

  return wrap;
}

// ── 전체 렌더 ────────────────────────────────────────────────────────────

function renderNav() {
  const nav = document.getElementById('nav');
  nav.replaceChildren();
  const dirty = new Set(dirtyFiles());

  for (const fileSchema of state.schema) {
    const scope = scopeOf(fileSchema, state.draft[fileSchema.file]);
    const total = fileSchema.sections.reduce((sum, s) => sum + countItems(scope?.[s.key], s.kind), 0);

    const b = el('button', 'nav-item');
    b.type = 'button';
    b.appendChild(el('span', 'nav-label', fileSchema.label));
    if (dirty.has(fileSchema.file)) b.appendChild(el('span', 'dot', '●'));
    b.appendChild(el('span', 'nav-count', total));
    if (state.current === fileSchema.file) b.classList.add('active');
    if (!state.draft[fileSchema.file]) {
      b.classList.add('missing');
      b.title = '이 파일을 읽지 못했습니다';
    }
    b.addEventListener('click', () => {
      state.current = fileSchema.file;
      state.editing = null;
      render();
    });
    nav.appendChild(b);
  }
}

function renderMain() {
  const main = document.getElementById('main');
  main.replaceChildren();

  const fileSchema = state.schema.find((f) => f.file === state.current);
  if (!fileSchema) return;

  const header = el('div', 'main-head');
  header.appendChild(el('h1', null, fileSchema.label));
  header.appendChild(el('code', 'filename', 'src/data/' + fileSchema.file));
  if (isDirty(fileSchema.file)) header.appendChild(el('span', 'badge', '변경됨'));
  main.appendChild(header);

  if (!state.draft[fileSchema.file]) {
    main.appendChild(el('p', 'error', '이 파일을 읽지 못했습니다.'));
    return;
  }
  for (const section of fileSchema.sections) main.appendChild(renderSection(fileSchema, section));
}

function renderToolbar() {
  const changed = dirtyFiles();
  const count = state.changeLog.length;
  document.getElementById('change-count').textContent =
    changed.length === 0 ? '변경 없음' : `변경 ${count}건 · 파일 ${changed.length}개`;
  document.getElementById('btn-diff').disabled = changed.length === 0;
  document.getElementById('btn-publish').disabled = changed.length === 0;
  document.getElementById('btn-discard').disabled = changed.length === 0;
}

function render() {
  renderNav();
  renderMain();
  renderToolbar();
}

// ── 서버 통신 ────────────────────────────────────────────────────────────

function draftPayload() {
  const files = {};
  for (const name of dirtyFiles()) files[name] = state.draft[name];
  return files;
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function showPanel(title, build) {
  const panel = document.getElementById('panel');
  panel.replaceChildren();
  const head = el('div', 'panel-head');
  head.appendChild(el('h2', null, title));
  head.appendChild(btn('닫기', 'small-btn', () => { panel.hidden = true; }));
  panel.appendChild(head);
  panel.appendChild(build());
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function showDiff() {
  showPanel('변경사항', () => el('p', null, '불러오는 중…'));
  const { ok, data } = await postJson('/admin/api/diff', {
    baseSha: state.baseSha,
    files: draftPayload(),
  });
  showPanel('변경사항', () => {
    const box = el('div', 'diff');
    if (!ok) {
      box.appendChild(el('p', 'error', data.error || '불러오지 못했습니다.'));
      return box;
    }
    if (data.stale) {
      box.appendChild(el('p', 'warn', 'main 이 그 사이 변경되었습니다. 게시 전에 다시 불러오세요.'));
    }
    if (!data.diffs.length) {
      box.appendChild(el('p', null, '내용 변화가 없습니다.'));
      return box;
    }
    for (const d of data.diffs) {
      box.appendChild(el('h3', 'diff-file', `${d.file}  +${d.added} −${d.removed}`));
      const pre = el('pre', 'diff-body');
      for (const hunk of d.hunks) {
        pre.appendChild(el('div', 'hunk-header', hunk.header));
        for (const line of hunk.lines) {
          const cls = line[0] === '+' ? 'add' : line[0] === '-' ? 'del' : 'ctx';
          pre.appendChild(el('div', 'line ' + cls, line));
        }
      }
      box.appendChild(pre);
    }
    return box;
  });
}

async function publish() {
  const changed = dirtyFiles();
  if (!confirm(`게시할까요?\n\n파일 ${changed.length}개, 변경 ${state.changeLog.length}건\n\nmain 에 커밋되고 1~2분 뒤 사이트에 반영됩니다.`)) return;

  const publishBtn = document.getElementById('btn-publish');
  publishBtn.disabled = true;
  publishBtn.textContent = '게시 중…';

  const { ok, status, data } = await postJson('/admin/api/publish', {
    baseSha: state.baseSha,
    files: draftPayload(),
    changeLog: state.changeLog,
  });

  publishBtn.textContent = '게시';
  renderToolbar();

  if (ok) {
    clearDraft();
    showPanel('게시 완료', () => {
      const box = el('div');
      box.appendChild(el('p', null, `${data.changedFiles.join(', ')} 을(를) 게시했습니다. 1~2분 뒤 사이트에 반영됩니다.`));
      const a = el('a', 'button-link', '커밋 보기');
      a.href = data.commitUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      box.appendChild(a);
      return box;
    });
    await boot({ silent: true });
    return;
  }

  showPanel(status === 409 ? '다시 불러와야 합니다' : '게시하지 못했습니다', () => {
    const box = el('div');
    box.appendChild(el('p', 'error', data.error || `실패 (${status})`));
    if (Array.isArray(data.errors)) {
      const ul = el('ul', 'error-list');
      for (const e of data.errors) ul.appendChild(el('li', null, e));
      box.appendChild(ul);
    }
    if (status === 409) {
      box.appendChild(
        btn('다시 불러오기 (초안 유지)', 'primary-btn', async () => {
          await boot({ keepDraft: true });
          document.getElementById('panel').hidden = true;
        })
      );
    }
    return box;
  });
}

function discard() {
  if (!confirm('게시하지 않은 변경을 모두 버릴까요?')) return;
  clearDraft();
  state.draft = clone(state.original);
  state.changeLog = [];
  state.editing = null;
  render();
}

// ── 시작 ─────────────────────────────────────────────────────────────────

async function boot({ keepDraft = false, silent = false } = {}) {
  const status = document.getElementById('status');
  if (!silent) status.hidden = false;

  try {
    const res = await fetch('/admin/api/bootstrap', { headers: { Accept: 'application/json' } });
    if (res.status === 401) {
      window.location.href = '/admin/auth/login?returnTo=/admin';
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `불러오기 실패 (${res.status})`);
    }
    const data = await res.json();

    state.schema = data.schema;
    state.baseSha = data.baseSha;
    state.original = {};
    for (const [name, entry] of Object.entries(data.files)) state.original[name] = entry.data;

    const kept = keepDraft ? { files: state.draft, changeLog: state.changeLog } : loadDraft();
    const banner = document.getElementById('banner');
    banner.hidden = true;

    if (kept && !keepDraft && kept.baseSha && kept.baseSha !== data.baseSha) {
      // 초안을 만든 뒤 main 이 움직였다. 버릴지 유지할지는 사용자가 정한다.
      state.draft = clone(state.original);
      state.changeLog = [];
      banner.hidden = false;
      banner.replaceChildren();
      banner.appendChild(el('strong', null, 'main 이 갱신되었습니다. '));
      banner.appendChild(
        el('span', null, '보관 중이던 초안은 그 이전 내용 기준이라 자동으로 적용하지 않았습니다.')
      );
      banner.appendChild(
        btn('보관된 초안 적용', 'small-btn', () => {
          state.draft = kept.files;
          state.changeLog = kept.changeLog || [];
          banner.hidden = true;
          persist();
          render();
        })
      );
      banner.appendChild(btn('초안 버리기', 'small-btn', () => { clearDraft(); banner.hidden = true; }));
    } else if (kept) {
      state.draft = kept.files;
      state.changeLog = kept.changeLog || [];
    } else {
      state.draft = clone(state.original);
      state.changeLog = [];
    }

    // 원본에는 있는데 초안에 없는 파일(스키마 추가 등)을 보정한다.
    for (const [name, value] of Object.entries(state.original)) {
      if (!(name in state.draft)) state.draft[name] = clone(value);
    }

    state.current = state.current || data.schema[0]?.file;
    state.editing = null;

    document.getElementById('login').textContent = data.login;
    document.getElementById('repo').textContent = data.repo || '';
    document.getElementById('basesha').textContent = data.baseSha.slice(0, 7);

    const warn = document.getElementById('warnings');
    if (Array.isArray(data.warnings) && data.warnings.length) {
      warn.hidden = false;
      warn.replaceChildren(el('strong', null, '경고'));
      data.warnings.forEach((w) => warn.appendChild(el('div', null, w)));
    } else {
      warn.hidden = true;
    }

    status.hidden = true;
    document.getElementById('app').hidden = false;
    render();
  } catch (err) {
    status.hidden = false;
    status.replaceChildren(el('p', 'error', err.message));
  }
}

document.getElementById('btn-diff').addEventListener('click', showDiff);
document.getElementById('btn-publish').addEventListener('click', publish);
document.getElementById('btn-discard').addEventListener('click', discard);

// 게시하지 않은 변경이 있으면 실수로 닫는 것을 막는다.
window.addEventListener('beforeunload', (e) => {
  if (dirtyFiles().length > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});

boot();
