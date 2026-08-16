/**
 * /admin 클라이언트 (읽기 전용 단계).
 *
 * 서버가 준 스키마로 화면을 그린다. 섹션 목록·필드 구성이 여기에 하드코딩되어
 * 있지 않으므로, content-schema.mjs 만 고치면 UI 도 따라온다.
 *
 * ★ XSS 주의: 콘텐츠에는 작성자가 넣은 인라인 HTML(<a>, <b>, <i> …)이 들어 있다.
 *   관리 화면에서는 그것을 "해석"할 이유가 없고, 해석하면 그 자체가 취약점이 된다.
 *   그래서 모든 값은 textContent 로만 넣는다. innerHTML 은 이 파일에서 쓰지 않는다.
 */

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
};

/** 리스트에서 항목을 한 줄로 요약할 때 쓸 대표 텍스트를 고른다. */
function itemSummary(item, section) {
  if (typeof item === 'string') return item;
  for (const f of section.fields) {
    const v = item?.[f.name];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '(내용 없음)';
}

function countItems(value, kind) {
  if (kind === 'list' || kind === 'list-scalar') return Array.isArray(value) ? value.length : 0;
  return value === undefined || value === null || value === '' ? 0 : 1;
}

function sectionScope(fileSchema, fileData) {
  if (!fileData) return undefined;
  return fileSchema.container ? fileData[fileSchema.container] : fileData;
}

function renderFiles(files) {
  const wrap = el('div', 'files');
  if (!Array.isArray(files) || files.length === 0) return wrap;
  for (const f of files) {
    const chip = el('span', 'file-chip');
    chip.appendChild(el('span', 'file-icon', f?.icon || '🔗'));
    chip.appendChild(el('span', 'file-tip', f?.tip || '링크'));
    chip.appendChild(el('span', 'file-url', f?.url || ''));
    wrap.appendChild(chip);
  }
  return wrap;
}

function renderFieldRow(label, value) {
  const row = el('div', 'field');
  row.appendChild(el('div', 'field-label', label));
  const val = el('div', 'field-value');
  if (value === undefined || value === null || value === '') {
    val.classList.add('empty');
    val.textContent = '(비어 있음)';
  } else {
    val.textContent = String(value);
  }
  row.appendChild(val);
  return row;
}

function renderItemDetail(item, section) {
  const box = el('div', 'item-detail');
  if (typeof item === 'string') {
    box.appendChild(renderFieldRow(section.fields[0]?.label || '값', item));
    return box;
  }
  for (const f of section.fields) {
    box.appendChild(renderFieldRow(f.label + (f.required ? ' *' : ''), item?.[f.name]));
  }
  if (section.files && Array.isArray(item?.files) && item.files.length) {
    const row = el('div', 'field');
    row.appendChild(el('div', 'field-label', '첨부'));
    const val = el('div', 'field-value');
    val.appendChild(renderFiles(item.files));
    row.appendChild(val);
    box.appendChild(row);
  }
  return box;
}

function renderSection(fileSchema, section, scope) {
  const value = scope?.[section.key];
  const wrap = el('section', 'section');

  const head = el('div', 'section-head');
  head.appendChild(el('h2', null, section.label));
  head.appendChild(el('span', 'count', countItems(value, section.kind) + '건'));
  wrap.appendChild(head);

  if (section.kind === 'scalar') {
    wrap.appendChild(renderFieldRow(section.fields[0]?.label || '값', value));
    return wrap;
  }

  if (section.kind === 'dict') {
    wrap.appendChild(renderItemDetail(value, section));
    return wrap;
  }

  const items = Array.isArray(value) ? value : [];
  if (items.length === 0) {
    wrap.appendChild(el('p', 'empty', '항목이 없습니다.'));
    return wrap;
  }

  const list = el('div', 'items');
  items.forEach((item, index) => {
    const details = el('details', 'item');
    const summary = el('summary');
    summary.appendChild(el('span', 'idx', index + 1));
    summary.appendChild(el('span', 'summary-text', itemSummary(item, section)));
    details.appendChild(summary);
    details.appendChild(renderItemDetail(item, section));
    list.appendChild(details);
  });
  wrap.appendChild(list);
  return wrap;
}

function renderNav(state) {
  const nav = document.getElementById('nav');
  nav.replaceChildren();
  for (const fileSchema of state.schema) {
    const fileData = state.files[fileSchema.file]?.data;
    const scope = sectionScope(fileSchema, fileData);
    const total = fileSchema.sections.reduce(
      (sum, s) => sum + countItems(scope?.[s.key], s.kind),
      0
    );

    const btn = el('button', 'nav-item');
    btn.type = 'button';
    btn.dataset.file = fileSchema.file;
    btn.appendChild(el('span', 'nav-label', fileSchema.label));
    btn.appendChild(el('span', 'nav-count', total));
    if (state.current === fileSchema.file) btn.classList.add('active');
    if (!fileData) {
      btn.classList.add('missing');
      btn.title = '이 파일을 읽지 못했습니다';
    }
    btn.addEventListener('click', () => {
      state.current = fileSchema.file;
      render(state);
    });
    nav.appendChild(btn);
  }
}

function renderMain(state) {
  const main = document.getElementById('main');
  main.replaceChildren();

  const fileSchema = state.schema.find((f) => f.file === state.current);
  if (!fileSchema) return;

  const fileData = state.files[fileSchema.file]?.data;
  const header = el('div', 'main-head');
  header.appendChild(el('h1', null, fileSchema.label));
  header.appendChild(el('code', 'filename', 'src/data/' + fileSchema.file));
  main.appendChild(header);

  if (!fileData) {
    main.appendChild(el('p', 'error', '이 파일을 읽지 못했습니다.'));
    return;
  }

  const scope = sectionScope(fileSchema, fileData);
  for (const section of fileSchema.sections) {
    main.appendChild(renderSection(fileSchema, section, scope));
  }
}

function render(state) {
  renderNav(state);
  renderMain(state);
}

async function boot() {
  const status = document.getElementById('status');
  try {
    const res = await fetch('/admin/api/bootstrap', { headers: { Accept: 'application/json' } });
    if (res.status === 401) {
      // 세션이 만료된 경우. 로그인으로 보낸다.
      window.location.href = '/admin/auth/login?returnTo=/admin';
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `불러오기 실패 (${res.status})`);
    }
    const data = await res.json();

    const state = {
      schema: data.schema,
      files: data.files,
      current: data.schema[0]?.file,
    };

    document.getElementById('login').textContent = data.login;
    document.getElementById('basesha').textContent = data.baseSha.slice(0, 7);
    document.getElementById('repo').textContent = data.repo || '';

    if (Array.isArray(data.warnings) && data.warnings.length) {
      const warn = document.getElementById('warnings');
      warn.hidden = false;
      warn.replaceChildren(el('strong', null, '경고'));
      data.warnings.forEach((w) => warn.appendChild(el('div', null, w)));
    }

    status.hidden = true;
    document.getElementById('app').hidden = false;
    render(state);
  } catch (err) {
    status.replaceChildren(el('p', 'error', err.message));
  }
}

boot();
