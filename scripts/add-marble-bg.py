"""
Agrega el sistema de mármol blanco a las 4 páginas principales de Victor IA.
Usa str.replace() en Python puro, sin regex complejos.
"""

import sys

def add_marble(filepath, marble_url, opacity, bg_pos="50% 30%", old_body_bg=None, new_body_bg=None):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Cambiar background del body si se especifica
    if old_body_bg and new_body_bg:
        html = html.replace(old_body_bg, new_body_bg, 1)

    # 2. Insertar CSS del marble antes del PRIMER </style>
    marble_css = (
        "\n/* ── Marble background ── */\n"
        f"#bg-marble-page{{position:fixed;inset:0;z-index:0;pointer-events:none;"
        f"background-image:url('{marble_url}');"
        f"background-size:cover;background-position:{bg_pos};opacity:{opacity};}}\n"
        "main{position:relative;z-index:10}\n"
    )
    html = html.replace("</style>", marble_css + "</style>", 1)

    # 3. Insertar <div id="bg-marble-page"> justo después de <body>
    # Buscar <body> seguido de cualquier whitespace y <div id="noise">
    target = '<body>'
    insert_div = '\n<div id="bg-marble-page"></div>'
    # Encontrar posición de <body>
    pos = html.find('<body>')
    if pos != -1:
        # Insertar el div después de <body>
        html = html[:pos + len('<body>')] + insert_div + html[pos + len('<body>'):]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  OK  {filepath}")

BASE = r"C:\Users\inbou\victor-ia-website"

print("Agregando marble backgrounds...")

# agentes.html — white theme, mármol visible al 50%
add_marble(
    filepath=f"{BASE}/agentes.html",
    marble_url="assets/marble-white/marble-agentes.webp",
    opacity=".50",
    bg_pos="50% 30%",
    old_body_bg="body{background:#FFFFFF;color:#000000;",
    new_body_bg="body{background:#F8F7F5;color:#000000;"
)

# como-funciona.html — dark theme, mármol sutil al 7%
add_marble(
    filepath=f"{BASE}/como-funciona.html",
    marble_url="assets/marble-white/marble-como-funciona.webp",
    opacity=".07",
    bg_pos="50% 20%"
)

# precios.html — dark theme, mármol sutil al 7%
add_marble(
    filepath=f"{BASE}/precios.html",
    marble_url="assets/marble-white/marble-precios.webp",
    opacity=".07",
    bg_pos="50% 40%"
)

# telemetria.html — dark theme, mármol sutil al 7%
add_marble(
    filepath=f"{BASE}/telemetria.html",
    marble_url="assets/marble-white/marble-telemetria.webp",
    opacity=".07",
    bg_pos="50% 50%"
)

print("DONE")