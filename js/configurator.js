// ===== Configurator interactivity =====

(function () {
  const groups = document.querySelectorAll('.swatch-grid');
  if (!groups.length) return;

  const summaryMap = {
    material: 'sum-material',
    dial: 'sum-dial',
    hands: 'sum-hands',
    handcount: 'sum-handcount',
    strap: 'sum-strap',
    strapcolor: 'sum-strapcolor',
    movement: 'sum-movement',
    bezel: 'sum-bezel',
    crown: 'sum-crown',
    caseback: 'sum-caseback'
  };

  function updatePreviewLayer(groupName, swatch) {
    const chip = swatch.querySelector('.swatch__chip');
    const bg = chip ? chip.style.background : null;
    if (!bg) return;
    const pvCase = document.getElementById('pvCase');
    const pvDial = document.getElementById('pvDial');
    const pvBezel = document.getElementById('pvBezel');
    const pvStrapTop = document.getElementById('pvStrapTop');
    const pvStrapBottom = document.getElementById('pvStrapBottom');
    const pvHandThird = document.getElementById('pvHandThird');

    if (groupName === 'material' && pvCase) pvCase.style.background = bg;
    if (groupName === 'dial' && pvDial) pvDial.style.background = bg;
    if (groupName === 'bezel' && pvBezel) pvBezel.style.background = bg;
    if ((groupName === 'strap' || groupName === 'strapcolor') && pvStrapTop && pvStrapBottom) {
      pvStrapTop.style.background = bg;
      pvStrapBottom.style.background = bg;
    }
    if (groupName === 'handcount' && pvHandThird) {
      pvHandThird.hidden = swatch.dataset.value !== '六针设计';
    }
  }

  function selectSwatch(group, swatch) {
    group.querySelectorAll('.swatch').forEach((s) => s.classList.remove('is-selected'));
    swatch.classList.add('is-selected');
    const groupName = group.dataset.group;
    const summaryId = summaryMap[groupName];
    if (summaryId) {
      const el = document.getElementById(summaryId);
      if (el) el.textContent = swatch.dataset.value;
    }
    updatePreviewLayer(groupName, swatch);

    if (groupName === 'movement') {
      const isMechanical = swatch.dataset.mechanical === 'true';
      const originBox = document.querySelector('[data-subgroup="movement-origin"]');
      const cradleBox = document.querySelector('[data-subgroup="movement-cradle"]');
      if (originBox) originBox.hidden = !isMechanical;
      if (cradleBox) cradleBox.hidden = !isMechanical;
    }

    if (groupName === 'strap') {
      const isSteel = swatch.dataset.steel === 'true';
      const claspBox = document.querySelector('[data-subgroup="strap-clasp"]');
      if (claspBox) claspBox.hidden = !isSteel;
    }
  }

  groups.forEach((group) => {
    group.addEventListener('click', (e) => {
      const swatch = e.target.closest('.swatch');
      if (!swatch) return;
      selectSwatch(group, swatch);
    });
  });

  const randomBtn = document.getElementById('randomBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      groups.forEach((group) => {
        const swatches = Array.from(group.querySelectorAll('.swatch'));
        const pick = swatches[Math.floor(Math.random() * swatches.length)];
        selectSwatch(group, pick);
      });
    });
  }

  // Generation progress simulation (per PRD §六 process feedback requirement)
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const original = generateBtn.textContent;
      generateBtn.textContent = '生成中…';
      generateBtn.setAttribute('aria-busy', 'true');
      generateBtn.style.pointerEvents = 'none';
      setTimeout(() => {
        window.location.href = 'result.html';
      }, 900);
    });
  }

  // Export current plan as PDF via browser print dialog
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => window.print());
  }

  // ===== MOQ batch-mixing (凑单) =====
  const MOQ_TARGET = 50;
  const batchListEl = document.getElementById('batchList');
  const addToBatchBtn = document.getElementById('addToBatchBtn');
  const progressFill = document.getElementById('batchProgressFill');
  const progressText = document.getElementById('batchProgressText');

  if (addToBatchBtn && batchListEl) {
    const STORAGE_KEY = 'moqBatchList';
    let batchList = [];
    try {
      batchList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (err) {
      batchList = [];
    }

    function describeCurrentPlan() {
      const parts = [
        document.getElementById('sum-material'),
        document.getElementById('sum-dial'),
        document.getElementById('sum-strap')
      ].filter(Boolean).map((el) => el.textContent);
      return parts.join(' · ');
    }

    function renderBatchList() {
      batchListEl.innerHTML = '';
      batchList.forEach((row, idx) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'batch-row';
        rowEl.innerHTML = `
          <div class="batch-row__desc"><strong>方案 ${idx + 1}：</strong>${row.desc}</div>
          <input type="number" class="batch-row__qty" min="1" value="${row.qty}">
          <button class="batch-row__remove" type="button" aria-label="删除此方案">✕</button>
        `;
        rowEl.querySelector('.batch-row__qty').addEventListener('input', (e) => {
          const v = parseInt(e.target.value, 10);
          row.qty = Number.isFinite(v) && v > 0 ? v : 1;
          saveAndRender();
        });
        rowEl.querySelector('.batch-row__remove').addEventListener('click', () => {
          batchList.splice(idx, 1);
          saveAndRender();
        });
        batchListEl.appendChild(rowEl);
      });
      updateProgress();
    }

    function updateProgress() {
      const total = batchList.reduce((sum, row) => sum + row.qty, 0);
      const pct = Math.min(100, Math.round((total / MOQ_TARGET) * 100));
      if (progressFill) {
        progressFill.style.width = pct + '%';
        progressFill.classList.toggle('is-complete', total >= MOQ_TARGET);
      }
      if (progressText) {
        if (batchList.length === 0) {
          progressText.textContent = '还没有加入任何方案 · 目标 50 件起订';
        } else if (total >= MOQ_TARGET) {
          progressText.textContent = `已拼 ${total}/${MOQ_TARGET} 件 · 已达起订量，可直接提交询盘`;
        } else {
          progressText.textContent = `已拼 ${total}/${MOQ_TARGET} 件 · 再加 ${MOQ_TARGET - total} 件即可起订`;
        }
      }
    }

    function saveAndRender() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batchList));
      renderBatchList();
    }

    addToBatchBtn.addEventListener('click', () => {
      batchList.push({ desc: describeCurrentPlan(), qty: 10 });
      saveAndRender();
    });

    renderBatchList();
  }
})();
