// TODO: Map response to frontend fields

// ── Sidebar tab navigation (scroll target sections into view) ─────────────
(function () {
  const tabs = document.querySelectorAll('[data-config-tab]');
  if (!tabs.length) return;

  function activate(tab) {
    tabs.forEach((t) => {
      t.classList.remove('text-primary', 'bg-primary/10');
      t.classList.add('text-on-surface/60', 'hover:text-on-surface', 'hover:bg-white/5');
    });
    tab.classList.add('text-primary', 'bg-primary/10');
    tab.classList.remove('text-on-surface/60', 'hover:text-on-surface', 'hover:bg-white/5');
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = tab.getAttribute('data-config-tab');
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        activate(tab);
      }
    });
  });
})();

(function () {
  const panel = document.querySelector('[data-ai-configurator]');
  if (!panel) return;

  const requestInput = panel.querySelector('#ai-request');
  const submitButton = panel.querySelector('[data-ai-submit]');
  const statusEl = panel.querySelector('[data-ai-status]');
  const resultEl = panel.querySelector('[data-ai-result]');
  const rawEl = panel.querySelector('[data-ai-raw]');

  function setStatus(text) {
    if (statusEl) {
      statusEl.textContent = text || '';
    }
  }

  function setBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? 'Generating...' : 'Generate';
  }

  function showResult(payload) {
    if (rawEl) {
      rawEl.textContent = JSON.stringify(payload, null, 2);
    }
    if (resultEl) {
      resultEl.classList.remove('hidden');
    }
  }

  async function requestConfiguration() {
    const text = requestInput.value.trim();
    if (!text) {
      setStatus('Bitte eine Beschreibung eingeben.');
      return;
    }

    setBusy(true);
    setStatus('');

    try {
      const response = await fetch('/api/ai/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const payload = await response.json();
      if (!response.ok) {
        const message = payload && payload.error ? payload.error : 'AI request failed.';
        setStatus(message);
        return;
      }

      showResult(payload);
    } catch (error) {
      setStatus(error.message || 'AI request failed.');
    } finally {
      setBusy(false);
    }
  }

  submitButton.addEventListener('click', requestConfiguration);
})();
