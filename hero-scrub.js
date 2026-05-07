/* VICTOR-IA — Hero canvas scroll-scrub
   Pattern: Apple AirPods Max product page.
   Pre-extracted frame sequence drawn to <canvas>, scroll progress drives
   which frame is shown. Replaces <video currentTime> which is unreliable
   on iOS Safari and keyframe-bound across all browsers. */

(function () {
  'use strict';

  const heroScroll = document.querySelector('.hero-scroll');
  if (!heroScroll) return;

  const canvas = heroScroll.querySelector('.hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  const textFrames = Array.from(heroScroll.querySelectorAll('.hero-frame'));
  const progressFill = heroScroll.querySelector('[data-progress-fill]');
  const progressCurrent = heroScroll.querySelector('[data-progress-current]');
  const loader = heroScroll.querySelector('[data-loader]');
  const loaderFill = heroScroll.querySelector('[data-loader-fill]');
  const loaderPct = heroScroll.querySelector('[data-loader-pct]');

  /* ---------- Configuration ---------- */
  const FRAME_COUNT = parseInt(heroScroll.dataset.frameCount, 10) || 193;
  const FRAMES_DIR = 'assets/frames/';
  const FRAME_PAD = 4;
  const FRAME_EXT = 'webp';
  const PRELOAD_PRIORITY = 30;        // first N frames load eagerly
  const READY_THRESHOLD = 0.85;       // hide loader at 85% loaded

  /* ---------- Mobile fallback ---------- */
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.matchMedia('(max-width: 900px)').matches;
  const isMobile = isCoarse || isNarrow;

  if (isMobile) {
    /* On mobile, loading 14 MB of frames is wasteful and scroll-scrub
       behaves poorly. Show only frame 1 as a static poster. */
    heroScroll.classList.add('is-mobile');
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
    setTimeout(() => {
      loader.style.display = 'none';
    }, 600);
  }

  /* Eager: priority frames */
  const priority = Math.min(PRELOAD_PRIORITY, FRAME_COUNT);
  for (let i = 0; i < priority; i++) loadFrame(i, true);

  /* Lazy: rest, on idle */
  function lazyLoad() {
    let i = priority;
    function next() {
      if (i >= FRAME_COUNT) return;
      loadFrame(i++, false);
      if (window.requestIdleCallback) {
        requestIdleCallback(next, { timeout: 100 });
      } else {
        setTimeout(next, 8);
      }
    }
    next();
  }
  if (window.requestIdleCallback) {
    requestIdleCallback(lazyLoad);
  } else {
    setTimeout(lazyLoad, 80);
  }

  /* ---------- Canvas sizing (devicePixelRatio aware) ---------- */
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

  /* ---------- Cover-fit drawImage ---------- */
  function drawCover(img) {
    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width / Math.min(dpr, 2);
    const ch = canvas.height / Math.min(dpr, 2);
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const ratio = Math.max(cw / iw, ch / ih);
    const w = iw * ratio;
    const h = ih * ratio;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    ctx.fillStyle = '#0F1419';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }

  /* ---------- Scroll progress + frame computation ---------- */
  let target = 0;
  let current = 0;
  const easing = 0.18;
  let lastDrawn = -1;
  let activeText = -1;

  function getProgress() {
    const rect = heroScroll.getBoundingClientRect();
    const trackHeight = heroScroll.offsetHeight - window.innerHeight;
    if (trackHeight <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / trackHeight));
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
      /* fallback: nearest available frame */
      let near = idx;
      for (let d = 1; d < 20; d++) {
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
    const progress = getProgress();
    target = progress;
    current += (target - current) * easing;
    if (Math.abs(target - current) < 0.0005) current = target;

    drawCurrent();

    /* Text frame crossfade */
    let textIdx = Math.floor(progress * textFrames.length);
    if (textIdx >= textFrames.length) textIdx = textFrames.length - 1;
    if (textIdx !== activeText) {
      textFrames.forEach((f, i) => f.classList.toggle('is-active', i === textIdx));
      if (progressCurrent) {
        progressCurrent.textContent = String(textIdx + 1).padStart(2, '0');
      }
      activeText = textIdx;
    }

    /* Progress bar */
    if (progressFill) {
      progressFill.style.transform = 'scaleY(' + progress + ')';
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
