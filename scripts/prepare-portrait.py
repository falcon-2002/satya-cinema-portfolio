"""Generate responsive copies; never modify the supplied original PNG.

Requires Pillow only for asset preparation, not for running the portfolio.
"""
from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parent.parent / 'dist' / 'assets'
with Image.open(assets / 'satya-portrait.png') as original:
    for width in (420, 720, 1100):
        height = round(original.height * width / original.width)
        image = original.convert('RGB').resize((width, height), Image.Resampling.LANCZOS)
        target = assets / f'satya-portrait-{width}.webp'
        image.save(target, 'WEBP', quality=86, method=6)
        print(f'{target.name}: {width}x{height}, {target.stat().st_size} bytes')
