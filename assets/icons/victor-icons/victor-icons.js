/*!
 * VICTOR ICONS — Sistema de iconografía propia de Victor IA (vanilla JS)
 * ----------------------------------------------------------------------------
 * DNA visual: la "V" geométrica. Triángulos, líneas rectas 45/60/90°,
 * cero curvas suaves, mucho whitespace.
 *
 * Spec INMUTABLE: viewBox 0 0 24 24 · stroke 2 · fill none · currentColor
 *                 stroke-linecap butt · stroke-linejoin miter
 *
 * Fuente de verdad de los paths: VictorIcons.tsx (victor-ia-app). Mantener sync.
 *
 * USO:
 *   <script src="/assets/icons/victor-icons/victor-icons.js"></script>
 *
 *   // 1) String de SVG:
 *   el.innerHTML = VictorIcons.render('maestria', { size: 20 });
 *
 *   // 2) Auto-mount declarativo (data-attribute):
 *   <span data-victor-icon="check" data-size="18"></span>
 *   VictorIcons.mountAll();   // procesa todos los [data-victor-icon] del DOM
 *
 *   // 3) Animar el loader:
 *   el.innerHTML = VictorIcons.render('loading', { spin: true });
 */
(function (global) {
  "use strict";

  // ── PATHS (inner markup del <svg>) ──────────────────────────────────────
  var PATHS = {
    // A. AGENTES / CATEGORÍAS (21)
    maestria: '<polyline points="3 20 12 4 21 20"/><line x1="7" y1="20" x2="17" y2="20"/>',
    creatividad: '<polyline points="4 11 12 3 12 11"/><polyline points="20 13 12 21 12 13"/>',
    codigo: '<polyline points="9 6 3 12 9 18"/><polyline points="15 6 21 12 15 18"/>',
    datos: '<polyline points="6 14 12 9 18 14"/><polyline points="4 20 12 13 20 20"/><polyline points="9 9 12 6 15 9"/>',
    seguridad: '<polygon points="12 3 20 6 20 12 12 21 4 12 4 6"/><polyline points="9 12 11 14 15 9"/>',
    automatizacion: '<polyline points="3 8 8 8 11 16 16 16"/><polyline points="13 13 16 16 13 19"/><line x1="16" y1="16" x2="21" y2="16"/>',
    inteligencia: '<polyline points="3 5 12 19 21 5"/><polyline points="7 7 12 15 17 7"/>',
    web: '<polygon points="3 5 21 5 21 19 3 19"/><polyline points="3 9 21 9"/>',
    video: '<polygon points="3 5 21 5 21 19 3 19"/><polygon points="10 9 16 12 10 15"/>',
    audio: '<polyline points="3 12 7 12 9 5 13 19 15 12 21 12"/>',
    copy: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="11" x2="16" y2="11"/><line x1="4" y1="16" x2="20" y2="16"/><polyline points="18 14 20 16 18 18"/>',
    seo: '<polygon points="9 3 14 6 14 12 9 15 4 12 4 6"/><line x1="13" y1="14" x2="20" y2="21"/>',
    analitica: '<polyline points="4 20 4 14 8 14 8 20"/><polyline points="10 20 10 9 14 9 14 20"/><polyline points="16 20 16 4 20 4 20 20"/>',
    marketing: '<polygon points="4 9 13 5 13 19 4 15"/><polyline points="13 9 18 7 18 17 13 15"/><line x1="20" y1="10" x2="21" y2="9"/><line x1="20" y1="14" x2="21" y2="15"/>',
    finanzas: '<polygon points="12 3 19 12 12 21 5 12"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="9" y1="12" x2="15" y2="12"/>',
    cliente: '<polygon points="12 3 15 8 9 8"/><polyline points="4 21 8 12 16 12 20 21"/>',
    integraciones: '<polygon points="3 8 10 8 6.5 15"/><polygon points="14 9 21 9 17.5 16"/><line x1="9" y1="11" x2="15" y2="11"/>',
    documentacion: '<polyline points="3 5 12 8 21 5"/><polyline points="3 5 3 18 12 21 21 18 21 5"/><line x1="12" y1="8" x2="12" y2="21"/>',
    devops: '<polygon points="12 2 16 10 12 16 8 10"/><polyline points="8 12 5 18 9 15"/><polyline points="16 12 19 18 15 15"/><line x1="11" y1="19" x2="13" y2="19"/>',
    tresd: '<polygon points="12 3 21 8 12 13 3 8"/><polyline points="3 8 3 16 12 21 21 16 21 8"/><line x1="12" y1="13" x2="12" y2="21"/>',
    scraping: '<polygon points="12 9 15 12 12 15 9 12"/><line x1="12" y1="9" x2="12" y2="3"/><line x1="15" y1="12" x2="21" y2="12"/><line x1="9" y1="12" x2="3" y2="12"/><line x1="12" y1="15" x2="12" y2="21"/>',

    // B. UI (15)
    home: '<polyline points="3 11 12 3 21 11"/><polyline points="5 10 5 21 19 21 19 10"/>',
    menu: '<line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>',
    search: '<polygon points="10 3 15 6 15 12 10 15 5 12 5 6"/><line x1="14" y1="14" x2="21" y2="21"/>',
    settings: '<polygon points="12 8 16 12 12 16 8 12"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="7" y2="7"/><line x1="17" y1="17" x2="19" y2="19"/><line x1="19" y1="5" x2="17" y2="7"/><line x1="7" y1="17" x2="5" y2="19"/>',
    close: '<line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>',
    arrow: '<polyline points="9 4 17 12 9 20"/><line x1="3" y1="12" x2="17" y2="12"/>',
    check: '<polyline points="4 12 10 18 20 5"/>',
    warning: '<polygon points="12 3 22 20 2 20"/><line x1="12" y1="9" x2="12" y2="14"/><line x1="12" y1="17" x2="12" y2="17.5"/>',
    info: '<polygon points="12 3 19 12 12 21 5 12"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12" y2="8.5"/>',
    plus: '<line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/>',
    minus: '<line x1="4" y1="12" x2="20" y2="12"/>',
    chevron: '<polyline points="5 9 12 16 19 9"/>',
    edit: '<polyline points="4 20 4 16 16 4 20 8 8 20 4 20"/><line x1="13" y1="7" x2="17" y2="11"/>',
    trash: '<line x1="4" y1="6" x2="20" y2="6"/><polyline points="6 6 7 21 17 21 18 6"/><polyline points="9 3 15 3"/><line x1="10" y1="10" x2="10" y2="17"/><line x1="14" y1="10" x2="14" y2="17"/>',
    send: '<polygon points="3 11 21 3 13 21 11 13"/><line x1="11" y1="13" x2="21" y2="3"/>',

    // C. STATUS / FEEDBACK (4)
    loading: '<path d="M12 3 A9 9 0 1 1 4.5 7"/>',
    success: '<polygon points="12 3 19 12 12 21 5 12"/><polyline points="8 12 11 15 16 9"/>',
    error: '<polygon points="2 6 22 6 12 21"/><line x1="9" y1="10" x2="15" y2="16"/><line x1="15" y1="10" x2="9" y2="16"/>',
    pending: '<line x1="4" y1="12" x2="20" y2="12"/><line x1="7" y1="12" x2="7" y2="12.2"/><line x1="12" y1="12" x2="12" y2="12.2"/><line x1="17" y1="12" x2="17" y2="12.2"/>'
  };

  var DIRECTION_ROTATION = { right: 0, down: 90, left: 180, up: 270 };

  // Inyecta el keyframe del spinner una sola vez
  var styleInjected = false;
  function injectSpinStyle() {
    if (styleInjected || typeof document === "undefined") return;
    var s = document.createElement("style");
    s.setAttribute("data-victor-icons", "");
    s.textContent =
      "@keyframes vi-spin{to{transform:rotate(360deg)}}" +
      ".vi-spin{transform-origin:center;animation:vi-spin .9s linear infinite}" +
      "@media (prefers-reduced-motion:reduce){.vi-spin{animation-duration:2.4s}}";
    document.head.appendChild(s);
    styleInjected = true;
  }

  /**
   * Devuelve el string SVG de un icono.
   * @param {string} name
   * @param {{size?:number, strokeWidth?:number, color?:string,
   *          className?:string, direction?:string, spin?:boolean,
   *          ariaLabel?:string}} [opts]
   * @returns {string}
   */
  function render(name, opts) {
    opts = opts || {};
    var inner = PATHS[name];
    if (!inner) {
      if (global.console) console.warn('[VictorIcons] icono desconocido: "' + name + '"');
      return "";
    }
    var size = opts.size || 24;
    var sw = opts.strokeWidth || 2;
    var stroke = opts.color || "currentColor";
    var cls = opts.className || "";
    if (opts.spin) {
      injectSpinStyle();
      cls = (cls + " vi-spin").trim();
    }
    var rot =
      opts.direction != null && DIRECTION_ROTATION[opts.direction] != null
        ? DIRECTION_ROTATION[opts.direction]
        : 0;
    var transform = rot ? ' style="transform:rotate(' + rot + 'deg)"' : "";
    var a11y = opts.ariaLabel
      ? ' role="img" aria-label="' + opts.ariaLabel + '"'
      : ' aria-hidden="true"';

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="' + sw +
      '" stroke-linecap="butt" stroke-linejoin="miter"' +
      (cls ? ' class="' + cls + '"' : "") + transform + a11y + ">" + inner + "</svg>"
    );
  }

  /**
   * Inyecta el icono en un elemento del DOM.
   */
  function inject(el, name, opts) {
    if (!el) return;
    el.innerHTML = render(name, opts);
  }

  /**
   * Procesa todos los [data-victor-icon] del documento.
   * Atributos soportados: data-victor-icon, data-size, data-stroke,
   * data-color, data-direction, data-spin, data-label.
   */
  function mountAll(root) {
    root = root || (typeof document !== "undefined" ? document : null);
    if (!root) return;
    var nodes = root.querySelectorAll("[data-victor-icon]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      inject(el, el.getAttribute("data-victor-icon"), {
        size: el.getAttribute("data-size") ? +el.getAttribute("data-size") : undefined,
        strokeWidth: el.getAttribute("data-stroke") ? +el.getAttribute("data-stroke") : undefined,
        color: el.getAttribute("data-color") || undefined,
        direction: el.getAttribute("data-direction") || undefined,
        spin: el.hasAttribute("data-spin"),
        ariaLabel: el.getAttribute("data-label") || undefined
      });
    }
  }

  var VictorIcons = {
    render: render,
    inject: inject,
    mountAll: mountAll,
    names: Object.keys(PATHS),
    paths: PATHS
  };

  // Auto-mount al cargar el DOM
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { mountAll(); });
    } else {
      mountAll();
    }
  }

  // Export (UMD-lite)
  if (typeof module !== "undefined" && module.exports) module.exports = VictorIcons;
  global.VictorIcons = VictorIcons;
})(typeof window !== "undefined" ? window : this);
