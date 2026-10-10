// ===== AI guide page: prompt template tab switch =====

(function () {
  const tabs = document.querySelectorAll('.tpl-tab');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tpl');

      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      document.querySelectorAll('.tpl-panel').forEach((panel) => {
        panel.classList.toggle('is-active', panel.getAttribute('data-tpl') === target);
      });
    });
  });
})();
