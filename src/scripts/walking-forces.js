document.querySelectorAll('[data-walking-forces]').forEach((root) => {
  const replay = root.querySelector('[data-walking-replay]');
  if (typeof Element.prototype.animate !== 'function') return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [];
  const stop = () => { animations.forEach((animation) => animation.cancel()); animations = []; };
  const updateMotion = () => { stop(); replay.hidden = motion.matches; };
  replay.addEventListener('click', () => {
    stop();
    if (motion.matches) return;
    const timing = { duration: 850, easing: 'ease-out' };
    animations = [
      ...Array.from(root.querySelectorAll('.walking-force-shaft'), (shaft) => shaft.animate([
        { strokeDasharray: '150', strokeDashoffset: '150' },
        { strokeDasharray: '150', strokeDashoffset: '0' },
      ], timing)),
      ...Array.from(root.querySelectorAll('.walking-force-head'), (head) => head.animate([
        { opacity: 0 }, { opacity: 0, offset: 0.95 }, { opacity: 1 },
      ], timing)),
    ];
    const together = document.timeline.currentTime;
    if (together !== null) animations.forEach((animation) => { animation.startTime = together; });
  });
  motion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  updateMotion();
});
