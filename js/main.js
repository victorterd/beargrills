(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function formatLei(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' lei';
  }

  /* ---------- Anunțuri rotative ---------- */
  var msgs = $$('.announce__msg');
  var msgIndex = 0;
  function showMsg(i) {
    msgs[msgIndex].classList.remove('is-active');
    msgIndex = (i + msgs.length) % msgs.length;
    msgs[msgIndex].classList.add('is-active');
  }
  var announceTimer = setInterval(function () { showMsg(msgIndex + 1); }, 4000);
  $$('[data-announce]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      clearInterval(announceTimer);
      showMsg(msgIndex + parseInt(btn.dataset.announce, 10));
    });
  });

  /* ---------- Meniu mobil ---------- */
  var menuBtn = $('#menu-toggle');
  var drawer = $('#drawer');
  menuBtn.addEventListener('click', function () {
    var open = drawer.hidden;
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('a', drawer).forEach(function (a) {
    a.addEventListener('click', function () {
      drawer.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Galerie ---------- */
  var slides = $$('.slide');
  var thumbs = $('#thumbs');
  var current = 0;
  function goTo(i) {
    slides[current].classList.remove('is-active');
    thumbs.children[current].classList.remove('is-active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    thumbs.children[current].classList.add('is-active');
  }
  slides.forEach(function (slide, i) {
    var img = $('img', slide);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb' + (i === 0 ? ' is-active' : '');
    btn.setAttribute('aria-label', 'Poza ' + (i + 1));
    if (slide.hasAttribute('data-zoom')) btn.setAttribute('data-zoom', '');
    var t = document.createElement('img');
    t.src = img.src;
    t.alt = '';
    t.setAttribute('style', img.getAttribute('style') || '');
    btn.appendChild(t);
    btn.addEventListener('click', function () { goTo(i); });
    thumbs.appendChild(btn);
  });
  $$('[data-slide]').forEach(function (btn) {
    btn.addEventListener('click', function () { goTo(current + parseInt(btn.dataset.slide, 10)); });
  });
  if (slides.length < 2) {
    thumbs.hidden = true;
    $$('.gallery__arrow').forEach(function (b) { b.hidden = true; });
  }
  // swipe pe mobil
  var stage = $('.gallery__stage');
  var startX = null;
  stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  /* ---------- Pachet + blat -> preț ---------- */
  var state = { price: 1950, old: 2290, name: 'Grătar Bear Grills', wood: 'Stejar natural' };
  function renderPrice() {
    $$('[data-price-now]').forEach(function (el) { el.textContent = formatLei(state.price); });
    $$('[data-price-old]').forEach(function (el) { el.textContent = formatLei(state.old); });
    $$('[data-bundle-name]').forEach(function (el) { el.textContent = state.name; });
  }
  $$('input[name="bundle"]').forEach(function (input) {
    input.addEventListener('change', function () {
      state.price = parseInt(input.dataset.price, 10);
      state.old = parseInt(input.dataset.old, 10);
      state.name = input.dataset.name;
      renderPrice();
    });
  });
  $$('input[name="wood"]').forEach(function (input) {
    input.addEventListener('change', function () {
      state.wood = input.value;
      $('#wood-name').textContent = input.value;
    });
  });

  /* ---------- Data estimată de livrare (+3 zile lucrătoare) ---------- */
  function addBusinessDays(date, days) {
    var d = new Date(date);
    while (days > 0) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) days--;
    }
    return d;
  }
  var eta = addBusinessDays(new Date(), 3);
  $('#eta').textContent = eta.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });

  /* ---------- Tabs ---------- */
  var tabs = $$('[role="tab"]');
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  /* ---------- Avatare: inițiale dacă lipsește poza ---------- */
  $$('.avatar[data-initials]').forEach(function (img) {
    function fallback() {
      var el = document.createElement('span');
      el.className = img.className + ' avatar--initials';
      el.textContent = img.dataset.initials;
      el.setAttribute('aria-hidden', 'true');
      img.replaceWith(el);
    }
    if (img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener('error', fallback);
  });

  /* ---------- Sticky CTA ---------- */
  var sticky = $('#sticky-cta');
  var stickyBtn = $('button', sticky);
  var buyButton = $('#buy-button');
  var finalSection = $('.final');
  var buyVisible = true;
  var finalVisible = false;
  function updateSticky() {
    var show = !buyVisible && !finalVisible;
    sticky.classList.toggle('is-visible', show);
    sticky.setAttribute('aria-hidden', String(!show));
    stickyBtn.tabIndex = show ? 0 : -1;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      buyVisible = e.isIntersecting || e.boundingClientRect.top > 0;
      updateSticky();
    }).observe(buyButton);
    new IntersectionObserver(function (entries) {
      finalVisible = entries[0].isIntersecting;
      updateSticky();
    }).observe(finalSection);
  }

  /* ---------- Comandă (de legat la coș / checkout) ---------- */
  var toast = $('#toast');
  var cartCount = $('#cart-count');
  var count = 0;
  var toastTimer;
  $$('[data-order]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      count++;
      cartCount.textContent = count;
      cartCount.hidden = false;
      toast.textContent = '✓ ' + state.name + ' · blat ' + state.wood.toLowerCase() + ' — adăugat în coș';
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
    });
  });
})();
