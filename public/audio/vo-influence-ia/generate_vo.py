#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Generador de 4 audios VO Victor IA (INFLUENCE IA S.A. DE C.V.)
ElevenLabs with-timestamps · voz Victor (Enrique Mondragon) · espanol MX.
Produce: .mp3 + .json (alignment palabra-por-palabra) + reporte de duracion.
"""
import os, json, base64, sys, wave, contextlib
import urllib.request

API_KEY  = "sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67"
VOICE_ID = "iDEmt5MnqUotdwCIVplo"
MODEL    = "eleven_multilingual_v2"
OUT_DIR  = os.path.dirname(os.path.abspath(__file__))

# Texto limpio para TTS. Los "..." se mantienen para que el modelo genere pausas.
SCRIPTS = {
"01_hyperframes_60s": (
"En Victor IA no vendemos tecnologia. Construimos negocios que piensan, "
"que aprenden... y que crecen contigo. Desde Playa del Carmen, para todo Mexico. "
"Disenamos sitios web de lujo. Automatizamos lo que te quita el tiempo. "
"Creamos video y contenido que vende. Y hacemos algo que nadie mas hace en Mexico: "
"interfaces verdaderamente inclusivas, y un Agente de Reactivacion que despierta a "
"tus clientes dormidos. Dieciocho servicios. Una sola obsesion: que tu negocio gane. "
"Y los resultados? Hablan solos. Tres punto dos veces mas retorno de inversion. "
"Sesenta y ocho por ciento mas conversion. Cuarenta por ciento menos costos. "
"Cincuenta y cinco por ciento menos tiempo perdido. Esto no es promesa de vendedor. "
"Son numeros reales, de clientes reales. El futuro de tu negocio no se espera. "
"Se construye. Y nosotros sabemos como. Victor IA. Inteligencia que entiende tu negocio. "
"Hablemos hoy."
),
"02_motion_30s": (
"Tu negocio trabaja duro. Pero el esfuerzo solo... ya no alcanza. "
"Y si tu negocio pudiera pensar? Aprender de cada cliente. Decidir... mientras tu descansas. "
"Eso es Victor IA. Inteligencia que entiende tu negocio de verdad. No plantillas. "
"No copiar y pegar. Tecnologia hecha a tu medida, desde Mexico. "
"Crece con IA que entiende tu negocio. Victor IA. Atrevete."
),
"03_remotion_45s": (
"Todos prometen resultados. Nosotros los medimos. Estos son los numeros reales de Victor IA. "
"Sin maquillaje. Empecemos por lo que mas importa: el dinero. Tres punto dos veces. "
"Eso es lo que multiplica tu inversion, en promedio, con nosotros. "
"Mas visitas no es igual a mas ventas? Lo sabemos. Por eso subimos tu conversion un "
"sesenta y ocho por ciento. Visitantes que si compran. "
"Y mientras ganas mas, gastas menos. Cuarenta por ciento menos en costos. "
"Cincuenta y cinco por ciento menos tiempo perdido en tareas que la IA hace por ti. "
"Mas retorno. Mas ventas. Menos costos. Menos tiempo. "
"Cuatro numeros que cambian tu negocio. Victor IA. Resultados que se miden."
),
"04_scroll_90s": (
"Hay una diferencia entre construir... y crear. Entre lo que funciona... y lo que enamora. "
"Aqui, en Victor IA, empezamos donde otros terminan: en el detalle. "
"El marmol no es decoracion. Es filosofia. Cada veta, unica. Imposible de copiar. "
"Como tu negocio. Trabajamos asi: con la paciencia del artesano y la precision de la maquina. "
"Lujo que no grita. Lujo que se siente. "
"Disenamos mundos donde tu marca vive. Sitios que se sienten como entrar a otro lugar. "
"Automatizaciones invisibles que trabajan en silencio. Video que detiene el scroll. "
"E interfaces inclusivas... porque la belleza que excluye, no es belleza. "
"Dieciocho formas de hacerte crecer. "
"Todo esto nace en un solo lugar: Playa del Carmen. Donde el Caribe se vuelve idea, "
"y la idea se vuelve tecnologia. Inteligencia con alma mexicana. "
"Disenada para un mundo que no se conforma. "
"Victor IA. No seguimos tendencias. Las creamos. "
"Bienvenido a la inteligencia con identidad."
),
}

# Ajustes de voz por video (estabilidad / similitud / estilo)
VOICE_SETTINGS = {
"01_hyperframes_60s": {"stability":0.45,"similarity_boost":0.80,"style":0.35,"use_speaker_boost":True},
"02_motion_30s":      {"stability":0.40,"similarity_boost":0.82,"style":0.45,"use_speaker_boost":True},
"03_remotion_45s":    {"stability":0.55,"similarity_boost":0.80,"style":0.25,"use_speaker_boost":True},
"04_scroll_90s":      {"stability":0.60,"similarity_boost":0.85,"style":0.20,"use_speaker_boost":True},
}

def chars_to_words(text, chars, starts, ends):
    """Agrupa alignment por caracteres en palabras con start/end."""
    words=[]; cur=""; w_start=None; w_end=None
    for ch,s,e in zip(chars,starts,ends):
        if ch==" ":
            if cur:
                words.append({"word":cur,"start":round(w_start,3),"end":round(w_end,3)})
                cur=""; w_start=None
        else:
            if w_start is None: w_start=s
            cur+=ch; w_end=e
    if cur:
        words.append({"word":cur,"start":round(w_start,3),"end":round(w_end,3)})
    return words

def gen(name, text):
    settings = VOICE_SETTINGS[name]
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps"
    payload = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": settings,
    }).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
    }, method="POST")
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.loads(r.read().decode())

    mp3 = base64.b64decode(data["audio_base64"])
    mp3_path = os.path.join(OUT_DIR, name+".mp3")
    with open(mp3_path,"wb") as f: f.write(mp3)

    al = data.get("alignment") or data.get("normalized_alignment") or {}
    chars  = al.get("characters",[])
    starts = al.get("character_start_times_seconds",[])
    ends   = al.get("character_end_times_seconds",[])
    words  = chars_to_words(text, chars, starts, ends) if chars else []
    duration = round(ends[-1],3) if ends else 0.0

    out = {
        "name": name,
        "voice_id": VOICE_ID,
        "model": MODEL,
        "duration_seconds": duration,
        "word_count": len(words),
        "voice_settings": settings,
        "words": words,
    }
    with open(os.path.join(OUT_DIR,name+".json"),"w",encoding="utf-8") as f:
        json.dump(out,f,ensure_ascii=False,indent=2)
    return duration, len(words), mp3_path

if __name__=="__main__":
    results={}
    for name,text in SCRIPTS.items():
        try:
            d,wc,p = gen(name,text)
            results[name]={"duration":d,"words":wc,"file":p}
            print(f"OK  {name}  dur={d}s  words={wc}")
        except Exception as ex:
            results[name]={"error":str(ex)}
            print(f"ERR {name}: {ex}")
    print("---RESULTS---")
    print(json.dumps(results,ensure_ascii=False))
