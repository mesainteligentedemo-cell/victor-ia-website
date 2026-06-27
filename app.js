/* VICTOR IA — app.js v4
   Canvas water-trail reveal · marble scroll pan · light theme */

(function () {
  'use strict';

  var EMAILJS_SERVICE  = 'YOUR_SERVICE_ID';
  var EMAILJS_TEMPLATE = 'YOUR_TEMPLATE_ID';
  var EMAILJS_KEY      = 'YOUR_PUBLIC_KEY';
  var CALENDLY_URL     = 'https://calendly.com/victor-ia/30min';

  var $  = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return document.querySelectorAll(s); };

  var cursor      = $('#cursor');
  var cursorSvg   = $('#cursor-svg');
  var nav         = $('#site-nav');
  var navToggle   = $('#nav-toggle');
  var navLinks    = $('#nav-links');
  var loader      = $('#loader');
  var bgBase      = $('#bg-base');
  var svcPanel    = $('#svc-panel');
  var svcPanelClose = $('#svc-panel-close');
  var svcNavBtn   = $('#nav-svc-btn');
  var marquee     = $('#marquee-track');
  var videoWrap   = $('#video-wrap');
  var videoEl     = $('#reel-video');
  var videoOverlay= $('#video-overlay');
  var playBtn     = $('#play-btn');
  var videoBlur   = $('#video-blur');
  var formBtn     = $('#opt-form-btn');
  var formWrap    = $('#form-wrap');
  var form        = $('#contact-form');
  var fStatus     = $('#f-status');
  var chatOverlay = $('#chat-overlay');
  var chatClose   = $('#chat-close');
  var chatBody    = $('#chat-body');
  var chatInput   = $('#chat-input');
  var chatSend    = $('#chat-send');
  var optChat     = $('#opt-chat');
  var optCal      = $('#opt-cal');

  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var isFine  = window.matchMedia('(pointer: fine)').matches;

  /* ─── CURSOR ────────────────────────────────────── */
  if (isFine && cursor) {
    var cx = -100, cy = -100, tx = -100, ty = -100;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!cursor.classList.contains('visible')) cursor.classList.add('visible');
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('visible'); });
    document.addEventListener('mousedown', function () { cursor.classList.add('clicking'); });
    document.addEventListener('mouseup',   function () { cursor.classList.remove('clicking'); });
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      var isHover = t.tagName === 'A' || t.tagName === 'BUTTON' ||
                    t.closest('a') || t.closest('button') ||
                    t.classList.contains('proj-link') || t.classList.contains('c-opt') ||
                    t.closest('.proj-link') || t.closest('.c-opt') ||
                    t.closest('.svc-panel-item');
      cursor.classList.toggle('hovering', !!isHover);
    });

    (function animCursor() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(animCursor);
    }());
  }

  /* ─── HOME SPOTLIGHT ────────────────────────────── */
  if (isFine) {
    document.addEventListener('mousemove', function (e) {
      document.documentElement.style.setProperty('--rx', e.clientX + 'px');
      document.documentElement.style.setProperty('--ry', e.clientY + 'px');
    });
    document.addEventListener('mouseleave', function () {
      document.documentElement.style.setProperty('--rx', '-2000px');
      document.documentElement.style.setProperty('--ry', '-2000px');
    });
  }

  /* ─── MARBLE SCROLL PAN ──────────────────────────── */
  if (bgBase) {
    function updateMarblePan() {
      var progress = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      bgBase.style.backgroundPositionY = (progress * 100) + '%';
    }
    window.addEventListener('scroll', updateMarblePan, { passive: true });
  }

  /* ─── NAVBAR ─────────────────────────────────────── */
  var lastScrollY = 0, navVisible = false, navScrolled = false;

  function showNav() {
    if (!nav) return;
    if (!navVisible) { navVisible = true; nav.classList.add('visible'); }
    nav.classList.remove('hidden-up');
  }
  function hideNav() { if (nav) nav.classList.add('hidden-up'); }

  function onScroll() {
    var sy = window.scrollY;
    if (nav) {
      if (sy > 60 && !navScrolled)  { navScrolled = true;  nav.classList.add('scrolled'); }
      if (sy <= 40 && navScrolled)  { navScrolled = false; nav.classList.remove('scrolled'); }
      if (sy > lastScrollY + 6 && sy > 120) hideNav();
      else if (sy < lastScrollY - 6 || sy < 80) showNav();
    }
    lastScrollY = sy;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Nav mobile toggle */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── SERVICES PANEL ─────────────────────────────── */
  function openSvcPanel() {
    if (!svcPanel) return;
    svcPanel.classList.add('open');
    svcPanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (navLinks) {
      navLinks.classList.remove('open');
      if (navToggle) navToggle.classList.remove('open');
    }
  }
  function closeSvcPanel() {
    if (!svcPanel) return;
    svcPanel.classList.remove('open');
    svcPanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (svcNavBtn)    svcNavBtn.addEventListener('click', openSvcPanel);
  if (svcPanelClose) svcPanelClose.addEventListener('click', closeSvcPanel);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (svcPanel && svcPanel.classList.contains('open')) { closeSvcPanel(); return; }
    if (navLinks && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      if (navToggle) { navToggle.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
      document.body.style.overflow = '';
    }
  });

  /* ─── LOADER ─────────────────────────────────────── */
  var loaderBar = document.getElementById('loader-bar');
  var loaderDone = false;

  function dismissLoader() {
    if (loaderDone || !loader) return;
    loaderDone = true;
    loader.classList.add('out');
    showNav();
    setTimeout(function () { if (loader) loader.style.display = 'none'; }, 1100);
  }

  if (loaderBar) {
    var startTime = performance.now(), barDur = 1600;
    (function tickBar(now) {
      var p = Math.min((now - startTime) / barDur, 1);
      loaderBar.style.transform = 'scaleX(' + p + ')';
      if (p < 1) requestAnimationFrame(tickBar);
      else setTimeout(dismissLoader, 200);
    }(performance.now()));
  } else {
    setTimeout(dismissLoader, 1800);
  }

  /* ─── REVEAL ON SCROLL ───────────────────────────── */
  var riObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var delay = parseInt(el.getAttribute('data-d') || '0', 10);
      setTimeout(function () { el.classList.add('in'); }, delay);
      riObserver.unobserve(el);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.ri').forEach(function (el) { riObserver.observe(el); });

  /* ─── COUNTERS ───────────────────────────────────── */
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el   = entry.target;
      var end  = parseInt(el.getAttribute('data-target'), 10);
      var pre  = el.getAttribute('data-prefix') || '';
      var suf  = el.getAttribute('data-suffix') || '';
      var dur  = 1800, start = performance.now();
      countObserver.unobserve(el);
      requestAnimationFrame(function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(eased * end) + suf;
        if (p < 1) requestAnimationFrame(tick);
      });
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(function (el) { countObserver.observe(el); });

  /* ─── PROJECT LINKS ──────────────────────────────── */
  document.querySelectorAll('.proj-link').forEach(function (el) {
    el.addEventListener('click', function () {
      var href = el.getAttribute('data-href');
      if (href) window.open(href, '_blank', 'noopener');
    });
  });

  /* ─── VIDEO REEL ─────────────────────────────────── */
  if (playBtn && videoEl) {
    playBtn.addEventListener('click', function () {
      if (!videoEl.src) return;
      videoEl.classList.add('loaded'); videoEl.play();
      if (videoOverlay) videoOverlay.classList.add('hidden');
    });
  }

  function updateVideoBlur(x, y) {
    if (!videoBlur || !videoWrap) return;
    var rect = videoWrap.getBoundingClientRect();
    videoBlur.style.setProperty('--bx', (x - rect.left) + 'px');
    videoBlur.style.setProperty('--by', (y - rect.top)  + 'px');
  }
  if (videoWrap) {
    videoWrap.addEventListener('mousemove', function (e) { updateVideoBlur(e.clientX, e.clientY); }, { passive: true });
    videoWrap.addEventListener('touchstart', function () { videoWrap.classList.add('touching'); }, { passive: true });
    videoWrap.addEventListener('touchmove', function (e) {
      if (e.touches.length) updateVideoBlur(e.touches[0].clientX, e.touches[0].clientY);
      videoWrap.classList.add('touching');
    }, { passive: true });
    videoWrap.addEventListener('touchend', function () { videoWrap.classList.remove('touching'); }, { passive: true });
  }

  /* ─── CONTACT FORM ───────────────────────────────── */
  if (formBtn && formWrap) {
    formBtn.addEventListener('click', function () {
      var isOpen = formWrap.classList.toggle('open');
      formWrap.setAttribute('aria-hidden', !isOpen);
      if (isOpen) setTimeout(function () { formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
    });
  }

  if (form && fStatus) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name    = form.querySelector('#f-name').value.trim();
      var company = form.querySelector('#f-company').value.trim();
      var service = form.querySelector('#f-service').value;
      var message = form.querySelector('#f-msg').value.trim();
      if (!name || !message || !service) {
        fStatus.textContent = 'Por favor completa los campos requeridos.';
        fStatus.className = 'f-status err'; return;
      }
      fStatus.textContent = 'Enviando...'; fStatus.className = 'f-status';
      if (window.emailjs && EMAILJS_SERVICE !== 'YOUR_SERVICE_ID') {
        window.emailjs.init({ publicKey: EMAILJS_KEY });
        window.emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
          name: name, company: company, service: service, message: message, to_email: 'info@victor-ia.com.mx'
        }).then(function () {
          fStatus.textContent = 'Mensaje enviado. Te respondemos en menos de 24h.';
          fStatus.className = 'f-status ok'; form.reset();
        }).catch(function () {
          fStatus.textContent = 'Error al enviar. Escríbenos a info@victor-ia.com.mx';
          fStatus.className = 'f-status err';
        });
      } else {
        var body = encodeURIComponent('Nombre: ' + name + '\nEmpresa: ' + (company || 'N/A') + '\nServicio: ' + service + '\n\n' + message);
        window.location.href = 'mailto:info@victor-ia.com.mx?subject=Nuevo%20proyecto%20VICTOR%20IA&body=' + body;
        fStatus.textContent = 'Abriendo tu cliente de correo...'; fStatus.className = 'f-status ok';
      }
    });
  }

  /* ─── CHATBOT VÍCTOR ─────────────────────────────── */
  var victor = {
    state: 0, name: '', industry: '', context: '', contact: '',

    SERVICES: {
      setup:       { n:'El Setup — Implementación Tecnológica Completa', d:'Nuestro producto estrella. Diagnóstico, arquitectura, implementación integral y monitoreo en tiempo real vía el Tracker.' },
      timeshare:   { n:'Intelligence Architecture para Timeshare', d:'Agentes de cierre entrenados con tus VTCs y objeciones, calificación automática de leads y seguimiento 24/7.' },
      hotel:       { n:'Intelligence Architecture Hotelera', d:'Concierge digital, agentes de reservas, check-in automatizado y sistema de fidelización con IA.' },
      hotelería:   { n:'Intelligence Architecture Hotelera', d:'Concierge digital, agentes de reservas y fidelización con IA. Tu hotel siempre disponible.' },
      inmobiliar:  { n:'Intelligence Architecture Inmobiliaria', d:'Sistema completo: agentes de ventas IA, CRM conectado, calificación de leads y property tour virtual.' },
      biene:       { n:'Intelligence Architecture Inmobiliaria', d:'Sistema completo para desarrolladoras y brokerages.' },
      sitio:       { n:'Sitio Web Inclusivo', d:'Experiencias digitales de nivel Awwwards: scroll cinematic, animaciones 3D, interacción máxima.' },
      web:         { n:'Sitio Web Inclusivo', d:'Diseñamos y construimos sitios cinematográficos que convierten.' },
      video:       { n:'Video Cinematográfico con IA', d:'Spots, reels, documentales. Velocidad de startup, calidad de producción.' },
      branding:    { n:'Upgrade de Branding con IA', d:'Identidad visual renovada: logo, paleta, tipografía y manual de marca.' },
      cibersegur:  { n:'Ciberseguridad + IA Local', d:'Auditoría de vulnerabilidades, encriptación y IA on-premise. Tu información nunca sale de tu red.' },
      departamento:{ n:'IA por Departamento', d:'Inteligencia en cada área: ventas, marketing, operaciones, finanzas y RRHH.' },
      datos:       { n:'Data Analytics & Business Intelligence', d:'Dashboards con KPIs en tiempo real y modelos predictivos.' },
      automatiz:   { n:'Automatización de Procesos', d:'Eliminamos el trabajo manual con n8n, Make, Python y Zapier.' },
      ventas:      { n:'Agente de Ventas IA', d:'Agente conversacional integrado a tu CRM. Califica, sigue y cierra leads sin intervención humana.' },
      capacitac:   { n:'Capacitaciones con Agente IA', d:'Agente entrenado con tus manuales y procesos. Disponible 24/7.' },
      integrac:    { n:'Integraciones entre Sistemas', d:'Conectamos HubSpot, SAP, Shopify, Stripe y sistemas legacy.' }
    },

    detectService: function (txt) {
      var t = txt.toLowerCase(), keys = Object.keys(this.SERVICES);
      for (var i = 0; i < keys.length; i++) { if (t.indexOf(keys[i]) !== -1) return this.SERVICES[keys[i]]; }
      return null;
    },

    OBJECTIONS: {
      'caro':     'Entiendo. Lo que cuesta más es no automatizar. La automatización se paga sola en semanas. ¿Quieres que calculemos el ROI para tu caso?',
      'precio':   'Podemos empezar con un piloto medible con KPIs definidos, sin compromiso de largo plazo. ¿Te parece?',
      'tiempo':   'Nos encargamos de todo. El equipo solo necesita aprobar decisiones clave. ¿Cuántas horas semanales va ese proceso hoy?',
      'no sé':    'Por eso estoy aquí. Cuéntame el reto y te digo exactamente qué tiene sentido hacer. ¿Cuál es el proceso que más duele?',
      'pensarlo': 'Claro, sin presión. ¿Te mando info de cómo otras empresas de tu industria ya lo usan?'
    },

    detectObjection: function (txt) {
      var t = txt.toLowerCase(), keys = Object.keys(this.OBJECTIONS);
      for (var i = 0; i < keys.length; i++) { if (t.indexOf(keys[i]) !== -1) return this.OBJECTIONS[keys[i]]; }
      return null;
    },

    responses: {
      0: function () { return '¡Hola! Soy Víctor, el agente de IA de Victor IA.\n\nTransformamos empresas con tecnología de primer nivel — IA, automatización, sitios cinematográficos y más.\n\n¿Con quién tengo el gusto?'; },
      1: function (v) { return 'Mucho gusto, ' + v.name + '. ¿De qué industria es tu empresa y cuál es el reto más grande que tienen hoy?'; },
      2: function (v, svc) {
        if (svc) return svc.n + '.\n\n' + svc.d + '\n\n¿Ya tienen alguna herramienta de CRM o automatización funcionando?';
        return 'Interesante. En Victor IA tenemos soluciones desde agentes de voz hasta plataformas SaaS completas.\n\n¿Ya tienen alguna herramienta de CRM o automatización en uso?';
      },
      3: function () { return '¿Están buscando implementar algo pronto o están en fase de exploración?'; },
      4: function () { return 'Perfecto. ¿Tienen presupuesto tecnológico asignado para este año?'; },
      5: function () { return 'Con lo que me has contado puedo prepararte una propuesta concreta.\n\n¿Cómo prefieres continuar?\n→ Llamada de 30 min con nuestro equipo técnico\n→ Propuesta personalizada por correo\n→ Demo en vivo de la plataforma'; },
      6: function () { return '¿Cuál es tu correo o WhatsApp? Te contactamos hoy mismo.'; },
      done: function (v) { return '¡Listo, ' + v.name + '! Ya quedé anotado. Alguien de Victor IA te contacta a la brevedad.'; }
    },

    reply: function (msg) {
      var obj = this.detectObjection(msg);
      if (obj && this.state >= 2) return obj;
      switch (this.state) {
        case 0:
          this.name = msg.trim().split(' ')[0]; this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
          this.state = 1; return this.responses[1](this);
        case 1:
          this.context = msg; var svc = this.detectService(msg); this.state = 2; return this.responses[2](this, svc);
        case 2: this.state = 3; return this.responses[3]();
        case 3: this.state = 4; return this.responses[4]();
        case 4: this.state = 5; return this.responses[5]();
        case 5: this.state = 6; return this.responses[6]();
        case 6: this.contact = msg; this.state = 7; return this.responses.done(this);
        default: return '¿Hay algo más en lo que te pueda ayudar?';
      }
    }
  };

  function openChat() {
    if (!chatOverlay) return;
    chatOverlay.classList.add('open'); chatOverlay.setAttribute('aria-hidden', 'false');
    if (chatBody && chatBody.children.length <= 1) setTimeout(function () { appendVictorMsg(victor.responses[0]()); }, 400);
    if (chatInput) setTimeout(function () { chatInput.focus(); }, 500);
  }
  function closeChat() {
    if (!chatOverlay) return;
    chatOverlay.classList.remove('open'); chatOverlay.setAttribute('aria-hidden', 'true');
  }
  function appendVictorMsg(text) {
    if (!chatBody) return;
    var wrap = document.createElement('div'); wrap.className = 'chat-msg chat-in';
    var p = document.createElement('p'); p.style.whiteSpace = 'pre-line'; p.textContent = text;
    wrap.appendChild(p); chatBody.appendChild(wrap); chatBody.scrollTop = chatBody.scrollHeight;
  }
  function appendUserMsg(text) {
    if (!chatBody) return;
    var wrap = document.createElement('div'); wrap.className = 'chat-msg out';
    var p = document.createElement('p'); p.textContent = text;
    wrap.appendChild(p); chatBody.appendChild(wrap); chatBody.scrollTop = chatBody.scrollHeight;
  }
  function sendChatMsg() {
    if (!chatInput) return;
    var txt = chatInput.value.trim(); if (!txt) return;
    appendUserMsg(txt); chatInput.value = ''; chatInput.disabled = true;
    setTimeout(function () { appendVictorMsg(victor.reply(txt)); chatInput.disabled = false; chatInput.focus(); }, 800 + Math.random() * 400);
  }

  if (optChat)   optChat.addEventListener('click', openChat);
  if (chatClose) chatClose.addEventListener('click', closeChat);
  if (chatSend)  chatSend.addEventListener('click', sendChatMsg);
  if (chatInput) chatInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendChatMsg(); } });

  /* ─── CALENDLY ───────────────────────────────────── */
  if (optCal) optCal.addEventListener('click', function () { window.open(CALENDLY_URL, '_blank', 'noopener'); });

  /* ─── SMOOTH SCROLL ──────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1); if (!id) return;
      var target = document.getElementById(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ─── INIT ───────────────────────────────────────── */
  onScroll();

}());