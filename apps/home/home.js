/* GOV Assured home — page behaviour (moved out of an inline <script> so a strict CSP needs no 'unsafe-inline'). */
var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  /* Sticky header: compact it once the page scrolls, and keep the anchor
     scroll offset matched to the header's real height at any breakpoint. */
  (function () {
    var header = document.querySelector('.gv-header');
    if (!header) return;

    function syncHeight() {
      document.documentElement.style.setProperty(
        '--header-h', (header.offsetHeight + 16) + 'px'
      );
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-stuck', window.scrollY > 20);
        syncHeight();
        ticking = false;
      });
    }

    syncHeight();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncHeight);
    if (window.ResizeObserver) new ResizeObserver(syncHeight).observe(header);

    /* Mobile menu. The .js-nav class is only added here, so with scripting
       disabled the nav links stay visible and no dead button is shown. */
    var toggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    header.classList.add('js-nav');

    function setNav(open) {
      header.classList.toggle('is-nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      syncHeight();
    }

    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    /* Close after choosing a destination */
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    /* Escape closes and returns focus to the button */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-nav-open')) {
        setNav(false);
        toggle.focus();
      }
    });

    /* Reset state when the viewport grows past the mobile breakpoint */
    var wide = window.matchMedia('(min-width: 40.0625em)');
    function onBreakpoint(e) { if (e.matches) setNav(false); }
    if (wide.addEventListener) wide.addEventListener('change', onBreakpoint);
    else if (wide.addListener) wide.addListener(onBreakpoint);
  })();
