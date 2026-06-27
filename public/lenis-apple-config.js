/**
 * LENIS — APPLE SCROLL CALIBRATION
 * Momentum scrolling with natural acceleration/deceleration
 * Duration: 1.2s (faster than default, matches Apple devices)
 * Easing: Expo out (natural physics)
 * Touch: 2x multiplier for mobile feel
 * Includes: Lenis + ScrollTrigger + Custom Cursor + Progress Bar
 */

(function initLenisApple() {
  'use strict';

  if (!window.Lenis) {
    console.error('[Lenis] Library not loaded. Ensure lenis@1.1.14 is loaded before this script.');
    return;
  }

  // Initialize Lenis with Apple-calibrated parameters
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t), // Expo out
    smoothWheel: true,
    touchMultiplier: 2,
    wheelMultiplier: 1,
  });

  // RAF loop
  (function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  })(0);

  // ScrollTrigger integration (if available)
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ──────────────────────────────────────────────────
  // CUSTOM CURSOR (lerp lag)
  // ──────────────────────────────────────────────────
  const dot = document.getElementById('cur-d');
  const ring = document.getElementById('cur-r');
  if (dot && ring) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let rx = cx, ry = cy;
    const LF = 0.10;
    let cursorVisible = false;

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX; cy = e.clientY;
      if (!cursorVisible) { cursorVisible = true; dot.style.opacity = '1'; ring.style.opacity = '1'; }
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; cursorVisible = false; });
    document.addEventListener('mousedown', () => ring.classList.add('shrink'));
    document.addEventListener('mouseup', () => ring.classList.remove('shrink'));
    document.querySelectorAll('a,button,[data-hover]').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('expand'));
      el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
    });

    (function animCursor() {
      rx += (cx - rx) * LF; ry += (cy - ry) * LF;
      dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animCursor);
    })();
  }

  // ──────────────────────────────────────────────────
  // SCROLL PROGRESS BAR
  // ──────────────────────────────────────────────────
  const pbar = document.getElementById('pbar');
  if (pbar) {
    lenis.on('scroll', ({ progress }) => {
      pbar.style.width = (progress * 100) + '%';
    });
  }

  // Expose globally for debugging
  window.__lenis = lenis;
})();
