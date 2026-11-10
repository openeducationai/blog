document.querySelectorAll('[data-ribbon-division]').forEach((root) => {
  const controls = root.querySelector('[data-ribbon-controls]');
  const buttons = Array.from(root.querySelectorAll('[data-ribbon-size]'));
  const views = Array.from(root.querySelectorAll('[data-ribbon-view]'));
  const result = root.querySelector('[data-ribbon-result]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = { whole: '2 pieces · 2 ÷ 1 = 2', half: '4 pieces · 2 ÷ ½ = 4' };
  let animation;
  buttons.forEach((button) => button.addEventListener('click', () => {
    const size = button.dataset.ribbonSize;
    if (!(size in labels) || button.getAttribute('aria-pressed') === 'true') return;
    animation?.cancel();
    buttons.forEach((item) => {
      const selected = item === button;
      item.setAttribute('aria-pressed', String(selected));
      item.classList.toggle('primary', selected);
      item.classList.toggle('secondary', !selected);
    });
    views.forEach((view) => {
      view.hidden = view.dataset.ribbonView !== size;
      if (!view.hidden && !motion.matches && typeof view.animate === 'function') {
        animation = view.animate([{ opacity: .5 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
      }
    });
    result.textContent = labels[size];
  }));
  motion.addEventListener('change', () => animation?.cancel());
  document.addEventListener('visibilitychange', () => { if (document.hidden) animation?.cancel(); });
  controls.hidden = false;
});
