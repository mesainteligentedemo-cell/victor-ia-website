/* COSTA NEGRA — Reveal-on-scroll bidireccional */

(function () {
  'use strict';

  const SELECTORS = [
    '.fleet-card',
    '.steps li',
    '.included-grid li',
    '.area-list li',
    '.req-card',
    '.why-card',
    '.quote',
    '.faq-item'
  ];

  const targets = [];
  SELECTORS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('reveal');
      targets.push(el);
    });
  });

  if (!targets.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '-6% 0px -6% 0px'
  });

  targets.forEach(function (el) { observer.observe(el); });
})();
