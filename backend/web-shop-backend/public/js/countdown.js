(function () {
  const root = document.querySelector('[data-countdown]');
  if (!root) return;

  let h = parseInt(root.dataset.hours, 10) || 0;
  let m = parseInt(root.dataset.minutes, 10) || 0;
  let s = parseInt(root.dataset.seconds, 10) || 0;

  const hEl = root.querySelector('[data-countdown-hours]');
  const mEl = root.querySelector('[data-countdown-minutes]');
  const sEl = root.querySelector('[data-countdown-seconds]');

  const pad = (n) => String(n).padStart(2, '0');

  const render = () => {
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
  };

  setInterval(() => {
    if (s > 0) {
      s--;
    } else if (m > 0) {
      m--;
      s = 59;
    } else if (h > 0) {
      h--;
      m = 59;
      s = 59;
    } else {
      return;
    }
    render();
  }, 1000);
})();
