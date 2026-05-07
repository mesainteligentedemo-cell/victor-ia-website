from PIL import Image, ImageFilter, ImageDraw, ImageChops
import numpy as np, os

src = r'C:/Users/inbou/Desktop/marble-normalize/output/hf_20260506_230408_e43ddbb8-548f-47db-81db-218c39873660.png'
dst_dir = r'C:/Users/inbou/victor-ia-website/assets'
os.makedirs(dst_dir, exist_ok=True)

print("Cargando...")
img = Image.open(src).convert('RGB')
W, H = img.size

# El vortice oscuro esta en el area inferior-izquierda
# Vamos a cubrirlo tomando un parche de marble de la parte SUPERIOR de la imagen
# y pegandolo sobre el vortice con blending suave

# Region del ojo (en pixeles del original):
eye_x1, eye_x2 = 0, int(W * 0.60)
eye_y1, eye_y2 = int(H * 0.72), H  # ultimo 28% inferior-izquierdo
eye_w = eye_x2 - eye_x1
eye_h = eye_y2 - eye_y1

# Fuente de textura: una franja de marble de la parte media-superior
# que tiene buen swirl marble sin elementos oscuros
src_y1, src_y2 = int(H * 0.10), int(H * 0.38)
src_strip = img.crop((0, src_y1, W, src_y2))
src_h = src_y2 - src_y1

# Escalar la franja al tamano del area del ojo y voltear para que no se repita exacto
patch = src_strip.crop((0, 0, eye_w, min(src_h, eye_h)))
if patch.size[1] < eye_h:
    # Si el parche es mas corto, repetir y flipear
    patch2 = src_strip.crop((0, 0, eye_w, eye_h - patch.size[1])).transpose(Image.FLIP_TOP_BOTTOM)
    combined = Image.new('RGB', (eye_w, eye_h))
    combined.paste(patch, (0, 0))
    combined.paste(patch2, (0, patch.size[1]))
    patch = combined
else:
    patch = patch.crop((0, 0, eye_w, eye_h))

# Aclarar ligeramente el parche para que sea consistente con la zona
patch_arr = np.array(patch, dtype=np.float32)
patch_arr = np.clip(patch_arr * 1.05, 0, 255)  # +5% brillo
patch = Image.fromarray(patch_arr.astype(np.uint8))

# Mascara de blending: gradiente suave con ellipse mayor para cubrir bien el vortice
full_canvas = Image.new('RGB', (W, H))
full_canvas.paste(img)
full_canvas.paste(patch, (eye_x1, eye_y1))

# Crear mascara de fusion suave (gradient en bordes)
mask = Image.new('L', (W, H), 0)
draw = ImageDraw.Draw(mask)
# Rectang completo de la region
draw.rectangle([eye_x1, eye_y1, eye_x2, eye_y2], fill=255)
# Blur para suavizar bordes (feathering)
mask = mask.filter(ImageFilter.GaussianBlur(radius=200))

# Composite: full_canvas (con el parche) sobre original, segun mascara
result = Image.composite(full_canvas, img, mask)

# Blur suave final solo en la zona de union
result_arr = np.array(result, dtype=np.float32)
blurred_arr = np.array(result.filter(ImageFilter.GaussianBlur(radius=40)), dtype=np.float32)

# Solo aplicar el blur en una franja cerca del borde de la mascara
# (donde la mascara esta entre 30-70% de opacidad)
mask_arr = np.array(mask, dtype=np.float32) / 255.0
edge_zone = (mask_arr > 0.15) & (mask_arr < 0.85)
edge_zone_3 = edge_zone[:, :, np.newaxis]
result_arr = np.where(edge_zone_3, blurred_arr, result_arr)
result_final = Image.fromarray(np.clip(result_arr, 0, 255).astype(np.uint8))

# Guardar
out = dst_dir + '/bg-full.jpg'
result_final.save(out, 'JPEG', quality=88)
print(f"Guardado {os.path.getsize(out)/1024/1024:.1f}MB: {out}")

thumb = result_final.resize((400, 716))
thumb.save(dst_dir + '/bg-full-preview.jpg', quality=80)
print("Preview guardado.")