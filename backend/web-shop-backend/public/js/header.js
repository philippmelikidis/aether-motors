(function () {
  const toggle = document.querySelector('[data-mobile-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const icon = toggle && toggle.querySelector('[data-menu-icon]');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    toggle.setAttribute('aria-expanded', String(!isOpen));
    if (icon) icon.textContent = isOpen ? 'menu' : 'close';
  });

  const cartToggle = document.querySelector('[data-cart-toggle]');
  if (cartToggle) {
    cartToggle.addEventListener('click', function () {
      const drawer = document.querySelector('[data-cart-drawer]');
      if (drawer) {
        drawer.hidden = false;
        document.body.style.overflow = 'hidden';
      } else {
        window.location.href = '/cart';
      }
    });
  }
})();
