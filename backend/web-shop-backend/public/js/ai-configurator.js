/* ---------------------------------------------------------------------------
 * Aether Motors – AI configurator (client-side island)
 *
 * Sits in the configurator sidebar. Sends the user's free-text prompt to
 * POST /api/ai/configure (proxied to the ai-service which calls Gemini —
 * see ADR10), then:
 *
 *   - displays the human-readable `summary` sentence
 *   - lists the picked options as "Color · Wheels · Interior"
 *   - flags `meta.fallback === true` so the user knows we're in fallback
 *   - enables the Apply button, which reloads /configurator with the AI's
 *     selections as query params (server-side renders the new view).
 *
 * No raw JSON is shown — that was useful during development but is noise
 * for users. The full payload still arrives in the network tab for anyone
 * who wants to inspect it.
 * --------------------------------------------------------------------------- */

// ── Sidebar tab navigation (scroll target sections into view) ───────────────
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

// ── AI configurator panel ───────────────────────────────────────────────────
(function () {
  const panel = document.querySelector('[data-ai-configurator]');
  if (!panel) return;

  const requestInput   = panel.querySelector('#ai-request');
  const submitButton   = panel.querySelector('[data-ai-submit]');
  const applyButton    = panel.querySelector('[data-ai-apply]');
  const statusEl       = panel.querySelector('[data-ai-status]');
  const resultEl       = panel.querySelector('[data-ai-result]');
  const summaryEl      = panel.querySelector('[data-ai-summary]');
  const selectionsEl   = panel.querySelector('[data-ai-selections]');
  const fallbackEl     = panel.querySelector('[data-ai-fallback]');

  let pendingSelections = null;

  // ── Helpers ─────────────────────────────────────────────────────────────
  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || '';
  }

  function setBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? 'Generating…' : 'Generate';
  }

  /** Map a slug (e.g. 'matte-charcoal') to its displayed label by looking
   * up the corresponding selector card on the same page. Falls back to a
   * pretty-printed slug ('matte-charcoal' → 'Matte Charcoal'). */
  function labelFor(category, slug) {
    if (!slug) return null;
    // Selector links carry an href like
    //   ?color=metallic-blue&wheels=…&interior=…
    // We find the link whose query string sets THIS category to THIS slug
    // and return its visible label.
    const selector = document.querySelector(
      'a[href*="' + category + '=' + slug + '"]'
    );
    if (selector) {
      const span = selector.querySelector('span, .truncate, .text-xs');
      if (span && span.textContent.trim()) return span.textContent.trim();
      const txt = selector.textContent.trim().split('\n').map(s => s.trim()).filter(Boolean)[0];
      if (txt) return txt;
    }
    // Fallback: title-case the slug
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  function renderSelections(selections) {
    if (!selectionsEl) return;
    const rows = [];
    if (selections.colors)    rows.push(['Color',    labelFor('color',    selections.colors)]);
    if (selections.wheels)    rows.push(['Wheels',   labelFor('wheels',   selections.wheels)]);
    if (selections.interiors) rows.push(['Interior', labelFor('interior', selections.interiors)]);
    selectionsEl.innerHTML = rows
      .map(([k, v]) =>
        '<li class="flex justify-between gap-3">' +
          '<span class="text-on-surface/40">' + escapeHtml(k) + '</span>' +
          '<span class="font-semibold text-on-surface">' + escapeHtml(v) + '</span>' +
        '</li>'
      )
      .join('');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function showResult(payload) {
    const selections = (payload.configuration && payload.configuration.selections) || {};
    pendingSelections = selections;

    if (summaryEl)    summaryEl.textContent = payload.summary || 'Konfiguration vorgeschlagen.';
    renderSelections(selections);

    if (fallbackEl) {
      const isFallback = payload.meta && payload.meta.fallback === true;
      fallbackEl.classList.toggle('hidden', !isFallback);
    }

    if (resultEl) resultEl.classList.remove('hidden');
    if (applyButton) applyButton.disabled = false;
  }

  // ── Network ────────────────────────────────────────────────────────────
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
        body: JSON.stringify({ text }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setStatus((payload && payload.error) || 'AI request failed.');
        return;
      }
      showResult(payload);
    } catch (error) {
      setStatus(error.message || 'AI request failed.');
    } finally {
      setBusy(false);
    }
  }

  // ── Apply: navigate to /configurator with the picked selections so the
  //     server renders the new combo body shot + sidebar selection. ──────
  function applyConfiguration() {
    if (!pendingSelections) return;
    const params = new URLSearchParams();
    if (pendingSelections.colors)    params.set('color',    pendingSelections.colors);
    if (pendingSelections.wheels)    params.set('wheels',   pendingSelections.wheels);
    if (pendingSelections.interiors) params.set('interior', pendingSelections.interiors);
    window.location.href = '/configurator?' + params.toString();
  }

  // ── Wiring ─────────────────────────────────────────────────────────────
  if (submitButton) submitButton.addEventListener('click', requestConfiguration);
  if (applyButton)  applyButton.addEventListener('click', applyConfiguration);

  // Enter in the textarea submits (Shift+Enter inserts newline)
  if (requestInput) {
    requestInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey && !ev.repeat) {
        ev.preventDefault();
        requestConfiguration();
      }
    });
  }
})();
