/**
 * Victor Brand Icons — Sistema de Iconografía Geométrica
 * ADN visual: ángulos rectos, triángulos, líneas a 45-60-90°
 * Sin curvas (no arc, no quadratic). Solo paths rectos.
 * viewBox 18×18, stroke #B89A6A (gold), strokeWidth 1.2, fill none
 * stroke-linecap: butt | stroke-linejoin: miter
 *
 * Uso como SVG inline: VictorIcons.getSVG('agentes_maestros', 18)
 * Uso en JS: VictorIcons.icons.agentes_maestros
 */

const VictorIcons = {

  /**
   * Mapa de iconos: id → SVG inner paths (sin el wrapper <svg>)
   * Para inyectar: document.querySelector('.icon-box').innerHTML = VictorIcons.render('id')
   */
  icons: {

    // 1. AGENTES MAESTROS — Triángulo apex (V) + línea horizontal base
    agentes_maestros: `<path d="M3 16 L9 4 L15 16" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt" stroke-linejoin="miter"/>
<line x1="4.5" y1="12.5" x2="13.5" y2="12.5" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt"/>`,

    // 2. CREATIVIDAD — Dos triángulos opuestos ▲▼ (centrados)
    creatividad: `<path d="M9 3 L15 10 L3 10 Z" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<path d="M9 15 L3 8 L15 8 Z" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>`,

    // 3. DISEÑO ESPECIALIZADO — Rombo ◇ con línea vertical interna
    diseno_especializado: `<path d="M9 2 L16 9 L9 16 L2 9 Z" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<line x1="9" y1="2" x2="9" y2="16" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.45"/>`,

    // 4. WEB Y LANDING — Tres líneas en cascada descendente
    web_y_landing: `<line x1="2" y1="5" x2="16" y2="5" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt"/>
<line x1="5" y1="9" x2="16" y2="9" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt"/>
<line x1="8" y1="13" x2="16" y2="13" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt"/>`,

    // 5. VIDEO Y MEDIOS — Triángulo play geométrico puro ▶
    video_y_medios: `<path d="M4 3 L14 9 L4 15 Z" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>`,

    // 6. AUTOMATIZACION Y SCRAPING — Zig-zag /\/\ con 4 segmentos
    automatizacion_y_scraping: `<path d="M2 12 L6 6 L10 12 L14 6 L18 12" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt" stroke-linejoin="miter" fill="none"/>`,

    // 7. DEV Y CODIGO — Chevron-brackets < > angulares
    dev_y_codigo: `<path d="M7 4 L2 9 L7 14" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt" stroke-linejoin="miter" fill="none"/>
<path d="M11 4 L16 9 L11 14" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt" stroke-linejoin="miter" fill="none"/>`,

    // 8. IT Y TECNOLOGIA — Cuadrícula 3×3 (9 puntos de intersección)
    it_y_tecnologia: `<line x1="2" y1="2" x2="2" y2="16" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.4"/>
<line x1="9" y1="2" x2="9" y2="16" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.4"/>
<line x1="16" y1="2" x2="16" y2="16" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.4"/>
<line x1="2" y1="2" x2="16" y2="2" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.4"/>
<line x1="2" y1="9" x2="16" y2="9" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.4"/>
<line x1="2" y1="16" x2="16" y2="16" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt"/>`,

    // 9. SEO Y CONTENIDO — Lupa angular (cuadrado + línea diagonal)
    seo_y_contenido: `<rect x="2" y="2" width="10" height="10" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<line x1="12" y1="12" x2="16" y2="16" stroke="#B89A6A" stroke-width="1.8" stroke-linecap="butt"/>`,

    // 10. ESTRATEGIA NEGOCIOS — Escaleras ascendentes (3 escalones)
    estrategia_negocios: `<path d="M2 14 L2 10 L7 10 L7 6 L12 6 L12 2 L16 2" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt" stroke-linejoin="miter" fill="none"/>
<line x1="2" y1="14" x2="16" y2="14" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt" opacity="0.35"/>`,

    // 11. INTEGRACIONES — Dos cuadrados conectados por línea central
    integraciones: `<rect x="1" y="5" width="6" height="8" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<rect x="11" y="5" width="6" height="8" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<line x1="7" y1="9" x2="11" y2="9" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt"/>`,

    // 12. ANALITICA DATOS — Barras gráfico ascendentes (3 barras)
    analitica_datos: `<line x1="3" y1="14" x2="3" y2="8" stroke="#B89A6A" stroke-width="2.5" stroke-linecap="butt"/>
<line x1="9" y1="14" x2="9" y2="5" stroke="#B89A6A" stroke-width="2.5" stroke-linecap="butt"/>
<line x1="15" y1="14" x2="15" y2="2" stroke="#B89A6A" stroke-width="2.5" stroke-linecap="butt"/>
<line x1="1" y1="14" x2="17" y2="14" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.4"/>`,

    // 13. SEGURIDAD — Escudo geométrico (pentágono plano)
    seguridad: `<path d="M9 2 L16 5 L16 10 L9 16 L2 10 L2 5 Z" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<line x1="9" y1="7" x2="9" y2="12" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.45"/>`,

    // 14. MACHINE LEARNING — Cruz/neurona (+) con puntos de nodo
    machine_learning: `<line x1="9" y1="2" x2="9" y2="16" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt"/>
<line x1="2" y1="9" x2="16" y2="9" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt"/>
<line x1="4" y1="4" x2="14" y2="14" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.35"/>
<line x1="14" y1="4" x2="4" y2="14" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.35"/>`,

    // 15. MARKETING — Target cuadrados concéntricos (3 cuadrados)
    marketing: `<rect x="2" y="2" width="14" height="14" stroke="#B89A6A" stroke-width="1.1" stroke-linejoin="miter" fill="none" opacity="0.35"/>
<rect x="5" y="5" width="8" height="8" stroke="#B89A6A" stroke-width="1.1" stroke-linejoin="miter" fill="none" opacity="0.6"/>
<rect x="7.5" y="7.5" width="3" height="3" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>`,

    // 16. SALES — Flecha diagonal ascendente con doble línea //
    sales: `<line x1="3" y1="15" x2="13" y2="5" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt"/>
<path d="M8 5 L13 5 L13 10" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt" stroke-linejoin="miter" fill="none"/>
<line x1="5" y1="17" x2="15" y2="7" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.35"/>`,

    // 17. DISEÑO UX UI — Interfaz wireframe (rectángulo + 2 líneas internas)
    diseno_ux_ui: `<rect x="2" y="3" width="14" height="12" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<line x1="2" y1="7" x2="16" y2="7" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.5"/>
<line x1="5" y1="10" x2="11" y2="10" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.5"/>`,

    // 18. EDUCACION CAPACITACION — Libro abierto \ / (dos triángulos)
    educacion_capacitacion: `<path d="M9 4 L9 15" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" opacity="0.4"/>
<path d="M2 3 L9 5 L9 15 L2 13 Z" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<path d="M16 3 L9 5 L9 15 L16 13 Z" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>`,

    // 19. FOTOGRAFIA VISUAL — Cámara geométrica + diamond lens central
    fotografia_visual: `<rect x="2" y="6" width="14" height="10" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<path d="M6 6 L7 3 L11 3 L12 6" stroke="#B89A6A" stroke-width="1.1" stroke-linejoin="miter" fill="none"/>
<path d="M9 8 L11 11 L9 14 L7 11 Z" stroke="#B89A6A" stroke-width="1.1" stroke-linejoin="miter" fill="none" opacity="0.55"/>`,

    // 20. SISTEMAS PROCESOS — Flujo zig diagonal (4 nodos conectados)
    sistemas_procesos: `<rect x="1" y="2" width="5" height="4" stroke="#B89A6A" stroke-width="1.1" stroke-linejoin="miter" fill="none" opacity="0.6"/>
<rect x="7" y="7" width="5" height="4" stroke="#B89A6A" stroke-width="1.1" stroke-linejoin="miter" fill="none" opacity="0.6"/>
<rect x="13" y="12" width="4" height="4" stroke="#B89A6A" stroke-width="1.2" stroke-linejoin="miter" fill="none"/>
<line x1="6" y1="4" x2="7" y2="9" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt"/>
<line x1="12" y1="9" x2="13" y2="14" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt"/>`,

    // 21. INTELIGENCIA ARTIFICIAL — V anidada doble (el ADN de la marca)
    inteligencia_artificial: `<path d="M2 4 L9 14 L16 4" stroke="#B89A6A" stroke-width="1.2" stroke-linecap="butt" stroke-linejoin="miter" fill="none"/>
<path d="M5 4 L9 10 L13 4" stroke="#B89A6A" stroke-width="1.1" stroke-linecap="butt" stroke-linejoin="miter" fill="none" opacity="0.5"/>`

  },

  /**
   * Renderiza el wrapper SVG completo con el icono indicado
   * @param {string} id — clave del icono (ej: 'agentes_maestros')
   * @param {number} size — tamaño en px (default: 18)
   * @returns {string} HTML string del SVG completo
   */
  render(id, size = 18) {
    const paths = this.icons[id] || this.icons.inteligencia_artificial;
    return `<svg width="${size}" height="${size}" fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
  },

  /**
   * Inyecta el icono en un elemento DOM
   * @param {string|Element} target — selector CSS o elemento DOM
   * @param {string} id — clave del icono
   * @param {number} size — tamaño en px
   */
  inject(target, id, size = 18) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) el.innerHTML = this.render(id, size);
  }

};

// Exportar para uso como módulo ES si el entorno lo soporta
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VictorIcons;
}
