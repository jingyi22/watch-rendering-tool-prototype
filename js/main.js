// ===== Shared site behavior =====

// Hero morph: click/keyboard toggles blueprint <-> render layer
(function () {
  const morph = document.getElementById('heroMorph');
  if (!morph) return;
  const tag = document.getElementById('morphTag');

  function toggle() {
    const active = morph.classList.toggle('is-active');
    morph.setAttribute('aria-pressed', String(active));
    if (tag) tag.textContent = active ? '渲染图' : '规格图';
  }

  morph.addEventListener('click', toggle);
  morph.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
})();

// Mark active nav link based on current page
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-header__nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('is-active');
  });
})();
