/**
 * Vercel Serverless Function — Agenda de diagnóstico
 * Path:    /api/agenda
 * Method:  POST
 * Body:    { email, nombre?, empresa?, fecha?, hora?, ... }
 *
 * Construye la confirmación de la cita e incluye SIEMPRE el bloque de preparación
 * con un enlace personalizado a /preparacion-diagnostico (todos los parámetros
 * URL-encoded). Notifica al equipo vía el webhook n8n "conversion".
 */

const SITE = 'https://victor-ia.xyz';
const N8N_WEBHOOK = 'https://n8n.srv1013903.hstgr.cloud/webhook/conversion';
const OWNER_EMAIL = 'mesainteligentedemo@gmail.com';

/**
 * checkItem — genera el bloque de preparación de la cita.
 * Devuelve el texto + HTML con el link a la lista de preparación del prospecto,
 * con email, fecha, hora, empresa y nombre debidamente URL-encoded.
 *
 * @param {Object} appt { email, fecha, hora, empresa, nombre }
 * @returns {{ url:string, text:string, html:string }}
 */
function checkItem(appt = {}) {
  const e = (v) => encodeURIComponent(v == null ? '' : String(v));
  const qs =
    'email='   + e(appt.email)   +
    '&fecha='  + e(appt.fecha)   +
    '&hora='   + e(appt.hora)    +
    '&empresa=' + e(appt.empresa) +
    '&nombre=' + e(appt.nombre);

  const url = `${SITE}/preparacion-diagnostico?${qs}`;

  const text =
    'Revisa tu lista de preparación → ' + url +
    '\nLlega listo a tu diagnóstico: prepara tus procesos clave, costos y puntos de dolor.';

  const html =
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;width:100%">' +
      '<tr><td style="background:#101015;border:1px solid rgba(205,178,140,.18);border-radius:14px;padding:24px 26px;font-family:Helvetica,Arial,sans-serif">' +
        '<p style="margin:0 0 6px;color:#B89A6A;font-size:11px;letter-spacing:.22em;text-transform:uppercase">Antes de tu diagnóstico</p>' +
        '<p style="margin:0 0 16px;color:#EDEAE3;font-size:16px;line-height:1.5">Revisa tu lista de preparación para aprovechar al máximo tu sesión de 30 minutos.</p>' +
        '<a href="' + url + '" ' +
          'style="display:inline-block;background:#B89A6A;color:#0b0b0d;text-decoration:none;' +
          'font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:.04em;' +
          'padding:14px 30px;border-radius:8px">Ver mi lista de preparación →</a>' +
      '</td></tr>' +
    '</table>';

  return { url, text, html };
}

function readJsonBody(req) {
  return new Promise((resolve) => {
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

async function handler(req, res) {
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
    hora = ''
  } = body;

  const prep = checkItem({ email, nombre, empresa, fecha, hora });

  const payload = {
    tipo: 'agenda_booking',
    source: 'agenda-api · victor-ia.xyz',
    nombre: nombre || '—',
    email: email || '—',
    empresa: empresa || '—',
    fecha: fecha || '—',
    hora: hora || '—',
    prep_url: prep.url,
    mensaje: `Cita agendada — ${fecha || 's/f'} ${hora || ''}. ${prep.text}`,
    notify_to: OWNER_EMAIL,
    ts: new Date().toISOString()
  };

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
  } catch (_) { /* no bloquear */ }

  res.statusCode = 200;
  return res.end(JSON.stringify({
    success: true,
    mensaje: 'Cita registrada. Revisa tu lista de preparación.',
    prep_url: prep.url,
    prep_html: prep.html
  }));
}

module.exports = handler;
module.exports.checkItem = checkItem;