// ---------------------------------------------------------------------------
// Configurator iframe-side JavaScript.
//
// Two responsibilities:
//   1. AI panel — POST to /api/ai/configure (proxied through the SSR
//      backend when embedded; relative URL works in both embed + standalone
//      mode), render the summary + selections, and on "Apply" navigate the
//      iframe to ?color=…&wheels=…&interior=…
//   2. Checkout — when the user clicks "Continue to Checkout", we DON'T
//      navigate the iframe. We post a message to window.parent which then
//      hands off to the SSR backend's /configurator/order flow. This keeps
//      cart + order responsibilities cleanly with the parent.
// ---------------------------------------------------------------------------

(function () {
  const panel = document.querySelector('[data-ai-configurator]');
  if (!panel) return;

  const requestInput = panel.querySelector('#ai-request');
  const submitButton = panel.querySelector('[data-ai-submit]');
  const applyButton  = panel.querySelector('[data-ai-apply]');
  const statusEl     = panel.querySelector('[data-ai-status]');
  const resultEl     = panel.querySelector('[data-ai-result]');
  const summaryEl    = panel.querySelector('[data-ai-summary]');
  const selectionsEl = panel.querySelector('[data-ai-selections]');

  let pendingSelections = null;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || '';
  }
  function setBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.classList.toggle('opacity-50', isBusy);
    submitButton.classList.toggle('cursor-not-allowed', isBusy);
  }

  // Map AI category → matching DOM section, used to look up the human
  // label for a slug without depending on a separate dictionary endpoint.
  // We don't have section IDs here, so we scope to <a href="?<category>=...">
  // links and pick the one whose visible text exists.
  function labelFor(category, slug) {
    if (!slug) return null;
    // Find the link whose href matches THIS category=<slug> AND lives in a
    // section whose first link starts with the same category key.
    const candidates = document.querySelectorAll(
      'a[href*="' + category + '=' + slug + '"]'
    );
    for (const a of candidates) {
      const txt = a.textContent.trim().split('\n').map(s => s.trim()).filter(Boolean)[0];
      if (txt) return txt;
    }
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderSelections(selections) {
    if (!selectionsEl) return;
    const rows = [];
    if (selections.colors)    rows.push(['Color',    labelFor('color',    selections.colors)]);
    if (selections.wheels)    rows.push(['Wheels',   labelFor('wheels',   selections.wheels)]);
    if (selections.interiors) rows.push(['Interior', labelFor('interior', selections.interiors)]);
    selectionsEl.innerHTML = rows.map(([k, v]) =>
      '<li class="flex justify-between gap-3">' +
        '<span class="text-on-surface/40">' + escapeHtml(k) + '</span>' +
        '<span class="font-semibold text-on-surface">' + escapeHtml(v) + '</span>' +
      '</li>'
    ).join('');
  }

  function showResult(payload) {
    const cfg = payload && payload.configuration;
    const selections = cfg && cfg.selections;
    if (!selections) return;

    pendingSelections = selections;
    summaryEl.textContent = payload.summary || 'AI suggestion ready.';
    renderSelections(selections);

    resultEl.classList.remove('hidden');
    applyButton.disabled = false;
  }

  async function submitRequest() {
    const prompt = (requestInput.value || '').trim();
    if (!prompt) {
      setStatus('Please describe your dream configuration first.');
      return;
    }
    setBusy(true);
    setStatus('Generating…');
    applyButton.disabled = true;

    try {
      const response = await fetch('/api/ai/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentColor:    panel.dataset.currentColor,
          currentWheels:   panel.dataset.currentWheels,
          currentInterior: panel.dataset.currentInterior,
        }),
      });
      if (response.status === 503) {
        setStatus('AI not available — set GEMINI_API_KEY in .env.');
        return;
      }
      if (response.status === 502) {
        setStatus('AI call failed — please try again.');
        return;
      }
      if (!response.ok) throw new Error('AI service responded ' + response.status);
      const payload = await response.json();
      showResult(payload);
      setStatus('Done');
    } catch (err) {
      setStatus('Sorry, something went wrong (' + err.message + ').');
    } finally {
      setBusy(false);
    }
  }

  function applyConfiguration() {
    if (!pendingSelections) return;
    const params = new URLSearchParams();
    if (pendingSelections.colors)    params.set('color',    pendingSelections.colors);
    if (pendingSelections.wheels)    params.set('wheels',   pendingSelections.wheels);
    if (pendingSelections.interiors) params.set('interior', pendingSelections.interiors);
    // Stay inside the iframe — relative URL works for both embed + standalone.
    window.location.href = '?' + params.toString();
  }

  if (submitButton) submitButton.addEventListener('click', submitRequest);
  if (applyButton)  applyButton.addEventListener('click', applyConfiguration);
  if (requestInput) {
    requestInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        submitRequest();
      }
    });
  }
})();

// ── Checkout hand-off via postMessage ───────────────────────────────────
(function () {
  const button = document.querySelector('[data-checkout-button]');
  if (!button) return;

  button.addEventListener('click', () => {
    const payload = {
      action: 'configurator:checkout',
      vehicleId:  button.dataset.vehicleId,
      colorId:    button.dataset.colorId,
      wheelsId:   button.dataset.wheelsId,
      interiorId: button.dataset.interiorId,
    };
    // If we're embedded in an iframe, hand off to the parent. Otherwise
    // (standalone debug mode), just log so the page doesn't appear dead.
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(payload, '*');
    } else {
      console.info('[configurator] checkout payload (no parent to receive):', payload);
    }
  });
})();
