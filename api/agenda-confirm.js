/**
 * Vercel Serverless Function — Confirmación de preparación de diagnóstico
 * Path:    /api/agenda-confirm
 * Method:  POST
 * Body:    { email, nombre?, empresa?, fecha?, hora?, checked_items[], confirmado:true, ... }
 *
 * Registra que el prospecto completó/leyó su lista de preparación y lo notifica
 * al equipo a través del webhook n8n "conversion" (mismo canal que el resto del sitio).
 * Responde: { success:true, mensaje:"Gracias, confirmamos tu preparación" }
 */

const N8N_WEBHOOK = 'https://n8n.srv1013903.hstgr.cloud/webhook/conversion';
const OWNER_EMAIL = 'mesainteligentedemo@gmail.com';

// Etiquetas legibles para cada item de la checklist
const ITEM_LABELS = {
  procesos: 'Procesos que más tiempo consumen (3–5)',
  costo:    'Costo mensual aproximado (horas × personas)',
  dolor:    'Principales puntos de dolor',
  decisor:  'Acceso a quien decide tecnología/presupuesto',
  intentos: 'Intentos previos de automatización'
};

function readJsonBody(req) {
  return new Promise((resolve) => {
    // Vercel suele parsear el body automáticamente
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

function isEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
  }

  const body = await readJsonBody(req);
  const {
    email = '',
    nombre = '',
    empresa = '',
    fecha = '',
    hora = '',
    confirmado = false
  } = body;

  const checkedItems = Array.isArray(body.checked_items) ? body.checked_items : [];

  // Validación mínima — email o confirmación explícita
  if (!confirmado && checkedItems.length === 0) {
    res.statusCode = 422;
    return res.end(JSON.stringify({ success: false, error: 'Nada que confirmar' }));
  }
  if (email && !isEmail(email)) {
    res.statusCode = 422;
    return res.end(JSON.stringify({ success: false, error: 'Email inválido' }));
  }

  const checkedLabels = checkedItems
    .map((k) => ITEM_LABELS[k] || k)
    .filter(Boolean);

  const resumen =
    `Preparación de diagnóstico confirmada — ${checkedLabels.length}/5 puntos listos` +
    (checkedLabels.length ? `: ${checkedLabels.join(' · ')}` : '.');

  const payload = {
    tipo: 'agenda_prep_confirm',
    source: 'preparacion-diagnostico · victor-ia.xyz',
    nombre: nombre || '—',
    email: email || '—',
    empresa: empresa || '—',
    fecha: fecha || '—',
    hora: hora || '—',
    checked_items: checkedItems,
    checked_labels: checkedLabels,
    items_listos: `${checkedLabels.length}/5`,
    confirmado: true,
    mensaje: resumen,
    notify_to: OWNER_EMAIL,
    ts: new Date().toISOString()
  };

  // Notificar al equipo vía n8n. La confirmación al usuario se devuelve siempre,
  // aunque el webhook falle, para no bloquear su flujo.
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    }).catch(() => {});
    clearTimeout(t);
  } catch (_) {
    // swallow — la confirmación al usuario no depende del webhook
  }

  console.log('[agenda-confirm]', {
    email: email || '—',
    empresa: empresa || '—',
    items: checkedItems.length,
    ts: payload.ts
  });

  res.statusCode = 200;
  return res.end(JSON.stringify({
    success: true,
    mensaje: 'Gracias, confirmamos tu preparación',
    items_confirmados: checkedItems.length
  }));
};