#!/usr/bin/env python3
"""
Fix flavour images:
- Replace cartoonish pineapple-coconut.png (flat vector, dark bg) with clear photographic bottle from public/images/drink1.png
- Sharpen blurry flavour images to make them clear
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance
import shutil

# Paths relative to project root
ROOT = Path(__file__).parent.parent
FLAVOUR_DIR = ROOT / "public" / "images" / "flavours"
DRINK1_SRC = ROOT / "public" / "images" / "drink1.png"
LEMON_REF = FLAVOUR_DIR / "lemon-lime.png"

# Config
BACKGROUND_COLOR = (252, 254, 249, 255)  # sampled from lemon-lime.png
TARGET_SIZE = (1200, 1200)

# 1. Backup cartoonish file
cartoon_path = FLAVOUR_DIR / "pineapple-coconut.png"
backup_path = FLAVOUR_DIR / "pineapple-coconut.cartoon.bak.png"
if cartoon_path.exists() and not backup_path.exists():
    shutil.copy2(cartoon_path, backup_path)
    print(f"Backed up cartoonish to {backup_path}")

# 2. Replace pineapple-coconut with clear bottle from drink1.png composited onto light bg
print("Replacing pineapple-coconut.png with clear photographic bottle...")
with Image.open(DRINK1_SRC).convert("RGBA") as src:
    # src is 569x1024 with transparent bg, can is photographic
    # Create 1200x1200 background
    new_img = Image.new("RGBA", TARGET_SIZE, BACKGROUND_COLOR)
    
    # Determine scale: Fit src into 1200x1200 with padding to mimic other flavours
    # Other flavours cans occupy ~45% width and ~85% height. We'll scale src to height 1050 if needed.
    # src height 1024, close to target, but we can scale slightly to fill better.
    # Let's target height 1020 leaving 90px top/bottom padding, width auto
    target_h = 1020
    orig_w, orig_h = src.size
    scale = target_h / orig_h
    # Only scale if src smaller or slightly larger, keep aspect
    new_w = int(orig_w * scale)
    new_h = target_h
    print(f"  Source size {orig_w}x{orig_h}, scaling to {new_w}x{new_h} (scale {scale:.3f})")
    
    resized = src.resize((new_w, new_h), Image.LANCZOS)
    
    # Center paste
    x = (TARGET_SIZE[0] - new_w) // 2
    y = (TARGET_SIZE[1] - new_h) // 2
    # Adjust y slightly up to mimic other cans which have shadow below (y -10)
    y -= 10
    
    new_img.alpha_composite(resized, dest=(x, y))
    
    # Convert to RGB (flatten) or keep RGBA? Other flavours are RGBA with opaque bg, so keep RGBA but fully opaque
    # Save as PNG with high quality
    new_img.save(cartoon_path, "PNG", optimize=True)
    print(f"  Saved new pineapple-coconut.png size {new_img.size} to {cartoon_path}, bytes {cartoon_path.stat().st_size}")

# 3. Sharpen blurry images (all except lemon-lime which is already clear, and pineapple which we just replaced)
blurry_files = [
    "baobab-berry.png",
    "blackcurrant-acai.png",
    "guava-chili.png",
    "hibiscus-raspberry.png",
    "mango-passion.png",
    "passion-lemonade.png",
    "tamarind-ginger.png",
    "watermelon-mint.png",
]

print("\nSharpening blurry flavour images to make them clear...")
for fname in blurry_files:
    fpath = FLAVOUR_DIR / fname
    if not fpath.exists():
        print(f"  SKIP {fname} not found")
        continue
    
    # Backup original blurry version
    bak = FLAVOUR_DIR / f"{fpath.stem}.blurry.bak.png"
    if not bak.exists():
        shutil.copy2(fpath, bak)
        print(f"  Backed up {fname} to {bak.name}")
    
    with Image.open(fpath).convert("RGBA") as im:
        orig_bytes = fpath.stat().st_size
        # Enhance pipeline
        # 1. UnsharpMask for edge clarity
        sharpened = im.filter(ImageFilter.UnsharpMask(radius=2.0, percent=170, threshold=1))
        # 2. Second pass Detail filter
        sharpened = sharpened.filter(ImageFilter.DETAIL)
        # 3. Enhance sharpness
        enhancer = ImageEnhance.Sharpness(sharpened)
        sharpened = enhancer.enhance(1.6)
        # 4. Slight contrast boost
        enhancer = ImageEnhance.Contrast(sharpened)
        sharpened = enhancer.enhance(1.08)
        # 5. Slight color boost
        enhancer = ImageEnhance.Color(sharpened)
        sharpened = enhancer.enhance(1.05)
        # 6. Optional brightness tweak
        # enhancer = ImageEnhance.Brightness(sharpened)
        # sharpened = enhancer.enhance(1.02)
        
        sharpened.save(fpath, "PNG", optimize=True)
        new_bytes = fpath.stat().st_size
        print(f"  Enhanced {fname}: {orig_bytes} -> {new_bytes} bytes (+{new_bytes-orig_bytes})")

print("\nDone. Summary:")
for p in sorted(FLAVOUR_DIR.glob("*.png")):
    if "bak" in p.name:
        continue
    with Image.open(p) as im:
        print(f"  {p.name}: {im.size} {p.stat().st_size} bytes")
