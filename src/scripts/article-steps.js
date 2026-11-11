for (const figure of document.querySelectorAll('[data-article-steps]')) {
  const kind = figure.dataset.articleSteps;
  const buttons = [...figure.querySelectorAll('[data-step]')];
  const result = figure.querySelector('[role="status"]');
  figure.querySelector('[data-step-controls]').hidden = false;
  for (const button of buttons) button.addEventListener('click', () => {
    const step = Number(button.dataset.step);
    for (const other of buttons) {
      const selected = other === button;
      other.setAttribute('aria-pressed', String(selected));
      other.classList.toggle('primary', selected);
      other.classList.toggle('secondary', !selected);
    }
    if (kind === 'energy') {
      const energy = [5, 3, 2][step];
      figure.querySelector('[data-energy-supply]').textContent = `${energy} eV`;
      figure.querySelector('[data-energy-bar]').style.width = `${energy / 5 * 100}%`;
      figure.querySelector('[data-kinetic-bar]').style.width = `${Math.max(0, energy - 3) / 5 * 100}%`;
      result.textContent = [
        '5 − 3 = 2 eV left for the fastest electron.',
        '3 − 3 = 0 eV. The photon just meets the escape requirement.',
        '2 eV is less than the 3 eV needed. No electron is emitted.',
      ][step];
    } else if (kind === 'reaction') {
      const remaining = 100 / 2 ** step;
      figure.querySelector('[data-remaining]').style.width = `${remaining}%`;
      figure.querySelector('[data-reacted]').style.width = `${100 - remaining}%`;
      result.textContent = `${remaining}% remains. ${100 - remaining}% has reacted.`;
      figure.querySelector('[data-reaction-bar]').setAttribute('aria-label', result.textContent);
    } else if (kind === 'functions') {
      const outputs = [['a', 'a', 'b', 'c'], ['a', 'a', 'b', 'b'], ['a', 'a', 'a', 'a']][step];
      figure.querySelectorAll('[data-function-output]').forEach((node, i) => { node.textContent = outputs[i]; });
      result.textContent = [
        'a, b and c are used. This function is onto.',
        'c is unused. This function is not onto.',
        'b and c are unused. This function belongs to both missing-b and missing-c groups.',
      ][step];
    }
  });
}
