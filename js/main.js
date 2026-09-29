(function () {
  // Galerie: click pe thumbnail schimbă poza principală
  var main = document.getElementById('gallery-main');
  document.querySelectorAll('.thumb').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      document.querySelectorAll('.thumb').forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
      main.style.opacity = 0;
      setTimeout(function () {
        main.src = thumb.dataset.src;
        main.style.opacity = 1;
      }, 150);
    });
  });

  // Cantitate
  var qty = document.getElementById('qty');
  document.querySelectorAll('[data-qty]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = (parseInt(qty.value, 10) || 1) + parseInt(btn.dataset.qty, 10);
      qty.value = Math.min(10, Math.max(1, next));
    });
  });

  // Avatare: dacă poza lipsește, afișăm inițialele
  document.querySelectorAll('.avatar[data-initials]').forEach(function (img) {
    function fallback() {
      var el = document.createElement('span');
      el.className = 'avatar avatar--initials';
      el.textContent = img.dataset.initials;
      el.setAttribute('aria-hidden', 'true');
      img.replaceWith(el);
    }
    if (img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener('error', fallback);
  });

  // Sticky CTA: apare când butonul principal iese din ecran
  var sticky = document.getElementById('sticky-cta');
  var buyButton = document.getElementById('buy-button');
  var stickyBtn = sticky.querySelector('button');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var hidden = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      sticky.classList.toggle('is-visible', hidden);
      sticky.setAttribute('aria-hidden', String(!hidden));
      stickyBtn.tabIndex = hidden ? 0 : -1;
    }).observe(buyButton);
  }

  // Comandă: de conectat la coș / checkout
  var toast = document.getElementById('toast');
  var toastTimer;
  document.querySelectorAll('[data-order]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      toast.textContent = 'Adăugat în coș · ' + (qty.value || 1) + ' × Grătar Bear Grills';
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2400);
    });
  });
})();
