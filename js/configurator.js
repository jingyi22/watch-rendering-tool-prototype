// ===== Configurator interactivity =====

(function () {
  const groups = document.querySelectorAll('.swatch-grid');
  if (!groups.length) return;

  const summaryMap = {
    material: 'sum-material',
    finish: 'sum-finish',
    dial: 'sum-dial',
    hands: 'sum-hands',
    strap: 'sum-strap',
    movement: 'sum-movement'
  };

  function selectSwatch(group, swatch) {
    group.querySelectorAll('.swatch').forEach((s) => s.classList.remove('is-selected'));
    swatch.classList.add('is-selected');
    const groupName = group.dataset.group;
    const summaryId = summaryMap[groupName];
    if (summaryId) {
      const el = document.getElementById(summaryId);
      if (el) el.textContent = swatch.dataset.value;
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
})();
