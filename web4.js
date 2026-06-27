/* VICTOR IA — web4.js · Web 4.0 upgrade layer
   Neural particles · Hero chars · Stat glow · Icon draw
   ──────────────────────────────────────────────────── */
(function () {
  'use strict';

  var MB = window.innerWidth < 768;
  var NM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var DF = window.matchMedia('(pointer:fine)').matches;

  /* ═══════════════════════════════════════════════════════
     1. NEURAL CONSTELLATION CANVAS
     Subtle particle network — mix-blend: multiply on light,
     multiply inverted on dark pages
  ═══════════════════════════════════════════════════════ */
  function initNeural() {
    if (MB || NM) return;

    var isDark = document.body.dataset.theme === 'dark';
    var nc = document.createElement('canvas');
    nc.id = 'neural-canvas';
    nc.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(nc, document.body.firstChild);

    var ctx = nc.getContext('2d');
    var W, H, pts;
    var mouse = { x: -9999, y: -9999, on: false };

    function resize() {
      W = nc.width  = window.innerWidth;
      H = nc.height = window.innerHeight;
      rebuild();
    }

    function rebuild() {
      pts = [];
      var n = Math.max(55, Math.min(130, Math.floor(W * H / 15500)));
      for (var i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - .5) * .32,
          vy: (Math.random() - .5) * .32,
          r: Math.random() < .07 ? 2 : 1.2,
          gold: Math.random() < .1
        });
      }
    }

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true;
    }, { passive: true });
    document.addEventListener('mouseleave', function () { mouse.on = false; });

    var DOT_INK  = isDark ? 'rgba(248,247,245,.14)' : 'rgba(14,15,18,.16)';
    var DOT_GOLD = isDark ? 'rgba(201,168,112,.28)'  : 'rgba(180,105,0,.22)';

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, d2;

      for (i = 0; i < pts.length; i++) {
        p = pts[i];

        if (mouse.on) {
          dx = mouse.x - p.x; dy = mouse.y - p.y;
          d2 = dx * dx + dy * dy;
          if (d2 < 36100) {
            var d = Math.sqrt(d2);
            var f = (190 - d) / 190 * .016;
            p.vx -= (dx / d) * f;
            p.vy -= (dy / d) * f;
          }
        }

        p.vx *= .994; p.vy *= .994;
        p.x += p.vx; p.y += p.vy;

        if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
        if (p.y < -12) p.y = H + 12; else if (p.y > H + 12) p.y = -12;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = p.gold ? DOT_GOLD : DOT_INK;
        ctx.fill();

        for (j = i + 1; j < pts.length; j++) {
          q = pts[j];
          dx = q.x - p.x; dy = q.y - p.y;
          d2 = dx * dx + dy * dy;
          if (d2 < 10816) {
            var alpha = (1 - Math.sqrt(d2) / 104) * (isDark ? .08 : .055);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = isDark
              ? 'rgba(248,247,245,' + alpha.toFixed(3) + ')'
              : 'rgba(14,15,18,'   + alpha.toFixed(3) + ')';
            ctx.lineWidth = .4;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    draw();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(resize, 240);
    });
  }

  /* ═══════════════════════════════════════════════════════
     2. HERO HEADLINE CHAR-LEVEL ANIMATION
     Splits .hero-word spans into per-char spans, fires on
     loader hide (MutationObserver)
  ═══════════════════════════════════════════════════════ */
  function initHeroChars() {
    if (NM) return;
    var hl = document.getElementById('hero-hl');
    if (!hl) return;

    var chars = [];
    hl.querySelectorAll('.hero-word').forEach(function (word) {
      var txt = word.textContent;
      word.replaceChildren();
      word.classList.add('w4-split');
      txt.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.className = 'hero-char';
        s.textContent = ch === ' ' ? ' ' : ch;
        if (ch !== ' ') chars.push(s);
        word.appendChild(s);
      });
    });

    function fire() {
      chars.forEach(function (c, i) {
        setTimeout(function () { c.classList.add('on'); }, i * 38 + 160);
      });
    }

    var loaderEl = document.getElementById('loader');
    if (loaderEl) {
      var mo = new MutationObserver(function () {
        if (loaderEl.classList.contains('hidden')) {
          mo.disconnect();
          fire();
        }
      });
      mo.observe(loaderEl, { attributes: true, attributeFilter: ['class'] });
    } else {
      setTimeout(fire, 2600);
    }
  }

  /* ═══════════════════════════════════════════════════════
     3. STAT GOLDEN GLOW
     Pulses amber text-shadow on .stat-value after counter
  ═══════════════════════════════════════════════════════ */
  function initStatGlow() {
    if (!('IntersectionObserver' in window)) return;
    var grid = document.querySelector('.stat-grid');
    if (!grid) return;
    var done = false;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || done) return;
      done = true; io.disconnect();
      setTimeout(function () {
        document.querySelectorAll('.stat-value').forEach(function (el) {
          el.classList.add('glow');
          setTimeout(function () { el.classList.remove('glow'); }, 1700);
        });
      }, 1900);
    }, { threshold: 0.5 });
    io.observe(grid);
  }

  /* ═══════════════════════════════════════════════════════
     4. SERVICE ICON SVG PATH DRAW ON HOVER
  ═══════════════════════════════════════════════════════ */
  function initIconDraw() {
    if (NM || MB) return;
    document.querySelectorAll('.svc-home-item').forEach(function (item) {
      var paths = item.querySelectorAll('.svc-home-icon svg path,.svc-home-icon svg circle,.svc-home-icon svg line,.svc-home-icon svg polygon');
      item.addEventListener('mouseenter', function () {
        paths.forEach(function (el, i) {
          var len = el.getTotalLength ? el.getTotalLength() : 0;
          if (!len || len > 700) return;
          el.style.strokeDasharray  = len + '';
          el.style.strokeDashoffset = len + '';
          el.style.transition = 'stroke-dashoffset .55s cubic-bezier(.16,1,.3,1) ' + (i * .04) + 's';
          requestAnimationFrame(function () { el.style.strokeDashoffset = '0'; });
        });
      });
      item.addEventListener('mouseleave', function () {
        paths.forEach(function (el) {
          el.style.strokeDasharray = '';
          el.style.strokeDashoffset = '';
          el.style.transition = '';
        });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     5. CARD SCROLL REVEAL ENHANCEMENT
     Adds stagger to any .rev-card items not already handled
  ═══════════════════════════════════════════════════════ */
  function initCardReveal() {
    if (!('IntersectionObserver' in window) || NM) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.rev-card').forEach(function (el) {
      io.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════
     6. CARD CURSOR SHIMMER
     Updates --mx / --my CSS vars on .svc-home-item so the
     ::after radial gradient tracks the cursor precisely
  ═══════════════════════════════════════════════════════ */
  function initCardShimmer() {
    if (NM || MB) return;
    var sel = '.svc-home-item, .level-card:not(.featured), .aside-card, .proc-step, .win-card';
    document.querySelectorAll(sel).forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
        var y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      }, { passive: true });
    });
  }

  /* ═══════════════════════════════════════════════════════
     7. HERO PARALLAX DEPTH
     Shifts .hero-inner slightly as user scrolls — creates
     perceived depth between background and foreground
  ═══════════════════════════════════════════════════════ */
  function initHeroParallax() {
    if (MB || NM) return;
    var heroInner = document.querySelector('.hero-inner');
    if (!heroInner) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y < window.innerHeight * 1.4) {
            heroInner.style.transform = 'translateY(' + (y * -0.09).toFixed(1) + 'px)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════
     8. NAV SCROLL-DIRECTION HIDE
     Hides nav on scroll-down, reveals on scroll-up — standard
     Mobbin/Linear/Vercel UX pattern
  ═══════════════════════════════════════════════════════ */
  function initNavHide() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var lastY = 0;
    var thr = 90;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      nav.classList.toggle('nav-scrolled', y > 60);
      if (y > thr) {
        if (y > lastY + 8)       nav.classList.add('nav-hidden');
        else if (y < lastY - 8)  nav.classList.remove('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
      lastY = y;
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════
     9. SCRAMBLE TEXT ON HOVER
     ScrambleText / DecryptedText — Reactbits / Magic UI pattern
     implemented in vanilla JS for .svc-home-title elements
  ═══════════════════════════════════════════════════════ */
  function initScramble() {
    if (NM || MB) return;
    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·—';
    document.querySelectorAll('.svc-home-title, .level-name').forEach(function (el) {
      var origNode = el.cloneNode(true);
      var origText = el.textContent;
      var iv; var iter = 0;
      function restore() {
        el.replaceChildren();
        Array.from(origNode.childNodes).forEach(function (node) {
          el.appendChild(node.cloneNode(true));
        });
      }
      el.addEventListener('mouseenter', function () {
        iter = 0; clearInterval(iv);
        iv = setInterval(function () {
          el.textContent = origText.split('').map(function (ch, i) {
            if (i < iter) return origText[i];
            if (ch === ' ' || ch === '\n') return ch;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('');
          iter += 1.2;
          if (iter >= origText.length) { clearInterval(iv); restore(); }
        }, 36);
      });
      el.addEventListener('mouseleave', function () { clearInterval(iv); restore(); });
    });
  }

  /* ═══════════════════════════════════════════════════════
     10. CURSOR CONTEXT AWARENESS
     Cursor ring expands over headings — Awwwards pattern
     for award-winning cursor feedback
  ═══════════════════════════════════════════════════════ */
  function initCursorContext() {
    if (MB || !DF) return;
    var ring = document.getElementById('cursorRing');
    if (!ring) return;
    function expand() {
      ring.style.width = '68px'; ring.style.height = '68px';
      ring.style.borderColor = 'rgba(201,168,112,.52)';
    }
    function restore() {
      ring.style.width = '32px'; ring.style.height = '32px';
      ring.style.borderColor = '';
    }
    document.querySelectorAll('h1,h2,h3,.display,.hero-headline').forEach(function (el) {
      el.addEventListener('mouseenter', expand);
      el.addEventListener('mouseleave', restore);
    });
  }

  /* ═══════════════════════════════════════════════════════
     11. MAGNETIC CTA — SPRING PHYSICS
     Covers .cta-btn (propuesta-aldo) — other pages handle
     their own buttons inline; spring: cx += (tx-cx)*0.18
  ═══════════════════════════════════════════════════════ */
  function initMagneticCTA() {
    if (MB || NM) return;
    document.querySelectorAll('.cta-btn').forEach(function (btn) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf;
      function tick() {
        cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
        btn.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
        if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(tick);
        else btn.style.transform = '';
      }
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * 0.28;
        ty = (e.clientY - r.top - r.height / 2) * 0.28;
        cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
      }, { passive: true });
      btn.addEventListener('mouseleave', function () {
        tx = 0; ty = 0;
        cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════ */
  initNeural();
  initHeroChars();
  initStatGlow();
  initIconDraw();
  initCardReveal();
  initCardShimmer();
  initHeroParallax();
  initNavHide();
  initScramble();
  initCursorContext();
  initMagneticCTA();

}());
