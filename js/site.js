// ===== 首页：改款案例 / 改款部位 / 7 步选配台 =====
(function () {
  const CF = window.CF;
  const $ = (id) => document.getElementById(id);
  if (!CF || !$('pane')) return;

  const LETTERS = ['A', 'B', 'C'];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const money = (n) => Math.round(n).toLocaleString('en-US');
  const usd = (n) => (n ? '+$' + n : '+$0');

  const S = {
    brand: 'CHRONO LAB',
    styles: [{ cfg: clone(CF.PRESET.A), qty: 25 }, { cfg: clone(CF.PRESET.B), qty: 25 }],
    cur: 0,
    step: 1,
    view: 'front',
    ruler: true,
    render: false,
    zone: 1
  };
  const cfgOf = (i) => Object.assign({ brand: S.brand }, S.styles[i].cfg);
  const curCfg = () => cfgOf(S.cur);

  // ---------- 7 步定义 ----------
  const STEPS = [
    { n: '品牌与机芯', sum: (c) => CF.mvOf(c).k === 'OWN' ? '自带机芯' : CF.mvOf(c).k },
    { n: '表壳与尺寸', sum: (c) => CF.find('shape', c.shape).n.slice(0, 2) + ' · ' + c.size + 'mm' },
    { n: '表带·电镀·底盖', sum: (c) => CF.find('strap', c.strap).n.replace('表带', '') },
    { n: '表圈', sum: (c) => CF.find('bezel', c.bezel).n },
    { n: '表盘与 Logo', sum: (c) => CF.find('color', c.color).n },
    { n: '指针', sum: (c) => CF.find('hands', c.hands).n.replace('公模针', '针') },
    { n: '包装与渲染', sum: (c) => CF.find('box', c.box).n.slice(0, 4) }
  ];

  function optHTML(key, o, c, price) {
    const on = c[key] === o.v;
    const off = o.auto && c.power !== 'auto';
    return `<button type="button" class="opt${on ? ' is-on' : ''}" data-k="${key}" data-v="${o.v}"${off ? ' disabled title="仅机械机芯可选"' : ''}>
<b>${o.n}</b>${o.d ? `<span>${o.d}</span>` : ''}<em>${price(o)}</em></button>`;
  }
  const row = (label, note, key, cols, c, price) =>
    `<div class="row"><span class="row__l">${label}${note ? `<span>${note}</span>` : ''}</span><div class="opts opts--${cols}">${CF.OPT[key].map((o) => optHTML(key, o, c, price || ((x) => usd(x.p) + (x.t ? ` · $${x.t} 模费` : '')))).join('')}</div></div>`;

  const PANES = {
    1: (c) => `<div class="row"><span class="row__l">品牌名<span>印在表盘、底盖、表盒上</span></span>
<div class="chips"><input class="inp" type="text" maxlength="16" data-brand-input>${['CHRONO LAB', 'AETHER', 'VALKYRIE'].map((b) => `<button type="button" class="chip${S.brand === b ? ' is-on' : ''}" data-brand="${b}">${b}</button>`).join('')}</div></div>
${row('款型', '', 'func', 2, c, (o) => (o.p ? `+$${o.p}` : '基础款'))}
${row('机芯类型', '决定表壳厚度', 'power', 2, c, () => '')}
<div class="row"><span class="row__l">机芯型号<span>按实价另算，不计入套壳价</span></span>
<div class="select-row"><select id="mvSel">${CF.mvList(c).concat([CF.MV_OWN]).map((m) => `<option value="${m.k}"${CF.mvOf(c).k === m.k ? ' selected' : ''}>${m.n}${m.r[1] ? `（约 $${m.r[0]}–${m.r[1]}/只）` : ''}</option>`).join('')}</select>
<a class="link" href="#" data-open="engines">全部机芯价格 →</a></div></div>`,
    2: (c) => row('表壳外形', '4 款现成公模，$0 壳模费', 'shape', 4, c) +
      row('直径', '', 'size', 3, c, () => '') +
      row('护肩（猪嘴）', '', 'guard', 3, c),
    3: (c) => row('表带', '每套价格', 'strap', 3, c, (o) => `$${o.p}/套`) +
      row('电镀颜色', '', 'plate', 4, c) +
      row('底盖', c.power === 'auto' ? '' : '石英机芯只能选实心底', 'back', 3, c),
    4: (c) => row('表圈', '', 'bezel', 4, c) + row('表圈刻度', '', 'scale', 2, c, (o) => (o.t ? `+$${o.t} 模费` : '$0 模费')),
    5: (c) => row('表盘工艺', '', 'dial', 2, c, (o) => `+$${o.p} · ${o.t ? `$${o.t} 模费` : '$0 模费'}`) +
      `<div class="row"><span class="row__l">表盘颜色</span><div class="chips">${CF.OPT.color.map((o) => `<button type="button" class="chip chip--sw${c.color === o.v ? ' is-on' : ''}" data-k="color" data-v="${o.v}"><i style="background:linear-gradient(135deg,${o.c[0]},${o.c[1]})"></i>${o.n}</button>`).join('')}</div></div>` +
      row('表盘 Logo', '', 'logo', 2, c),
    6: (c) => row('指针', '90+ 款现成针可选，私模针需开模', 'hands', 3, c),
    7: (c) => row('包装', '盒面可烫印 Logo', 'box', 3, c) +
      `<label class="check"><input type="checkbox" id="renderChk"${S.render ? ' checked' : ''}> 48 小时 4K 渲染图包 <b>+$99</b><span>满 50 只返还，可先用于预售</span></label>`
  };
  // ---------- 7 步条 + 当前面板 ----------
  function renderSteps() {
    const c = curCfg();
    $('steps').innerHTML = STEPS.map((s, i) =>
      `<button type="button" class="step${S.step === i + 1 ? ' is-on' : ''}" data-step="${i + 1}"><b>0${i + 1} ${s.n}</b><span>${s.sum(c)}</span></button>`).join('');
  }

  function renderPane() {
    const c = curCfg();
    const n = S.step;
    const next = n < 7
      ? `<button type="button" class="btn btn--dark btn--sm" data-go="${n + 1}">下一步：${STEPS[n].n} →</button>`
      : `<button type="button" class="btn btn--orange btn--sm" data-go="done">完成选配 · 看总价 ↓</button>`;
    $('pane').innerHTML = `<div class="pane__h"><span class="pane__n">STEP 0${n} / 07</span><h3>${STEPS[n - 1].n}</h3><span class="pane__who">正在配置：款式 ${LETTERS[S.cur]}</span></div>
${PANES[n](c)}
<div class="pane__nav">${n > 1 ? `<button type="button" class="btn btn--ghost btn--sm" data-go="${n - 1}">← 上一步</button>` : '<span></span>'}${next}</div>`;
    syncBrandInputs();
  }

  // ---------- 左侧预览 ----------
  function renderPreview() {
    const c = curCfg();
    const svg = $('pvSvg');
    const dim = CF.SIZE[c.size];
    const thick = CF.THICK[c.func + '-' + c.power];
    let tag;
    if (S.view === 'back') {
      svg.innerHTML = CF.back(c);
      tag = '背面 · ' + CF.find('back', c.back).n;
    } else if (S.view === 'box') {
      svg.innerHTML = CF.box(c);
      tag = CF.BOXNAME[c.box] + ' · 可烫印 Logo';
    } else {
      svg.innerHTML = CF.front(c, S.ruler);
      tag = `${CF.find('shape', c.shape).n} · Ø${c.size}mm · ${CF.find('guard', c.guard).n}`;
    }
    $('pvTag').textContent = `款式 ${LETTERS[S.cur]} · ${tag}`;
    document.querySelectorAll('.ptab[data-view]').forEach((b) => b.classList.toggle('is-on', b.dataset.view === S.view));
    const rb = $('rulerBtn');
    rb.textContent = '标尺：' + (S.ruler ? '开' : '关');
    rb.classList.toggle('is-on', S.ruler);
    rb.hidden = S.view !== 'front';
    $('dims').innerHTML = [
      ['表径', c.size.toFixed(1)], ['含表冠', (c.size + 2.8).toFixed(1)], ['上下耳距', dim.l2l.toFixed(1)],
      ['表带宽', dim.strap.toFixed(1)], ['整表厚', thick.toFixed(1)]
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}mm</dd></div>`).join('');
    $('pvFoot').innerHTML = `表盘开窗 Ø${(c.size * 0.7625).toFixed(1)}mm · 圈口贴片 Ø${(c.size - 2).toFixed(1)}×${(c.size * 0.7875).toFixed(1)}mm　<a href="handbook.html">下载 1:1 尺寸模板 →</a>`;
  }

  // ---------- 混批款式卡 ----------
  function totals() {
    const q = S.styles.reduce((a, s) => a + s.qty, 0);
    const d = CF.discount(q);
    const lines = S.styles.map((s, i) => {
      const c = cfgOf(i);
      const u = CF.unit(c);
      const unit = Math.round(u.sum * d.r * 10) / 10;
      return { c, u, unit, qty: s.qty, line: Math.round(unit * s.qty), tool: CF.tooling(c) };
    });
    const kit = lines.reduce((a, l) => a + l.line, 0);
    const tool = lines.reduce((a, l) => a + l.tool.reduce((x, t) => x + t.t, 0), 0) + (S.render ? 99 : 0);
    return { q, d, lines, kit, tool, sum: kit + tool };
  }

  function renderCards(T) {
    const cards = T.lines.map((l, i) => {
      const c = l.c;
      return `<div class="scard${i === S.cur ? ' is-on' : ''}" data-style="${i}">
<div class="scard__h"><b>款式 ${LETTERS[i]}</b>${i === S.cur ? '<span class="tag tag--orange">配置中</span>' : '<span class="scard__edit">点击配置</span>'}${S.styles.length > 1 ? `<button type="button" class="scard__x" data-del="${i}" aria-label="删除">×</button>` : ''}</div>
<p class="scard__p">${CF.find('shape', c.shape).n} · ${c.size}mm · ${CF.find('bezel', c.bezel).n}</p>
<div class="stepper"><button type="button" data-qd="${i}" data-d="-5">−</button><input type="number" min="0" step="5" value="${l.qty}" data-qi="${i}"><button type="button" data-qd="${i}" data-d="5">+</button><span>只</span></div>
<p class="scard__u">$<b>${l.unit.toFixed(1)}</b>/只 · 小计 $${money(l.line)}</p></div>`;
    });
    if (S.styles.length < 3) {
      cards.push(`<div class="scard scard--add"><b>+ 添加款式 ${LETTERS[S.styles.length]}</b><span>同一单再加一款，不收混批费</span>
<div class="scard__btns"><button type="button" class="btn btn--ghost btn--sm" data-add="B">+ 六针赛车款</button><button type="button" class="btn btn--ghost btn--sm" data-add="C">+ 38mm 正装款</button></div></div>`);
    }
    $('styleCards').innerHTML = cards.join('');
    $('styleCards').className = 'batch__row batch__row--' + cards.length;
  }

  // ---------- 价格拆分 ----------
  function renderBreakdown(T) {
    const L = T.lines[S.cur];
    const u = L.u;
    const it = (k, v) => `<li>${k}<em>$${v.toFixed(1)}</em></li>`;
    const toolRows = [];
    T.lines.forEach((l, i) => l.tool.forEach((t) => toolRows.push(`<li>款式 ${LETTERS[i]} · ${t.n}<em>$${t.t}</em></li>`)));
    if (S.render) toolRows.push('<li>4K 渲染图包（满 50 只返还）<em>$99</em></li>');
    const mv = T.lines.map((l, i) => {
      const m = CF.mvOf(l.c);
      return `<li>款式 ${LETTERS[i]} · ${m.k === 'OWN' ? '自带机芯' : m.n.replace(/^(日本|瑞士)\s*/, '')}<em>${m.r[1] ? `$${m.r[0]}–${m.r[1]}/只` : '免费装配'}</em></li>`;
    }).join('');
    $('bkd').innerHTML = `<p class="bkd__t">款式 ${LETTERS[S.cur]} 单只套壳价 <span>${T.d.label}</span></p>
<ul class="bkd">${it('表壳 · 蓝宝石镜 · 表带', u.shell)}${it('护肩 · 底盖', u.guardBack)}${u.plate ? it('电镀', u.plate) : ''}${it('表圈', u.bezel)}${it('表盘 · Logo · 款型', u.dial)}${it('指针 · 表盒', u.handsBox)}
<li class="bkd__tot">单只合计${T.d.r < 1 ? '（折后）' : ''}<em>$${L.unit.toFixed(1)}</em></li></ul>
<p class="bkd__s">一次性模具与服务 <span>翻单免收</span></p>
<ul class="bkd">${toolRows.join('') || '<li>全部用现成公模<em>$0</em></li>'}<li class="bkd__tot">小计<em>$${money(T.tool)}</em></li></ul>
<p class="bkd__s">机芯 <span>按实价另算，不计入总价</span></p><ul class="bkd">${mv}</ul>`;
  }

  function renderTotals() {
    const T = totals();
    renderCards(T);
    renderBreakdown(T);
    const p1 = Math.round(T.sum * 0.3), p2 = Math.round(T.sum * 0.5), p3 = T.sum - p1 - p2;
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set('sum', money(T.sum));
    set('avg', T.q ? (T.sum / T.q).toFixed(1) : '0');
    set('tierTag', T.d.label);
    ['pay1', 'pay1b'].forEach((i) => set(i, money(p1)));
    ['pay2', 'pay2b'].forEach((i) => set(i, money(p2)));
    ['pay3', 'pay3b'].forEach((i) => set(i, money(p3)));
    set('paySum', money(T.sum));
    set('payQty', T.q);
    const ok = $('okTag');
    ok.textContent = T.q >= 50 ? `✓ 共 ${T.q} 只，已满起订量` : `共 ${T.q} 只，还差 ${50 - T.q} 只`;
    ok.className = 'tag ' + (T.q >= 50 ? 'tag--lime' : 'tag--orange');
    $('bigTip').hidden = T.q < 300;
    document.querySelectorAll('.qbtn').forEach((b) => b.classList.toggle('is-on', +b.dataset.qty === T.q));
  }
  // ---------- STEP 01-A 案例 ----------
  function renderCases() {
    $('caseGrid').innerHTML = CF.CASES.map((k, i) => {
      const c = Object.assign({ brand: S.brand }, k.cfg);
      const T = Math.round(CF.unit(c).sum * 10) / 10;
      return `<article class="case"><div class="case__media"><span class="tag tag--dark">${k.tag}</span><span class="tag tag--lime case__media-r">${k.side}</span>${CF.front(c, false)}</div>
<div class="case__body"><h3>${k.name}</h3><dl class="case__spec"><div><dt>改了什么</dt><dd>${k.mod}</dd></div><div><dt>适合</dt><dd>${k.fit}</dd></div><div><dt>套壳价</dt><dd><b>$${T.toFixed(1)}/只</b> · 50 只起</dd></div></dl>
<button type="button" class="btn btn--ghost btn--block" data-apply="${i}">套用此款 → 载入选配台</button></div></article>`;
    }).join('');
  }

  // ---------- STEP 01-B 改款部位 & 印标位置 ----------
  const ZONES = [
    { z: 1, h: '① 公模表壳 · 护肩 · 表带', p: '$0 壳模费', d: '4 款 316L 现成壳型。护肩可保留、铣平或切面，表带钢 / 胶 / 皮任选。', step: 2 },
    { z: 2, h: '② 表盘与 Logo', p: '$0 起', d: '太阳纹、哑光盘免模费；3D 油压盘 $240 模费。立体金属标 $65 模费。', step: 5 },
    { z: 3, h: '③ 指针', p: '$0 起', d: '90+ 款现成针，可改色。私模异形针 $220 模费。', step: 6 },
    { z: 4, h: '④ 表圈', p: '$0 起', d: '光圈、狗牙、夜光陶瓷、测速 4 种。专属刻度 $180 模费。', step: 4 }
  ];
  const LOGOS = [
    { h: '① 表盘正面 Logo', p: '$0 / +$65', d: '平面移印免模费；立体金属标 $65 模费。' },
    { h: '② 表冠端面刻标', p: '50 只起刻', d: '激光深雕品牌缩写「{I}」。' },
    { h: '③ 底盖限量编号', p: '一表一码', d: '品牌 + 001/050 编号，逐只不同。' },
    { h: '④ 表扣激光刻标', p: '50 只起刻', d: '钢扣、针扣刻标；皮带底面压印。' }
  ];
  function renderZones() {
    const c = curCfg();
    $('zonesSvg').innerHTML = CF.zonesSVG(c);
    document.querySelectorAll('#zonesSvg .zl').forEach((g) => g.classList.toggle('is-on', +g.dataset.z === S.zone));
    $('zoneList').innerHTML = ZONES.map((z) => `<div class="zone${z.z === S.zone ? ' is-on' : ''}" data-zone="${z.z}">
<div class="zone__h"><b>${z.h}</b><span class="tag tag--soft">${z.p}</span></div><p>${z.d}</p>
<a class="link" href="#quote" data-zstep="${z.step}">去第 ${z.step} 步选配 →</a></div>`).join('');
    $('logoGrid').innerHTML = LOGOS.map((l, i) => `<div class="logo-card">${CF.logoSVG(c, i + 1)}
<div class="logo-card__b"><div class="zone__h"><b>${l.h}</b><span class="tag tag--lime">${l.p}</span></div><p>${l.d.replace('{I}', CF.initials(S.brand))}</p></div></div>`).join('');
  }
  function setZView(v) {
    document.querySelectorAll('[data-zview]').forEach((b) => b.classList.toggle('is-on', b.dataset.zview === v));
    document.querySelectorAll('[data-zpane]').forEach((p) => { p.hidden = p.dataset.zpane !== v; });
    document.querySelectorAll('[data-zsub]').forEach((p) => { p.hidden = p.dataset.zsub !== v; });
  }

  function syncBrandInputs(except) {
    document.querySelectorAll('[data-brand-input]').forEach((el) => { if (el !== except) el.value = S.brand; });
    document.querySelectorAll('[data-brand]').forEach((b) => b.classList.toggle('is-on', b.dataset.brand === S.brand));
  }

  function renderAll() {
    renderSteps();
    renderPane();
    renderPreview();
    renderTotals();
    renderZones();
    renderCases();
  }
  function refresh() { // 选项改动后：不重建正在输入的控件以外的全部内容
    renderSteps();
    renderPane();
    renderPreview();
    renderTotals();
    renderZones();
  }

  // ---------- 事件 ----------
  const VIEW_OF = { back: 'back', box: 'box' };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a, .scard, .zone, .zl, .modal');
    if (!t) return;
    const d = t.dataset;
    const cfg = S.styles[S.cur].cfg;

    if (t.classList.contains('modal') && e.target === t) { t.hidden = true; return; }
    if (d.close !== undefined) { $('engines').hidden = true; return; }
    if (d.open === 'engines') { e.preventDefault(); $('engines').hidden = false; return; }

    if (d.k && !t.disabled) {
      const v = d.k === 'size' ? +d.v : d.v;
      cfg[d.k] = v;
      if (d.k === 'power' || d.k === 'func') cfg.mv = CF.mvList(cfg)[0].k;
      if (cfg.power !== 'auto' && cfg.back !== 'solid') cfg.back = 'solid';
      S.view = VIEW_OF[d.k] || 'front';
      refresh();
      return;
    }
    if (d.brand) { S.brand = d.brand; renderAll(); return; }
    if (d.step) { S.step = +d.step; S.view = S.step === 7 ? 'box' : 'front'; refresh(); return; }
    if (d.go) {
      if (d.go === 'done') { document.querySelector('.qbottom').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      S.step = +d.go; S.view = S.step === 7 ? 'box' : 'front'; refresh();
      $('steps').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (d.view) { S.view = d.view; renderPreview(); return; }
    if (t.id === 'rulerBtn') { S.ruler = !S.ruler; renderPreview(); return; }
    if (d.viewJump) { S.view = d.viewJump; S.step = 7; refresh(); return; }

    if (d.qd !== undefined) {
      const s = S.styles[+d.qd];
      s.qty = Math.max(0, s.qty + +d.d);
      renderTotals();
      return;
    }
    if (d.del !== undefined) {
      S.styles.splice(+d.del, 1);
      S.cur = Math.min(S.cur, S.styles.length - 1);
      refresh();
      return;
    }
    if (d.add) {
      S.styles.push({ cfg: clone(CF.PRESET[d.add]), qty: 25 });
      S.cur = S.styles.length - 1;
      refresh();
      return;
    }
    if (d.qty) {
      const n = +d.qty, k = S.styles.length;
      const each = Math.floor(n / k / 5) * 5;
      S.styles.forEach((s, i) => { s.qty = i === k - 1 ? n - each * (k - 1) : each; });
      renderTotals();
      return;
    }
    if (d.style !== undefined && !e.target.closest('input, button')) {
      S.cur = +d.style;
      refresh();
      return;
    }
    if (d.apply !== undefined) {
      S.styles[S.cur].cfg = clone(CF.CASES[+d.apply].cfg);
      S.step = 1; S.view = 'front';
      refresh();
      $('quote').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (d.zview) { setZView(d.zview); return; }
    if (d.zviewGo) { e.preventDefault(); setZView(d.zviewGo); return; }
    if (d.zstep) { S.step = +d.zstep; S.view = 'front'; refresh(); return; }
    if (d.zone || d.z) { S.zone = +(d.zone || d.z); renderZones(); return; }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('[data-brand-input]')) {
      S.brand = t.value.trim() || 'YOUR BRAND';
      syncBrandInputs(t);
      renderPreview();
      renderZones();
      renderCases();
    } else if (t.matches('[data-qi]')) {
      S.styles[+t.dataset.qi].qty = Math.max(0, parseInt(t.value, 10) || 0);
    }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'mvSel') { S.styles[S.cur].cfg.mv = t.value; renderSteps(); renderTotals(); }
    else if (t.id === 'renderChk') { S.render = t.checked; renderTotals(); }
    else if (t.matches('[data-qi]')) renderTotals();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('engines').hidden = true; });

  // 机芯价格表
  const TYPE = { '3h-auto': '三针 · 机械', '3h-quartz': '三针 · 石英', 'chrono-quartz': '计时 · 石英', 'chrono-auto': '计时 · 机械' };
  $('engBody').innerHTML = Object.keys(CF.MV).map((k) => CF.MV[k].map((m, i) =>
    `<tr>${i === 0 ? `<td rowspan="${CF.MV[k].length}">${TYPE[k]}</td>` : ''}<td>${m.n}</td><td>$${m.r[0]}–${m.r[1]}</td></tr>`).join('')).join('') +
    `<tr><td>任意</td><td>${CF.MV_OWN.n}</td><td>$0</td></tr>`;

  renderAll();
})();
