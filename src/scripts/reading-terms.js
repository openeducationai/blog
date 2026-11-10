const triggers = Array.from(document.querySelectorAll('[data-reading-term]'));
const popover = document.querySelector('#reading-definition-popover');
const sheet = document.querySelector('#reading-definition-sheet');

if (triggers.length && typeof popover?.showPopover === 'function' && typeof sheet?.showModal === 'function') {
  const phone = matchMedia('(max-width: 767px)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let owner = null;
  let sheetOwner = null;
  let closeTimer;
  let pinned = false;

  const cancelClose = () => clearTimeout(closeTimer);
  const clearOwner = () => {
    owner?.setAttribute('aria-expanded', 'false');
    owner?.removeAttribute('aria-describedby');
    owner = null;
    pinned = false;
  };
  const hidePopover = () => {
    cancelClose();
    if (popover.matches(':popover-open')) popover.hidePopover();
    clearOwner();
  };
  const fill = (panel, trigger) => {
    panel.querySelector('[data-definition-title]').textContent = trigger.dataset.readingTerm;
    panel.querySelector('[data-definition-body]').textContent = trigger.dataset.definition;
  };
  const showPopover = (trigger) => {
    cancelClose();
    if (owner !== trigger) clearOwner();
    owner = trigger;
    fill(popover, trigger);
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-describedby', popover.id);
    if (!popover.matches(':popover-open')) popover.showPopover({ source: trigger });
    const rect = trigger.getBoundingClientRect();
    const gap = 8, edge = 16;
    const left = Math.max(edge, Math.min(rect.left, innerWidth - popover.offsetWidth - edge));
    const below = rect.bottom + gap;
    const top = below + popover.offsetHeight <= innerHeight - edge ? below : Math.max(edge, rect.top - popover.offsetHeight - gap);
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  };
  const scheduleClose = () => {
    cancelClose();
    if (!pinned && document.activeElement !== owner) closeTimer = setTimeout(hidePopover, 150);
  };
  const syncSurface = () => {
    hidePopover();
    if (sheet.open) sheet.close();
    for (const trigger of triggers) {
      trigger.setAttribute('aria-controls', phone.matches ? sheet.id : popover.id);
      if (phone.matches) trigger.setAttribute('aria-haspopup', 'dialog');
      else trigger.removeAttribute('aria-haspopup');
    }
  };

  for (const trigger of triggers) {
    trigger.removeAttribute('title');
    trigger.addEventListener('pointerenter', () => { if (!phone.matches && hover.matches) showPopover(trigger); });
    trigger.addEventListener('pointerleave', scheduleClose);
    trigger.addEventListener('focus', () => { if (!phone.matches) showPopover(trigger); });
    trigger.addEventListener('click', () => {
      if (phone.matches) {
        hidePopover();
        fill(sheet, trigger);
        sheetOwner = trigger;
        trigger.setAttribute('aria-expanded', 'true');
        sheet.showModal();
      } else { showPopover(trigger); pinned = true; }
    });
  }
  popover.addEventListener('pointerenter', cancelClose);
  popover.addEventListener('pointerleave', scheduleClose);
  popover.addEventListener('toggle', (event) => { if (event.newState === 'closed' && !popover.matches(':popover-open')) clearOwner(); });
  document.addEventListener('focusin', (event) => { if (owner && event.target !== owner && !popover.contains(event.target)) hidePopover(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hidePopover(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { hidePopover(); if (sheet.open) sheet.close(); } });
  sheet.querySelector('[data-definition-close]').addEventListener('click', () => sheet.close());
  sheet.addEventListener('click', (event) => {
    if (event.target !== sheet) return;
    const r = sheet.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) sheet.close();
  });
  sheet.addEventListener('close', () => { sheetOwner?.setAttribute('aria-expanded', 'false'); sheetOwner = null; });
  window.addEventListener('scroll', hidePopover, { passive: true });
  window.addEventListener('resize', hidePopover);
  phone.addEventListener('change', syncSurface);
  syncSurface();
}
