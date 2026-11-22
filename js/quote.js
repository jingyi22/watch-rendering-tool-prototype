// ===== STEP 02 报价台：实时算价 =====
(function () {
  const $ = (id) => document.getElementById(id);
  const qtyA = $('qtyA'), qtyB = $('qtyB');
  if (!qtyA || !qtyB) return;

  // 套壳单价（不含机芯），按 50 只基准；批量折扣见下表
  const KIT_A = 55.5;   // 经典三针 / 圆壳
  const KIT_B = 67.5;   // 八角运动 / 六针
  const MOVEMENT = { auto: 110, mecha: 48, none: 0 };

  const TIERS = [
    { min: 500, rate: 0.78, label: '500 只+ 专属价' },
    { min: 200, rate: 0.86, label: '200 只 · 86 折' },
    { min: 100, rate: 0.92, label: '100 只 · 92 折' },
    { min: 0,   rate: 1.00, label: '50 只基准价' }
  ];

  let mvKey = 'auto';
  let tierRate = 1.0;

  const money = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  function tierFor(qty) {
    return TIERS.find((t) => qty >= t.min) || TIERS[TIERS.length - 1];
  }

  function recalc() {
    const a = Math.max(0, parseInt(qtyA.value, 10) || 0);
    const b = Math.max(0, parseInt(qtyB.value, 10) || 0);
    const total = a + b;
    const mv = MOVEMENT[mvKey] || 0;

    const t = tierFor(total);
    tierRate = t.rate;

    const unitA = (KIT_A * tierRate) + mv;
    const unitB = (KIT_B * tierRate) + mv;
    const lineA = Math.round(unitA * a);
    const lineB = Math.round(unitB * b);
    const sum = lineA + lineB;

    if ($('lineA')) $('lineA').textContent = money(lineA);
    if ($('lineB')) $('lineB').textContent = money(lineB);
    if ($('qSum')) $('qSum').textContent = money(sum);
    if ($('qAvg')) $('qAvg').textContent = total ? money(Math.round(sum / total)) : '0';
    if ($('qTierTag')) $('qTierTag').textContent = t.label;

    ['pay30', 'payCard30'].forEach((id) => { if ($(id)) $(id).textContent = 'US$' + money(Math.round(sum * 0.3)); });
    ['pay50', 'payCard50'].forEach((id) => { if ($(id)) $(id).textContent = 'US$' + money(Math.round(sum * 0.5)); });
    ['pay20', 'payCard20'].forEach((id) => { if ($(id)) $(id).textContent = 'US$' + money(sum - Math.round(sum * 0.3) - Math.round(sum * 0.5)); });

    if ($('qMvLine')) {
      const labels = { auto: 'NH35A +US$110', mecha: 'Miyota 2035 +US$48', none: '客户自带 +US$0' };
      $('qMvLine').textContent = labels[mvKey] || labels.auto;
    }
    if ($('batchHint')) {
      $('batchHint').textContent = total >= 50 ? '已凑满 50 件，可下单' : `还差 ${50 - total} 件起订`;
      $('batchHint').style.color = total >= 50 ? '#2E7D5B' : '#C0392B';
    }
    if ($('qThick')) $('qThick').textContent = mvKey === 'mecha' ? '8.4mm' : '11.6mm';
  }

  [qtyA, qtyB].forEach((el) => el && el.addEventListener('input', recalc));

  document.querySelectorAll('.batch__stepper button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const d = parseInt(btn.dataset.d, 10) || 0;
      input.value = Math.max(0, (parseInt(input.value, 10) || 0) + d);
      recalc();
    });
  });

  document.querySelectorAll('.bq').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bq').forEach((x) => x.classList.remove('is-active'));
      btn.classList.add('is-active');
      const target = parseInt(btn.dataset.qty, 10) || 50;
      // 按现有比例分配，四舍五入到 5 的倍数
      const a = Math.round((target / 2) / 5) * 5;
      qtyA.value = a;
      qtyB.value = Math.max(0, target - a);
      recalc();
    });
  });

  document.querySelectorAll('.qcard').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.qcard').forEach((x) => x.classList.remove('is-active'));
      btn.classList.add('is-active');
      mvKey = btn.dataset.mv;
      const sel = $('qMovement');
      if (sel) sel.value = mvKey === 'mecha' ? '48' : '110';
      recalc();
    });
  });

  const sel = $('qMovement');
  if (sel) {
    sel.addEventListener('change', () => {
      mvKey = sel.value === '48' ? 'mecha' : sel.value === '0' ? 'none' : 'auto';
      recalc();
    });
  }

  document.querySelectorAll('.qchip').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.qchip').forEach((x) => x.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  document.querySelectorAll('.sstep').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sstep').forEach((x) => x.classList.remove('is-active'));
      btn.classList.add('is-active');
      const n = btn.dataset.step;
      const head = document.querySelector('.qpanel__n');
      if (head) head.textContent = `STEP ${n} / 7`;
    });
  });

  document.querySelectorAll('.studio__tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.studio__tab').forEach((x) => x.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  recalc();
})();
