// ---------------------------------------------------------------------------
// Host-page glue for the configurator micro-frontend.
//
// The iframe at /configurator-ui is loaded from services/configurator-service.
// It owns the UI; we own the cart + order flow. When the user clicks
// "Continue to Checkout" inside the iframe, the iframe posts a message
// up to this page; we bridge it into the existing POST /configurator/order
// form-submit so the order flow itself stays unchanged.
// ---------------------------------------------------------------------------

(function () {
  const form = document.getElementById('configurator-checkout-form');
  const iframe = document.getElementById('configurator-frame');
  if (!form || !iframe) return;

  window.addEventListener('message', (event) => {
    // Same-origin only — the iframe is served via the SSR backend proxy at
    // /configurator-ui, so its window.location.origin matches ours.
    if (event.origin !== window.location.origin) return;

    const data = event.data || {};
    if (data.action !== 'configurator:checkout') return;

    // Fill in the bridge form and submit. We don't validate ids here;
    // the configurator-service has already validated and the SSR backend
    // will re-validate via configuratorClient.build() before rendering
    // the checkout summary.
    form.querySelector('[name="vehicleId"]').value  = data.vehicleId  || '';
    form.querySelector('[name="colorId"]').value    = data.colorId    || '';
    form.querySelector('[name="wheelsId"]').value   = data.wheelsId   || '';
    form.querySelector('[name="interiorId"]').value = data.interiorId || '';
    form.submit();
  });
})();
