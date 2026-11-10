document.querySelectorAll('[data-dissolving-sugar]').forEach((root) => {
  const replay = root.querySelector('[data-sugar-replay]');
  if (!replay || typeof Element.prototype.animate !== 'function') return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [];
  const stop = () => { animations.forEach((animation) => animation.cancel()); animations = []; };
  const updateMotion = () => { stop(); replay.hidden = motion.matches; };
  replay.addEventListener('click', () => {
    stop();
    if (motion.matches) return;
    animations = Array.from(root.querySelectorAll('[data-sugar-molecule]'), (dot) => {
      const start = `translate(${dot.dataset.fromX}px, ${dot.dataset.fromY}px)`;
      return dot.animate([{ transform: start }, { transform: start, offset: .15 }, { transform: 'translate(0, 0)' }], {
        duration: 1900, easing: 'ease-in-out',
      });
    });
    const together = document.timeline.currentTime;
    if (together !== null) animations.forEach((animation) => { animation.startTime = together; });
  });
  motion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  updateMotion();
});
