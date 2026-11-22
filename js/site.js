// ===== 首页选配台 =====
(function () {
  const $ = (id) => document.getElementById(id);
  const qtyA = $('qtyA');
  if (!qtyA) return;

  // ---------- 状态 ----------
  const S = {
    brand: 'CHRONO LAB',
    mv: 'auto',          // auto | chrono | quartz | auto2
    mvPrice: 110,        // 机芯单价（另计，不进总价）
    mvName: '精工 NH35A 自动机械',
    caseSize: 40,
    guard: 0,
    strap: 0,
    plate: 0,
    back: 0,
    bezel: 6.5,
    dial: 6,
    logo: 0,
    hand: 0,
    box: 0,
    render: 0
  };

  // 款式 B 固定为运动款，价格基准不同
  const B_BASE = 67.5;
  const A_BASE_SHELL = 32.0;

  const money = (n) => Math.round(n).toLocaleString('en-US');

  // ---------- 批量折扣 ----------
  function discountFor(qty) {
    if (qty >= 500) return { rate: 0.78, label: '500 只+ 专属价' };
    if (qty >= 200) return { rate: 0.86, label: '200 只 · 86 折' };
    if (qty >= 100) return { rate: 0.92, label: '100 只 · 92 折' };
    return { rate: 1.0, label: '50 只基准价' };
  }

  // ---------- 款式 A 单价（套壳，不含机芯） ----------
  function unitAPrice(rate) {
    const shell = A_BASE_SHELL + (S.caseSize === 42 ? 4 : S.caseSize === 38 ? -2 : S.caseSize === 41 ? 6 : 0);
    const sum = shell + S.guard + S.strap + S.plate + S.back + S.bezel + S.dial + S.logo + S.hand + S.box + S.render;
    return sum * rate;
  }

  function unitBPrice(rate) {
    return B_BASE * rate;
  }

  // ---------- 主算 ----------
  function recalc() {
    const a = Math.max(0, parseInt(qtyA.value, 10) || 0);
    const bEl = $('qtyB');
    const b = Math.max(0, parseInt(bEl.value, 10) || 0);
    const total = a + b;

    const d = discountFor(total);
    const uA = unitAPrice(d.rate);
    const uB = unitBPrice(d.rate);
    const kitSum = uA * a + uB * b;

    // 明细
    set('pShell', (A_BASE_SHELL).toFixed(1));
    set('pBezel', S.bezel.toFixed(1));
    set('pDial', (S.dial + S.logo).toFixed(1));
    set('pHand', (S.hand + S.box + S.render).toFixed(1));
    set('unitA2', uA.toFixed(1));
    set('unitA', uA.toFixed(1));
    set('unitB', uB.toFixed(1));
    set('lineA', money(uA * a));
    set('lineB', money(uB * b));
    set('kitSum', money(kitSum));

    // 机芯
    set('mvLine', S.mvName);
    set('mvPrice', S.mvPrice);
    set('mvSum', money(S.mvPrice * total));

    // 总价（仅套壳 + 模具；机芯另计）
    set('sum', money(kitSum));
    set('avg', total ? Math.round(kitSum / total) : 0);
    set('tierTag', d.label);

    // 三段付款
    const p1 = Math.round(kitSum * 0.3);
    const p2 = Math.round(kitSum * 0.5);
    const p3 = kitSum - p1 - p2;
    ['pay30', 'pay1'].forEach((i) => set(i, money(p1)));
    ['pay50', 'pay2'].forEach((i) => set(i, money(p2)));
    ['pay20', 'pay3'].forEach((i) => set(i, money(p3)));
    set('paySum', money(kitSum));
    set('payQty', total);

    // 厚度
    const thick = S.mv === 'quartz' ? '9.6mm' : S.mv === 'chrono' ? '12.4mm' : '11.6mm';
    set('pvThick', thick);

    // 凑单提示
    const ok = $('okTag');
    if (ok) {
      ok.textContent = total >= 50 ? '✓ 已凑满 50 只起订量' : `还差 ${50 - total} 只起订`;
      ok.className = 'tag ' + (total >= 50 ? 'tag--lime' : 'tag--orange');
    }
  }

  function set(id, v) {
    const el = $(id);
    if (el) el.textContent = v;
  }

  // ---------- 7 步切换 ----------
  document.querySelectorAll('.step').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.step').forEach((x) => x.classList.remove('is-on'));
      btn.classList.add('is-on');
      const n = btn.dataset.s;
      document.querySelectorAll('.pane').forEach((p) => {
        p.hidden = p.dataset.pane !== n;
      });
    });
  });

  // ---------- 选项组：同组单选 ----------
  function bindGroup(selector, apply) {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.parentElement.querySelectorAll('.opt, .chip').forEach((x) => x.classList.remove('is-on'));
        btn.classList.add('is-on');
        apply(btn);
        recalc();
      });
    });
  }

  bindGroup('[data-mv]', (b) => {
    S.mv = b.dataset.mv;
    const map = {
      auto:  { p: 110, n: '精工 NH35A 自动机械' },
      auto2: { p: 110, n: '精工 NH35A 自动机械' },
      chrono:{ p: 165, n: '精工 VK63 六针计时' },
      quartz:{ p: 48,  n: 'Miyota 2035 石英' }
    };
    const m = map[S.mv] || map.auto;
    S.mvPrice = m.p; S.mvName = m.n;
  });

  bindGroup('[data-case]', (b) => { S.caseSize = parseInt(b.dataset.case, 10); });
  bindGroup('[data-guard]', (b) => { S.guard = parseFloat(b.dataset.guard); });
  bindGroup('[data-strap]', (b) => { S.strap = parseFloat(b.dataset.strap); });
  bindGroup('[data-plate]', (b) => { S.plate = parseFloat(b.dataset.plate); });
  bindGroup('[data-back]', (b) => { S.back = parseFloat(b.dataset.back); });
  bindGroup('[data-bezel]', (b) => { S.bezel = parseFloat(b.dataset.bezel); });
  bindGroup('[data-dial]', (b) => { S.dial = parseFloat(b.dataset.dial); });
  bindGroup('[data-logo]', (b) => { S.logo = parseFloat(b.dataset.logo); });
  bindGroup('[data-hand]', (b) => { S.hand = parseFloat(b.dataset.hand); });
  bindGroup('[data-box]', (b) => { S.box = parseFloat(b.dataset.box); });
  bindGroup('[data-render]', (b) => { S.render = parseFloat(b.dataset.render); });

  // 品牌
  document.querySelectorAll('[data-brand]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-brand]').forEach((x) => x.classList.remove('is-on'));
      btn.classList.add('is-on');
      S.brand = btn.dataset.brand;
    });
  });

  // 机芯下拉
  const sel = $('mvSelect');
  if (sel) {
    sel.addEventListener('change', () => {
      const [p, k] = sel.value.split('|');
      S.mvPrice = parseInt(p, 10);
      S.mv = k;
      S.mvName = sel.options[sel.selectedIndex].text.split('（')[0];
      recalc();
    });
  }

  // 数量
  [qtyA, $('qtyB')].forEach((el) => el && el.addEventListener('input', recalc));
  document.querySelectorAll('.stepper button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.t;
      const input = t === 'A' ? qtyA : $('qtyB');
      const d = parseInt(btn.dataset.d, 10) || 0;
      input.value = Math.max(0, (parseInt(input.value, 10) || 0) + d);
      recalc();
    });
  });

  // 快速总量
  document.querySelectorAll('.qbtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.qbtn').forEach((x) => x.classList.remove('is-on'));
      btn.classList.add('is-on');
      const n = parseInt(btn.dataset.qty, 10) || 50;
      const half = Math.max(5, Math.round(n / 2 / 5) * 5);
      qtyA.value = half;
      $('qtyB').value = Math.max(0, n - half);
      recalc();
    });
  });

  // 预览 Tab
  document.querySelectorAll('.ptab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ptab').forEach((x) => x.classList.remove('is-on'));
      btn.classList.add('is-on');
      const img = $('pvImg');
      const map = {
        front: 'assets/render_sample_2.png',
        back:  'assets/render_sample_3.png',
        box:   'assets/render_sample_1.png'
      };
      if (img) img.src = map[btn.dataset.view] || map.front;
    });
  });

  // 01-B 切换
  document.querySelectorAll('.toggle__b').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle__b').forEach((x) => x.classList.remove('is-on'));
      btn.classList.add('is-on');
    });
  });

  // 区域高亮
  document.querySelectorAll('.zone').forEach((z) => {
    z.addEventListener('click', () => {
      document.querySelectorAll('.zone').forEach((x) => x.classList.remove('is-on'));
      z.classList.add('is-on');
    });
  });

  recalc();
})();
