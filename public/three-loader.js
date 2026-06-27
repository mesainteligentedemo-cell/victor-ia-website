// Three.js Lazy Loader — Carga dinámicamente Three.js solo si es necesario
(function () {
  'use strict';

  const SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  const THREE_ATTR = 'data-three'; // Atributo para identificar canvas que requiere Three.js
  const TIMEOUT = 10000; // Timeout en ms para carga

  function hasThreeCanvas() {
    // Busca cualquier elemento con data-three
    return document.querySelector('[' + THREE_ATTR + ']') !== null;
  }

  function loadThreeJS(callback) {
    if (typeof window.THREE !== 'undefined') {
      if (callback) callback();
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;

    let timeoutId;
    const handleLoad = function () {
      clearTimeout(timeoutId);
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      if (callback) callback();
    };

    const handleError = function () {
      clearTimeout(timeoutId);
      console.error('[Three Loader] Failed to load Three.js from ' + SCRIPT_URL);
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    timeoutId = setTimeout(function () {
      console.warn('[Three Loader] Timeout loading Three.js after ' + TIMEOUT + 'ms');
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    }, TIMEOUT);

    document.head.appendChild(script);
  }

  // Exportar función pública si se necesita carga manual
  window.VictorThreeLoader = {
    load: loadThreeJS,
    hasCanvas: hasThreeCanvas
  };

  // Auto-load si existe canvas con data-three
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (hasThreeCanvas()) {
        loadThreeJS();
      }
    });
  } else {
    // DOM ya cargado
    if (hasThreeCanvas()) {
      loadThreeJS();
    }
  }
})();
