// ===== Result page interactivity =====

(function () {
  let remaining = 7;
  const limitNote = document.getElementById('limitNote');

  function regenerate(btn) {
    const img = btn.closest('.result-card').querySelector('img');
    img.style.opacity = '0.3';
    btn.textContent = '…';
    setTimeout(() => {
      img.style.opacity = '1';
      btn.textContent = '⟲';
      if (remaining > 0) {
        remaining -= 1;
        if (limitNote) limitNote.textContent = `今日剩余生成次数：${remaining} / 10`;
      }
      if (remaining === 0 && limitNote) {
        limitNote.textContent = '今日生成次数已用完，明日 00:00 刷新，或联系销售顾问加急处理';
      }
    }, 700);
  }

  const regenRender = document.getElementById('regenRender');
  const regenBlueprint = document.getElementById('regenBlueprint');
  if (regenRender) regenRender.addEventListener('click', () => regenerate(regenRender));
  if (regenBlueprint) regenBlueprint.addEventListener('click', () => regenerate(regenBlueprint));

  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveBtn.textContent = '已保存 ✓';
      setTimeout(() => { saveBtn.textContent = '保存到我的方案'; }, 1800);
    });
  }
})();
