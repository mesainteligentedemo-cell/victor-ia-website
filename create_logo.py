import os, sys
from PIL import Image, ImageDraw, ImageFont

os.makedirs("assets/brand", exist_ok=True)
os.makedirs("assets/logos", exist_ok=True)

W, H = 600, 160
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

try:
    font_big = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 72)
    font_small = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 28)
except Exception:
    font_big = ImageFont.load_default()
    font_small = font_big

draw.text((10, 10), "VICTOR", font=font_big, fill=(255, 255, 255, 255))
bbox = draw.textbbox((10, 10), "VICTOR", font=font_big)
x_ia = bbox[2] + 14
draw.text((x_ia, 10), "IA", font=font_big, fill=(212, 175, 55, 255))
draw.text((12, 100), "Inteligencia Artificial - Estrategia - Resultados", font=font_small, fill=(180, 180, 180, 220))

img.save("assets/brand/logo-full.png", "PNG")
print("OK assets/brand/logo-full.png")

clients = [
    ("volkswagen","Volkswagen"),("hyatt","Hyatt"),("impression","Impression"),
    ("hacienda-soltepec","H. Soltepec"),("prime-mystic","Prime Mystic"),
    ("gran-chaka","Gran Chaka"),("aldea","ALDEA"),("chaka","Chaka"),
    ("lativa","LATIVA"),("luum","LU'UM"),("lolha","Lol-ha"),
    ("ssc","SSC"),("oxlajun","Ox'lajun"),("remi","Remi Creative"),
]

try:
    font_client = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
except Exception:
    font_client = ImageFont.load_default()

for slug, name in clients:
    ci = Image.new("RGBA", (240, 80), (0, 0, 0, 0))
    cd = ImageDraw.Draw(ci)
    cd.text((10, 20), name, font=font_client, fill=(200, 200, 200, 200))
    ci.save(f"assets/logos/{slug}.png", "PNG")
    print(f"OK assets/logos/{slug}.png")

print("Done.")
