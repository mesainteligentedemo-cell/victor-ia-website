/* COSTA NEGRA — Background canvas scroll-scrub
   El video corre de inicio a fin a lo largo de TODO el scroll del sitio.
   Frame 1 al cargar (scroll 0%), último frame al final del scroll (100%).
   Patron: <canvas> position:fixed dibuja el frame correspondiente al
   progreso del scroll global de la página. */

(function () {
  'use strict';

  const stage = document.querySelector('.bg-stage');
  if (!stage) return;

  const canvas = stage.querySelector('.bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  const loader = stage.querySelector('[data-loader]');
  const loaderFill = stage.querySelector('[data-loader-fill]');
  const loaderPct = stage.querySelector('[data-loader-pct]');

  const progressFill = document.querySelector('[data-progress-fill]');
  const progressCurrent = document.querySelector('[data-progress-current]');

  /* ---------- Configuration ----------
     FRAME_COUNT and TOTAL_SECTIONS are read from data-* attributes on
     <div class="bg-stage" data-frame-count="361" data-total-sections="10">.
     The values come from manifest.json (frame_count) and the number of
     <section> blocks in the page. Set them in HTML, not here. */
  const FRAME_COUNT = parseInt(stage.dataset.frameCount, 10) || 0;
  const TOTAL_SECTIONS = parseInt(stage.dataset.totalSections, 10) || 1;
  const FRAMES_DIR = 'assets/frames/';
  const FRAME_PAD = 4;
  const FRAME_EXT = 'webp';
  const PRELOAD_PRIORITY = 50;       /* first N frames load eagerly */
  const READY_THRESHOLD = 0.40;      /* hide loader at 40% loaded */

  if (!FRAME_COUNT) {
    console.warn('[bg-scrub] data-frame-count missing on .bg-stage');
    return;
  }

  /* ---------- Mobile fallback ---------- */
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.matchMedia('(max-width: 900px)').matches;
  const isMobile = isCoarse || isNarrow;

  if (isMobile) {
    /* Mobile: just show frame 1 statically. Loading 26 MB is unacceptable. */
    document.documentElement.classList.add('is-mobile');
    const poster = new Image();
    poster.decoding = 'async';
    poster.onload = () => {
      resize();
      drawCover(poster);
      hideLoader();
    };
    poster.src = FRAMES_DIR + 'frame-' + pad(1) + '.' + FRAME_EXT;
    return;
  }

  /* ---------- Frame preload ---------- */
  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let firstFrameReady = false;
  let readyForScrub = false;

  function pad(n) { return String(n).padStart(FRAME_PAD, '0'); }
  function frameUrl(i) {
    return FRAMES_DIR + 'frame-' + pad(i + 1) + '.' + FRAME_EXT;
  }

  function loadFrame(i, eager) {
    const img = new Image();
    if (eager && 'fetchPriority' in img) img.fetchPriority = 'high';
    img.decoding = 'async';
    img.onload = () => {
      loadedCount++;
      updateLoader();
      if (i === 0) {
        firstFrameReady = true;
        drawCurrent();
      }
      if (!readyForScrub && loadedCount / FRAME_COUNT >= READY_THRESHOLD) {
        readyForScrub = true;
        hideLoader();
      }
    };
    img.onerror = () => {
      loadedCount++;
      updateLoader();
    };
    img.src = frameUrl(i);
    images[i] = img;
  }

  function updateLoader() {
    if (!loader) return;
    const pct = Math.min(100, Math.round((loadedCount / FRAME_COUNT) * 100));
    if (loaderFill) loaderFill.style.transform = 'scaleX(' + pct / 100 + ')';
    if (loaderPct) loaderPct.textContent = pct;
  }

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('is-hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 700);
  }

  /* Eager: priority frames */
  const priority = Math.min(PRELOAD_PRIORITY, FRAME_COUNT);
  for (let i = 0; i < priority; i++) loadFrame(i, true);

  /* Lazy: rest, interleaved across the timeline so middle frames also
     come in early (avoids gap when the user scrolls fast to the middle) */
  function lazyLoad() {
    const remaining = [];
    for (let i = priority; i < FRAME_COUNT; i++) remaining.push(i);
    /* Interleave: every Nth frame, then fill in the gaps */
    const queue = [];
    const step = 4;
    for (let offset = 0; offset < step; offset++) {
      for (let i = offset; i < remaining.length; i += step) {
        queue.push(remaining[i]);
      }
    }
    let idx = 0;
    function next() {
      if (idx >= queue.length) return;
      loadFrame(queue[idx++], false);
      if (window.requestIdleCallback) {
        requestIdleCallback(next, { timeout: 100 });
      } else {
        setTimeout(next, 6);
      }
    }
    next();
  }
  if (window.requestIdleCallback) {
    requestIdleCallback(lazyLoad);
  } else {
    setTimeout(lazyLoad, 80);
  }

  /* ---------- Canvas sizing ---------- */
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCurrent();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });
  resize();

  /* ---------- Cover-fit ---------- */
  function drawCover(img) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const ratio = Math.max(cw / iw, ch / ih);
    const w = iw * ratio;
    const h = ih * ratio;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    ctx.fillStyle = '#0A0E12';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }

  /* ---------- Global scroll progress driver ---------- */
  let target = 0;
  let current = 0;
  const easing = 0.20;
  let lastDrawn = -1;
  let activeSection = -1;

  function getGlobalProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    return Math.max(0, Math.min(1, y / max));
  }

  function drawCurrent() {
    if (!firstFrameReady) return;
    const idx = Math.min(
      Math.floor(current * (FRAME_COUNT - 1)),
      FRAME_COUNT - 1
    );
    if (idx === lastDrawn) return;

    const img = images[idx];
    if (img && img.complete && img.naturalWidth) {
      drawCover(img);
      lastDrawn = idx;
    } else {
      /* Fallback: nearest available frame within ±25 */
      let near = idx;
      for (let d = 1; d < 25; d++) {
        if (images[idx - d] && images[idx - d].complete && images[idx - d].naturalWidth) {
          near = idx - d; break;
        }
        if (images[idx + d] && images[idx + d].complete && images[idx + d].naturalWidth) {
          near = idx + d; break;
        }
      }
      if (images[near] && images[near].complete) {
        drawCover(images[near]);
        lastDrawn = near;
      }
    }
  }

  function tick() {
    const progress = getGlobalProgress();
    target = progress;
    current += (target - current) * easing;
    if (Math.abs(target - current) < 0.0005) current = target;

    drawCurrent();

    /* Section number indicator (which of the 10 sections is active) */
    let secIdx = Math.floor(progress * TOTAL_SECTIONS);
    if (secIdx >= TOTAL_SECTIONS) secIdx = TOTAL_SECTIONS - 1;
    if (secIdx !== activeSection) {
      if (progressCurrent) {
        progressCurrent.textContent = String(secIdx + 1).padStart(2, '0');
      }
      activeSection = secIdx;
    }

    /* Progress bar fill */
    if (progressFill) {
      progressFill.style.transform = 'scaleY(' + progress + ')';
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
