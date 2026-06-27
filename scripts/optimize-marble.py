"""
Optimiza las imágenes de mármol para Victor IA:
- bg-marble.png → marble-home.webp (home)
- svc-bg-01..19 → marble-agentes, marble-como-funciona, etc.
- Brightness +40%, Saturation -20%, mantener contraste
- Output: assets/marble-white/ (WebP)
"""

from PIL import Image, ImageEnhance, ImageFilter
import os
import sys

# Directorio base
BASE = r"C:\Users\inbou\victor-ia-website\assets"
OUT  = os.path.join(BASE, "marble-white")
os.makedirs(OUT, exist_ok=True)

# Mapa: nombre_salida → archivo_fuente
# Páginas principales usan svc-bg variados; home usa bg-marble.png
MARBLE_MAP = {
    "marble-home":          "bg-marble.png",       # index.html
    "marble-agentes":       "svc-bg-05.jpg",       # Agentes IA — textura neutra azul-gris
    "marble-como-funciona": "svc-bg-01.jpg",       # Cómo Funciona — mármol clásico
    "marble-precios":       "svc-bg-13.jpg",       # Precios — tono cálido
    "marble-telemetria":    "svc-bg-06.jpg",       # Telemetría — tonos fríos
    # Adicionales para páginas de servicio (svc-bg 01-19)
    "marble-svc-01":  "svc-bg-01.jpg",
    "marble-svc-02":  "svc-bg-02.jpg",
    "marble-svc-03":  "svc-bg-03.jpg",
    "marble-svc-04":  "svc-bg-04.jpg",
    "marble-svc-05":  "svc-bg-05.jpg",
    "marble-svc-06":  "svc-bg-06.jpg",
    "marble-svc-07":  "svc-bg-07.jpg",
    "marble-svc-08":  "svc-bg-08.jpg",
    "marble-svc-09":  "svc-bg-09.jpg",
    "marble-svc-10":  "svc-bg-10.jpg",
    "marble-svc-11":  "svc-bg-11.jpg",
    "marble-svc-12":  "svc-bg-12.jpg",
    "marble-svc-13":  "svc-bg-13.jpg",
    "marble-svc-14":  "svc-bg-14.jpg",
    "marble-svc-15":  "svc-bg-15.jpg",
    "marble-svc-16":  "svc-bg-16.jpg",
    "marble-svc-17":  "svc-bg-17.jpg",
    "marble-svc-18":  "svc-bg-18.jpg",
}

def optimize_marble(src_name, out_name):
    src_path = os.path.join(BASE, src_name)
    out_path = os.path.join(OUT, out_name + ".webp")

    if not os.path.exists(src_path):
        print(f"  SKIP (no existe): {src_name}")
        return None

    with Image.open(src_path) as img:
        # Convertir a RGB si es necesario (PNG puede ser RGBA)
        if img.mode in ("RGBA", "P", "LA"):
            img = img.convert("RGB")

        # Redimensionar a max 2560px wide (mantener ratio)
        max_w = 2560
        if img.width > max_w:
            ratio = max_w / img.width
            new_h = int(img.height * ratio)
            img = img.resize((max_w, new_h), Image.LANCZOS)

        # 1. Brightness +42%
        img = ImageEnhance.Brightness(img).enhance(1.42)

        # 2. Saturation -20% (multiply by 0.80)
        img = ImageEnhance.Color(img).enhance(0.80)

        # 3. Contrast ligero: +5% para no aplanar
        img = ImageEnhance.Contrast(img).enhance(1.05)

        # 4. Guardar como WebP quality 88
        img.save(out_path, "WEBP", quality=88, method=6)
        size_kb = os.path.getsize(out_path) // 1024
        print(f"  OK  {out_name}.webp — {size_kb} KB  (src: {src_name})")
        return out_path

print("=" * 60)
print("Victor IA — Marble Optimizer")
print(f"Output: {OUT}")
print("=" * 60)

urls = {}
for out_name, src_name in MARBLE_MAP.items():
    result = optimize_marble(src_name, out_name)
    if result:
        # URL relativa para usar en HTML/CSS
        urls[out_name] = f"assets/marble-white/{out_name}.webp"

print()
print("URLs generadas (relativas desde raíz del proyecto):")
for k, v in urls.items():
    print(f"  {k}: {v}")

print()
print("DONE — revisa assets/marble-white/")