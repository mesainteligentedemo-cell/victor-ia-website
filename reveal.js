/* Victor IA — reveal.js
   - Header: visible after loader hides
   - Scroll hint: visible after loader, hidden on first scroll
   - Sections: Intersection Observer fade-in */

(function () {
  'use strict';

  var loader  = document.getElementById('loader');
  var header  = document.getElementById('site-header');
  var hint    = document.getElementById('scroll-hint');

  /* ── Post-loader reveals ── */
  var hintShown = false;

  function onLoaderOut() {
    if (header) header.classList.add('visible');
    if (hint && !hintShown) {
      hintShown = true;
      /* Small delay so hint appears after loader fully fades */
      setTimeout(function () { hint.classList.add('visible'); }, 350);
    }
  }

  /* Poll for scrub.js setting loader.out */
  var pollId = setInterval(function () {
    if (!loader || loader.classList.contains('out') || loader.style.display === 'none') {
      clearInterval(pollId);
      onLoaderOut();
    }
  }, 60);

  /* Hard fallback */
  setTimeout(function () { clearInterval(pollId); onLoaderOut(); }, 5000);

  /* ── Hide scroll hint on first scroll ── */
  var scrolled = false;

  /* ── DESLIZAR CTA ── */
  var deslizar   = document.getElementById('deslizar');
  var scrollBody = document.getElementById('scroll-body');
  var dszActive  = false;  /* animation plays only once */

  function updateDeslizar() {
    if (!deslizar || !scrollBody) return;
    var sbTop    = scrollBody.offsetTop;
    var sbHeight = scrollBody.offsetHeight;   /* 500vh */
    var sy       = window.scrollY;
    var prog     = (sy - sbTop) / sbHeight;   /* 0–1 within scroll-body */

    /* Show during last ~22% of the video scroll */
    if (prog >= 0.78 && prog <= 1.02) {
      deslizar.classList.add('visible');
      /* Trigger entrance animation exactly once */
      if (!dszActive) {
        dszActive = true;
        /* Tiny delay so 'visible' paints first */
        requestAnimationFrame(function () {
          deslizar.classList.add('active');
        });
      }
    } else {
      deslizar.classList.remove('visible');
    }
  }

  /* Smooth scroll to first content section on click */
  if (deslizar) {
    deslizar.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById('servicios');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  window.addEventListener('scroll', function () {
    if (!scrolled && window.scrollY > 8) {
      scrolled = true;
      if (hint) { hint.classList.remove('visible'); hint.classList.add('hidden'); }
    }
    updateDeslizar();
  }, { passive: true });

  updateDeslizar();

  /* ── Intersection Observer for .reveal-block ── */
  var blocks = document.querySelectorAll('.reveal-block');
  if (!blocks.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  blocks.forEach(function (b) { observer.observe(b); });

})();