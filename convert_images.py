from PIL import Image
import os

src_dir = r'C:\Users\inbou\Desktop\marble-normalize\output'
dst_dir = r'C:\Users\inbou\victor-ia-website\assets'

files = sorted([f for f in os.listdir(src_dir) if f.endswith('.png')])
print(f"Found {len(files)} images")

for i, fname in enumerate(files, 1):
    src = os.path.join(src_dir, fname)
    dst = os.path.join(dst_dir, f'svc-bg-{i:02d}.jpg')
    img = Image.open(src).convert('RGB')
    # Resize to max 1400px height (portrait images), preserving aspect
    w, h = img.size
    if h > 1400:
        ratio = 1400 / h
        img = img.resize((int(w * ratio), 1400), Image.LANCZOS)
    img.save(dst, 'JPEG', quality=86)
    size_mb = os.path.getsize(dst) / 1024 / 1024
    print(f"  svc-bg-{i:02d}.jpg  {fname[:30]}...  ({size_mb:.1f}MB)")

print("Done.")