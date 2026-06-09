/* ---------------------------------------------------------------------------
 * Aether Motors – Gallery YouTube player
 *
 * Tiny vanilla-JS island that turns any element with a `data-gallery-video`
 * attribute into a click-target which opens an embedded YouTube player in
 * a full-screen modal. The iframe `src` is only assigned when the user
 * actually clicks Play, so no YouTube tracking happens on first paint.
 *
 * Closes on:
 *   - Click on the close button (`[data-gallery-close]`)
 *   - Click on the backdrop (outside the player frame)
 *   - Pressing Escape
 *
 * Re-uses one global modal `#gallery-player`; no DOM is added at runtime.
 * --------------------------------------------------------------------------- */
(function () {
  'use strict';

  const modal = document.getElementById('gallery-player');
  const frame = document.getElementById('gallery-player-frame');
  const titleEl = document.getElementById('gallery-player-title');
  if (!modal || !frame) return;

  let previouslyFocused = null;

  function openPlayer(videoId, title) {
    if (!videoId) return;
    const cleanId = String(videoId).trim();
    if (!cleanId) return;

    // Privacy-enhanced embed, autoplay-on-open, no related-video sidebar,
    // no in-player branding, no upload links.
    const url =
      'https://www.youtube-nocookie.com/embed/' +
      encodeURIComponent(cleanId) +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    frame.setAttribute('src', url);
    frame.setAttribute('title', title || 'Video');
    if (titleEl) titleEl.textContent = title || '';

    previouslyFocused = document.activeElement;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    // Focus the close button for keyboard users
    const closeBtn = modal.querySelector('[data-gallery-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closePlayer() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    // Wipe the iframe src so the video actually stops (otherwise autoplay
    // keeps running with audio behind the hidden modal).
    frame.setAttribute('src', 'about:blank');
    frame.setAttribute('title', '');
    if (titleEl) titleEl.textContent = '';
    document.body.style.overflow = '';
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  }

  // Open: any element carrying data-gallery-video
  document.addEventListener('click', function (ev) {
    const trigger = ev.target.closest('[data-gallery-video]');
    if (!trigger) return;
    const videoId = trigger.getAttribute('data-gallery-video');
    if (!videoId) return;
    ev.preventDefault();
    openPlayer(videoId, trigger.getAttribute('data-gallery-title'));
  });

  // Close: explicit close button OR backdrop click
  modal.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-gallery-close]')) {
      closePlayer();
      return;
    }
    if (ev.target === modal) closePlayer();
  });

  // Escape to close
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !modal.classList.contains('hidden')) {
      closePlayer();
    }
  });
})();
