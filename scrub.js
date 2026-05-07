/* VICTOR IA — scroll-scrub canvas animation
   Frames: 241 WebP | Frame 1 at scroll 0%, frame 241 at scroll 100%
   Touch: instant (finger-exact) | Mouse: smooth lerp */

(function () {
  'use strict';

  var TOTAL  = 241;
  var DIR    = 'assets/frames/';
  var EXT    = 'webp';
  var EAGER  = 60;
  var READY  = 0.40;  /* hide loader after 40% of frames loaded */

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  var ctx    = canvas.getContext('2d', { alpha: false });
  var loader = document.getElementById('loader');
  var bar    = document.getElementById('loader-bar');

  /* Touch: instant response. Mouse: smooth lerp over ~5 frames. */
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var EASE    = isTouch ? 1 : 0.15;

  /* ── Canvas sizing ── */
  var resizeT;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(window.innerWidth  * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lastDrawn = -1;
    draw();
  }
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(resize, 120);
  });
  resize();

  /* ── Cover-fit draw ── */
  var lastDrawn = -1;

  function drawCover(img) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = canvas.width / dpr, ch = canvas.height / dpr;
    var iw = img.naturalWidth,   ih = img.naturalHeight;
    if (!iw || !ih) return;
    var r = Math.max(cw / iw, ch / ih);
    ctx.fillStyle = '#0A0E12';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - iw * r) / 2, (ch - ih * r) / 2, iw * r, ih * r);
  }

  function draw() {
    if (!ready) return;
    var idx = Math.min(Math.floor(cur * (TOTAL - 1)), TOTAL - 1);
    if (idx === lastDrawn) return;
    var img = imgs[idx];
    if (img && img.complete && img.naturalWidth) {
      drawCover(img); lastDrawn = idx; return;
    }
    for (var d = 1; d < 30; d++) {
      var b = imgs[idx - d];
      if (b && b.complete && b.naturalWidth) { drawCover(b); lastDrawn = idx - d; return; }
      var f = imgs[idx + d];
      if (f && f.complete && f.naturalWidth) { drawCover(f); lastDrawn = idx + d; return; }
    }
  }

  /* ── Frame preload ── */
  var imgs   = new Array(TOTAL);
  var loaded = 0;
  var ready  = false;
  var loaderOut = false;

  function loadFrame(i, hi) {
    var img = new Image();
    if (hi && 'fetchPriority' in img) img.fetchPriority = 'high';
    img.decoding = 'async';
    img.onload = function () {
      loaded++;
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, loaded / TOTAL) + ')';
      if (i === 0) { ready = true; draw(); }
      if (!loaderOut && loaded / TOTAL >= READY) {
        loaderOut = true;
        if (loader) {
          loader.classList.add('out');
          setTimeout(function () { if (loader) loader.style.display = 'none'; }, 900);
        }
      }
    };
    img.onerror = function () { loaded++; };
    img.src = DIR + 'frame-' + String(i + 1).padStart(4, '0') + '.' + EXT;
    imgs[i] = img;
  }

  /* Eager: first 60 at high priority */
  var eager = Math.min(EAGER, TOTAL);
  for (var e = 0; e < eager; e++) loadFrame(e, true);

  /* Lazy: rest interleaved so middle frames arrive early */
  (function lazyLoad() {
    var q = [], step = 4;
    for (var o = 0; o < step; o++)
      for (var j = eager + o; j < TOTAL; j += step) q.push(j);
    var qi = 0;
    function next() {
      if (qi >= q.length) return;
      loadFrame(q[qi++], false);
      window.requestIdleCallback
        ? requestIdleCallback(next, { timeout: 80 })
        : setTimeout(next, 4);
    }
    window.requestIdleCallback ? requestIdleCallback(next) : setTimeout(next, 60);
  })();

  /* ── Scroll progress ── */
  var tgt = 0, cur = 0;

  function getProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    var y = window.scrollY !== undefined ? window.scrollY : (document.documentElement.scrollTop || 0);
    return Math.max(0, Math.min(1, y / max));
  }

  window.addEventListener('scroll', function () { tgt = getProgress(); }, { passive: true });
  tgt = getProgress();

  /* ── RAF loop ── */
  function tick() {
    tgt = getProgress();
    cur += (tgt - cur) * EASE;
    if (Math.abs(tgt - cur) < 0.0005) cur = tgt;
    draw();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

})();