from PIL import Image
import os

# Convert bg.png from victor-ia-reveal to bg-light.jpg
src = r'C:\Users\inbou\victor-ia-reveal\bg.png'
dst = r'C:\Users\inbou\victor-ia-website\assets\bg-light.jpg'

img = Image.open(src).convert('RGB')
img.save(dst, 'JPEG', quality=90)
print(f"bg-light.jpg saved: {os.path.getsize(dst)/1024/1024:.1f}MB")