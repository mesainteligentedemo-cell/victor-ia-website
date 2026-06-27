"""
Actualiza service.html para usar marble-svc-XX.webp en lugar de svc-bg-XX.jpg
"""

filepath = r"C:\Users\inbou\victor-ia-website\archive\service.html"

with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Reemplazos directos: svc-bg-XX.jpg → marble-white/marble-svc-XX.webp
replacements = {
    "assets/svc-bg-01.jpg": "assets/marble-white/marble-svc-01.webp",
    "assets/svc-bg-02.jpg": "assets/marble-white/marble-svc-02.webp",
    "assets/svc-bg-03.jpg": "assets/marble-white/marble-svc-03.webp",
    "assets/svc-bg-04.jpg": "assets/marble-white/marble-svc-04.webp",
    "assets/svc-bg-05.jpg": "assets/marble-white/marble-svc-05.webp",
    "assets/svc-bg-06.jpg": "assets/marble-white/marble-svc-06.webp",
    "assets/svc-bg-07.jpg": "assets/marble-white/marble-svc-07.webp",
    "assets/svc-bg-08.jpg": "assets/marble-white/marble-svc-08.webp",
    "assets/svc-bg-09.jpg": "assets/marble-white/marble-svc-09.webp",
    "assets/svc-bg-10.jpg": "assets/marble-white/marble-svc-10.webp",
    "assets/svc-bg-11.jpg": "assets/marble-white/marble-svc-11.webp",
    "assets/svc-bg-12.jpg": "assets/marble-white/marble-svc-12.webp",
    "assets/svc-bg-13.jpg": "assets/marble-white/marble-svc-13.webp",
    "assets/svc-bg-14.jpg": "assets/marble-white/marble-svc-14.webp",
    "assets/svc-bg-15.jpg": "assets/marble-white/marble-svc-15.webp",
    "assets/svc-bg-16.jpg": "assets/marble-white/marble-svc-16.webp",
    "assets/svc-bg-17.jpg": "assets/marble-white/marble-svc-17.webp",
    "assets/svc-bg-18.jpg": "assets/marble-white/marble-svc-18.webp",
}

count = 0
for old, new in replacements.items():
    if old in html:
        html = html.replace(old, new)
        count += 1
        print(f"  replaced: {old} -> {new}")
    else:
        print(f"  SKIP (not found): {old}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"\nDONE — {count} reemplazos en service.html")
