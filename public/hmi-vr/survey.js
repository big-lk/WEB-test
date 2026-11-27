// 问卷页的共用逻辑：按 survey-items.js 的定义画题、检查是否答完、带 pid 保存。
// 保存：先发给电脑端 server.py（…/survey?pid=&form=）；发不出去时（例如只是静态网页）改为下载 JSON 文件。
const qs = new URLSearchParams(location.search);
if (qs.get('ids') === '1') document.body.classList.add('show-ids');   // 填条目文字时用：显示每题的编号
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v); }
  for (const k of kids) n.append(k); return n;
};
const radio = (name, value, label) => el('label', { class: 'opt' }, el('input', { type: 'radio', name, value: String(value) }), el('span', { text: label }));

function renderSection(sec) {
  const box = el('section', { class: 'card' }, el('h2', { text: sec.title }));
  if (sec.intro) box.append(el('p', { class: 'intro', text: sec.intro }));
  for (const it of sec.items) {
    const q = el('fieldset', { class: 'q', 'data-id': it.id });
    if (sec.type === 'pair') {
      const row = el('div', { class: 'row pair' }, el('span', { class: 'end', text: it.left }));
      for (let v = sec.scale.min; v <= sec.scale.max; v++) row.append(radio(it.id, v, v > 0 ? `+${v}` : String(v)));
      row.append(el('span', { class: 'end', text: it.right })); q.append(el('legend', { class: 'idonly', text: it.id }), row);
    } else {
      q.append(el('legend', { text: it.text }, el('small', { text: ' ' + it.id })));
      if (sec.type === 'choice') {
        const row = el('div', { class: 'row' }); it.options.forEach(o => row.append(radio(it.id, o, o))); q.append(row);
        if (it.extra) {
          const ex = el('label', { class: 'extra', hidden: '' }, el('span', { text: it.extra.label + ' ' }), el('input', { type: 'number', min: '0', max: '80', name: it.extra.id }));
          q.append(ex); row.addEventListener('change', e => { ex.hidden = e.target.value !== it.extra.showIf; });
        }
      } else if (sec.type === 'scale') {
        const row = el('div', { class: 'row' }); const s = sec.scale;
        if (s.left) row.append(el('span', { class: 'end', text: s.left }));
        for (let v = s.min; v <= s.max; v++) row.append(radio(it.id, v, s.labels ? `${v}（${s.labels[v - s.min]}）` : String(v)));
        if (s.right) row.append(el('span', { class: 'end', text: s.right })); q.append(row);
      } else if (sec.type === 'slider') {
        const s = sec.scale, out = el('output', { text: '未作答' });
        const inp = el('input', { type: 'range', min: s.min, max: s.max, step: s.step, name: it.id, value: String((s.min + s.max) / 2), 'data-touched': '0' });
        inp.addEventListener('input', () => { inp.dataset.touched = '1'; out.textContent = inp.value; });
        inp.addEventListener('pointerdown', () => { inp.dataset.touched = '1'; out.textContent = inp.value; });
        q.append(el('div', { class: 'row slider' }, el('span', { class: 'end', text: s.left }), inp, el('span', { class: 'end', text: s.right }), out));
      }
    }
    box.append(q);
  }
  return box;
}

function collect(sections, root) {
  const answers = {}, missing = [];
  for (const sec of sections) for (const it of sec.items) {
    const q = root.querySelector(`[data-id="${it.id}"]`); let v = null;
    if (sec.type === 'slider') { const inp = q.querySelector('input'); v = inp.dataset.touched === '1' ? +inp.value : null; }
    else { const c = q.querySelector('input[type=radio]:checked'); v = c ? (sec.type === 'choice' ? c.value : +c.value) : null; }
    q.classList.toggle('missing', v == null);
    if (v == null) missing.push(it.id); else answers[it.id] = v;
    if (it.extra) { const ex = q.querySelector(`[name="${it.extra.id}"]`); if (ex && ex.value !== '') answers[it.extra.id] = +ex.value; }
  }
  return { answers, missing };
}

export function initSurvey({ form, sections, consent, onSaved }) {
  const root = document.getElementById('form'), msg = document.getElementById('msg');
  const pidInput = document.getElementById('pid');
  pidInput.value = qs.get('pid') || localStorage.getItem('hmi_pid') || '';
  const cond = qs.get('cond') || localStorage.getItem('hmi_cond') || '';
  let agree = null;
  if (consent) {
    const box = el('section', { class: 'card' }, el('h2', { text: consent.title }));
    consent.paragraphs.forEach(p => box.append(el('p', { text: p })));
    agree = el('input', { type: 'checkbox', id: 'agree' });
    box.append(el('label', { class: 'opt agree' }, agree, el('span', { text: consent.agree }))); root.append(box);
  }
  sections.forEach(s => root.append(renderSection(s)));
  const started = new Date().toISOString();
  document.getElementById('submit').addEventListener('click', async () => {
    const pid = pidInput.value.trim();
    const { answers, missing } = collect(sections, root);
    if (!pid) { msg.textContent = '请先填写编号。'; pidInput.focus(); return; }
    if (agree && !agree.checked) { msg.textContent = '需要先勾选同意，才能继续。'; agree.focus(); return; }
    if (missing.length) { msg.textContent = `还有 ${missing.length} 题没有回答，已用红框标出。`; root.querySelector('.missing').scrollIntoView({ block: 'center' }); return; }
    const rec = { pid, form, cond, started_at: started, submitted_at: new Date().toISOString(), consent: agree ? true : undefined, answers };
    localStorage.setItem('hmi_pid', pid); if (cond) localStorage.setItem('hmi_cond', cond);
    localStorage.setItem(`hmi_survey_${form}_${pid}`, JSON.stringify(rec));
    let saved = false;
    try {
      const r = await fetch(`./survey?pid=${encodeURIComponent(pid)}&form=${form}`, { method: 'POST', body: JSON.stringify(rec), headers: { 'Content-Type': 'application/json' } });
      saved = r.ok && (await r.json()).ok === true;
    } catch (e) { /* 没有连电脑端服务 */ }
    if (!saved) {   // 发不出去：下载到本机，交给实验者
      const a = el('a', { href: URL.createObjectURL(new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' })), download: `${pid}_survey_${form}.json` }); a.click();
      msg.textContent = '没能发送到电脑端，已把回答下载为文件，请交给实验者。';
    } else msg.textContent = '已保存。';
    document.body.dataset.saved = saved ? 'server' : 'download';
    onSaved({ pid, cond, saved });
  });
}
